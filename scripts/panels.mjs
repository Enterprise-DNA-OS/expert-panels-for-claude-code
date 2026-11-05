#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {getDb,REPO_ROOT} from './lib/db.mjs';
import {parseCsv,pick} from './lib/csv.mjs';
import {table as textTable} from './lib/format.mjs';
import {page,table,writeOut} from './lib/render.mjs';

export const reports={
 'experts':'select code,name,email,organisation,region,active,reviewed_on,retention_review from experts order by code',
 'panels':'select code,name,purpose,owner,starts_on,ends_on from panels order by code',
 'roles':'select p.code as panel,r.name as position,r.skill,r.minimum_level,r.seats from roles r join panels p on p.id=r.panel_id order by p.code,r.name',
 'roster':"select code,panel,expert,position,starts_on,ends_on,status,array_to_string(blockers,'; ') as blockers from v_term_readiness order by panel,position,expert",
 'coverage':'select code,panel,position,coverage_on,required,accepted,ready,gap from v_panel_coverage order by code,position',
 'term-renewals':"select code,panel,expert,position,ends_on from v_term_readiness where status='accepted' and ends_on between current_date and current_date+60 order by ends_on,code",
 'commitments':"select e.code,e.name,count(t.id)::int as active_terms,string_agg(p.code,', ' order by p.code) as panels from experts e left join terms t on t.expert_id=e.id and t.status='accepted' and t.starts_on<=current_date and t.ends_on>=current_date left join roles r on r.id=t.role_id left join panels p on p.id=r.panel_id group by e.id order by active_terms desc,e.code",
 'attention':'select kind,code,panel,subject,issue,due_on from v_attention order by due_on,code',
 'actions':"select a.code,p.code as panel,a.title,a.owner,a.due_on,a.completed_on,a.evidence from actions a join panels p on p.id=a.panel_id order by due_on,a.code",
 'stale':"select p.code,p.name,max(n.created_at)::date as last_note from panels p left join notes n on n.panel_id=p.id where p.ends_on>=current_date group by p.id having max(n.created_at) is null or max(n.created_at)<now()-interval '14 days' order by p.code",
 'compliance':`select 'term-readiness' as rule,code,expert as subject,array_to_string(blockers,'; ') as issue from v_term_readiness where status in ('proposed','accepted') and cardinality(blockers)>0
 union all select 'privacy-review',code,name,'Review accuracy, purpose, notice and retention evidence' from experts where reviewed_on is null or reviewed_on<current_date-365 or reviewed_on>current_date or retention_review is null or retention_review<current_date or purpose='' or notice_evidence='' order by rule,code`,
 'history':'select entity,record_id,operation,actor,created_at,before_record,after_record from audit order by created_at,id',
};
const mutations=['add-expert','update-expert','add-panel','add-role','record-skill','set-clearance','nominate','decide-term','close-term','add-action','complete-action','log-note','import'];
export const commands=['help',...Object.keys(reports),'eligibility',...mutations,'export','weekly-review','draft-appointment','draft-chase'];
const allowed={
 help:[],...Object.fromEntries(Object.keys(reports).map(x=>[x,[]])),
 eligibility:['panel','position','end'],
 'add-expert':['code','name','email','organisation','region','purpose','reviewed','retention','notice'],
 'update-expert':['expert','name','organisation','region','purpose','reviewed','retention','notice','active','reason'],
 'add-panel':['code','name','purpose','owner','start','end','freshness'],
 'add-role':['panel','position','skill','level','seats'],
 'record-skill':['expert','skill','level','until','evidence'],
 'set-clearance':['expert','panel','conflict','mitigation','nda-until','until','evidence'],
 nominate:['code','expert','panel','position','start','end'],
 'decide-term':['term','decision','evidence'], 'close-term':['term','evidence'],
 'add-action':['code','panel','title','owner','due'], 'complete-action':['action','evidence'], 'log-note':['panel','text'],
 import:['panel','start','end','dry-run'],export:['out'], 'weekly-review':[], 'draft-appointment':['term'],'draft-chase':['panel'],
};
function need(o,k){if(typeof o[k]!=='string'||!o[k].trim())throw Error(`Required --${k}=value`);return o[k].trim();}
function date(v){if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||new Date(v+'T00:00:00Z').toISOString().slice(0,10)!==v)throw Error(`Invalid date: ${v}`);return v;}
function number(v,min=1,max=1000){if(!/^\d+$/.test(String(v))||Number(v)<min||Number(v)>max)throw Error(`Expected integer ${min}..${max}`);return Number(v);}
function code(v){if(!/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(v))throw Error('Code must contain letters, digits, hyphens or underscores');return v.toUpperCase();}
function email(v){if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))throw Error(`Invalid email: ${v}`);return v.toLowerCase();}
export function parseArgs(args){const o={},pos=[];for(const a of args){if(a.startsWith('--')){const i=a.indexOf('=');const k=a.slice(2,i<0?undefined:i);if(k in o)throw Error(`Repeated flag --${k}`);o[k]=i<0?true:a.slice(i+1);}else pos.push(a);}return {command:pos.shift()||'help',o,pos};}
export async function resolve(db,table,value){
 if(!['experts','panels','terms','actions'].includes(table))throw Error('Unsupported lookup');
 const name=table==='terms'?'code':table==='actions'?'title':'name';
 const rows=await db.query(`select * from ${table} where lower(code)=lower($1) or lower(${name})=lower($1) or id::text=$1`,[value]);
 if(rows.length===1)return rows[0];
 const candidates=rows.length?rows:await db.query(`select * from ${table} where starts_with(id::text,lower($1)) or strpos(lower(${name}),lower($1))>0 order by code`,[value]);
 if(candidates.length!==1)throw Error(`${candidates.length?'Ambiguous':'No match'} ${table}: ${value}. Candidates: ${candidates.map(r=>`${r.code} ${r[name]}`).join(', ')||'(none)'}`);
 return candidates[0];
}
async function role(db,panel,position){const r=await db.query('select * from roles where panel_id=$1 and lower(name)=lower($2)',[panel.id,position]);if(r.length!==1)throw Error(`Unknown position ${position} on ${panel.code}`);return r[0];}
async function transaction(db,actor,fn,dry=false){await db.exec('BEGIN');try{await db.query("select set_config('app.actor',$1,true)",[actor]);await db.exec('LOCK TABLE experts,panels,roles,skills,clearances,terms,actions IN SHARE ROW EXCLUSIVE MODE');const result=await fn();await db.exec(dry?'ROLLBACK':'COMMIT');return result;}catch(e){await db.exec('ROLLBACK');throw e;}}
async function validateTerm(db,t){
 const r=(await db.query('select r.*,p.starts_on as panel_start,p.ends_on as panel_end from roles r join panels p on p.id=r.panel_id where r.id=$1',[t.role_id]))[0];
 if(t.starts_on>t.ends_on||t.starts_on<r.panel_start||t.ends_on>r.panel_end)throw Error('Term outside panel dates or reversed');
 const overlapping=await db.query(`select t.code from terms t join roles r on r.id=t.role_id where t.expert_id=$1 and r.panel_id=$2 and t.status='accepted' and t.id<>$3 and t.starts_on<=$5 and t.ends_on>=$4`,[t.expert_id,r.panel_id,t.id,t.starts_on,t.ends_on]);
 if(overlapping.length)throw Error(`Overlapping accepted term: ${overlapping.map(x=>x.code).join(', ')}`);
 return r;
}
async function accept(db,t,evidence){
 const r=await validateTerm(db,t);
 const ready=(await db.query('select * from v_term_readiness where id=$1',[t.id]))[0];
 if(ready.blockers.length)throw Error(`Appointment blocked: ${ready.blockers.join('; ')}`);
 const [{today}]=await db.query('select current_date::text as today');if(t.ends_on<today)throw Error('Cannot accept an expired term');
 const capacity=await db.query(`with boundaries as (select $3::date as day union select starts_on from terms where role_id=$1 and status='accepted' and starts_on between $3::date and $4::date)
 select b.day,count(t.id)::int as occupied from boundaries b left join terms t on t.role_id=$1 and t.status='accepted' and t.id<>$2 and t.starts_on<=b.day and t.ends_on>=b.day group by b.day having count(t.id)>=$5`,[r.id,t.id,t.starts_on,t.ends_on,r.seats]);
 if(capacity.length)throw Error('Position capacity exceeded during this term');
 return db.query("update terms set status='accepted',decision_evidence=$2 where id=$1 returning code,status",[t.id,evidence]);
}
async function importLineup(db,o,pos){
 if(pos.length!==2||pos[0]!=='lineup')throw Error('Usage: import lineup FILE.csv --panel=CODE --start=YYYY-MM-DD --end=YYYY-MM-DD --actor=NAME [--dry-run]');
 const panel=await resolve(db,'panels',need(o,'panel'));const start=date(need(o,'start')),end=date(need(o,'end'));
 if(start>end||start<panel.starts_on||end>panel.ends_on)throw Error('Import dates outside panel dates');
 const bytes=fs.readFileSync(pos[1]);const rows=parseCsv(bytes.toString('utf8'));if(!rows.length)throw Error('No import rows');
 const fingerprint=createHash('sha256').update(bytes).update(JSON.stringify([panel.id,start,end])).digest('hex');
 if((await db.query('select id from import_batches where fingerprint=$1',[fingerprint])).length)return [{imported:0,duplicate:true,dry_run:!!o['dry-run']}];
 const seen=new Set();let created=0,matched=0;
 for(let i=0;i<rows.length;i++){
  const row=rows[i],first=pick(row,'FirstName','First Name').trim(),last=pick(row,'LastName','Last Name').trim(),mail=email(pick(row,'Email').trim()),position=pick(row,'Position').trim();
  if(!first||!last||!position)throw Error(`Row ${i+2}: FirstName, LastName, Email and Position required`);
  if(seen.has(mail))throw Error(`Row ${i+2}: duplicate email`);seen.add(mail);
  const r=await role(db,panel,position),name=[first,pick(row,'MiddleName','Middle Name').trim(),last].filter(Boolean).join(' ');
  let expert=(await db.query('select * from experts where lower(email)=$1',[mail]))[0];
  if(expert){if(expert.name.toLowerCase()!==name.toLowerCase())throw Error(`Row ${i+2}: existing email has a different name; reconcile first`);matched++;}
  else{expert=(await db.query('insert into experts(code,name,email,organisation,region) values($1,$2,$3,$4,$5) returning *',['IMP-'+createHash('sha256').update(mail).digest('hex').slice(0,12).toUpperCase(),name,mail,pick(row,'Organisation','Organization'),pick(row,'Region','State')]))[0];created++;}
  const existing=await db.query(`select t.code from terms t join roles r on r.id=t.role_id where expert_id=$1 and r.panel_id=$2 and status in ('proposed','accepted') and starts_on<=$4 and ends_on>=$3`,[expert.id,panel.id,start,end]);
  if(existing.length)throw Error(`Row ${i+2}: overlapping record exists; reconcile ${existing[0].code}`);
  await db.query('insert into terms(code,expert_id,role_id,starts_on,ends_on) values($1,$2,$3,$4,$5)',['IMP-'+fingerprint.slice(0,10).toUpperCase()+'-'+(i+1),expert.id,r.id,start,end]);
 }
 await db.query('insert into import_batches(fingerprint,panel_id,filename,original_base64,rows,actor) values($1,$2,$3,$4,$5,$6)',[fingerprint,panel.id,path.basename(pos[1]),bytes.toString('base64'),JSON.stringify(rows),o.actor]);
 return [{imported:rows.length,new_experts:created,matched_experts:matched,status:'proposed',dry_run:!!o['dry-run']}];
}
export async function run(db,args){
 const {command:c,o,pos}=parseArgs(args);
 if(c==='--help')return commands.map(command=>({command}));
 if(!commands.includes(c))throw Error(`Unknown command ${c}. Use help.`);
 for(const k of Object.keys(o))if(!['json','actor',...allowed[c]].includes(k))throw Error(`Unknown flag --${k} for ${c}`);
 if(c!=='import'&&pos.length)throw Error('Unexpected positional arguments; use --key=value');
 if(o['dry-run']!==undefined&&o['dry-run']!==true)throw Error('Use --dry-run without a value');
 if(c==='help')return commands.map(command=>({command}));
 if(reports[c])return db.query(reports[c]);
 if(c==='eligibility'){
  const p=await resolve(db,'panels',need(o,'panel')),r=await role(db,p,need(o,'position')),end=date(o.end||p.ends_on);
  if(end<p.starts_on||end>p.ends_on)throw Error('Eligibility end outside panel dates');
  return db.query(`select e.code,e.name,s.level,s.valid_until,
  case when e.active and e.reviewed_on between current_date-$4::int and current_date and e.purpose<>'' and e.notice_evidence<>'' and e.retention_review>=current_date and s.level>=$3 and s.valid_until>=$5::date and c.conflict in ('clear','managed') and c.valid_until>=$5::date and c.nda_until>=$5::date then 'evidence ready' else 'review needed' end as evidence_status
  from experts e left join skills s on s.expert_id=e.id and lower(s.name)=lower($2) left join clearances c on c.expert_id=e.id and c.panel_id=$1 order by e.code`,[p.id,r.skill,r.minimum_level,p.freshness_days,end]);
 }
 if(c==='export'){
  const out=path.resolve(need(o,'out'));const data={format:'expert-panels/v1',exported_at:new Date().toISOString(),tables:{}};
  await db.exec('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');try{for(const t of ['experts','panels','roles','skills','clearances','terms','actions','notes','import_batches','audit'])data.tables[t]=await db.query(`select * from ${t} order by id`);await db.exec('COMMIT');}catch(e){await db.exec('ROLLBACK');throw e;}
  fs.mkdirSync(path.dirname(out),{recursive:true,mode:0o700});fs.writeFileSync(out,JSON.stringify(data,null,2)+'\n',{flag:'wx',mode:0o600});return [{file:out,tables:Object.keys(data.tables).length}];
 }
 if(['weekly-review','draft-appointment','draft-chase'].includes(c)){
  let sections,title;
  if(c==='weekly-review'){title='Weekly panel review';sections=await Promise.all(['coverage','term-renewals','attention'].map(async k=>({title:k,html:table(await db.query(reports[k]))})));}
  if(c==='draft-appointment'){const t=await resolve(db,'terms',need(o,'term'));title='Appointment working paper';sections=[{title:'Recorded appointment, verify before issue',html:table(await db.query('select code,panel,expert,position,starts_on,ends_on,status,blockers from v_term_readiness where id=$1',[t.id]))}];}
  if(c==='draft-chase'){const p=await resolve(db,'panels',need(o,'panel'));title='Panel follow-up working paper';sections=[{title:p.name,html:table(await db.query('select kind,code,subject,issue,due_on from v_attention where panel=$1 order by due_on',[p.name]))}];}
  const file=writeOut('drafts',c+'-'+randomUUID(),page({title,subtitle:'DRAFT. Internal review only. Nothing sent or approved.',sections}));return [{file,status:'draft'}];
 }
 const actor=need(o,'actor');return transaction(db,actor,async()=>{
  const ex=()=>resolve(db,'experts',need(o,'expert')),pa=()=>resolve(db,'panels',need(o,'panel'));
  if(c==='add-expert')return db.query('insert into experts(code,name,email,organisation,region,purpose,reviewed_on,retention_review,notice_evidence) values($1,$2,$3,$4,$5,$6,$7,$8,$9) returning code,name',[code(need(o,'code')),need(o,'name'),email(need(o,'email')),o.organisation||'',o.region||'',o.purpose||'',o.reviewed?date(o.reviewed):null,o.retention?date(o.retention):null,o.notice||'']);
  if(c==='update-expert'){
   const e=await ex();need(o,'reason');const map={name:'name',organisation:'organisation',region:'region',purpose:'purpose',reviewed:'reviewed_on',retention:'retention_review',notice:'notice_evidence',active:'active'};const vals=[e.id],sets=[];
   for(const [k,col]of Object.entries(map))if(k in o){let v=need(o,k);if(['reviewed','retention'].includes(k))v=date(v);if(k==='active'){if(!['true','false'].includes(v))throw Error('active must be true or false');v=v==='true';}vals.push(v);sets.push(`${col}=$${vals.length}`);}
   if(!sets.length)throw Error('No profile changes');const rows=await db.query(`update experts set ${sets.join(',')} where id=$1 returning code,name`,vals);
   await db.query("insert into audit(entity,record_id,operation,actor,after_record) values('experts',$1,'REASON',$2,$3)",[e.id,actor,JSON.stringify({reason:o.reason})]);return rows;
  }
  if(c==='add-panel')return db.query('insert into panels(code,name,purpose,owner,starts_on,ends_on,freshness_days) values($1,$2,$3,$4,$5,$6,$7) returning code,name',[code(need(o,'code')),need(o,'name'),need(o,'purpose'),need(o,'owner'),date(need(o,'start')),date(need(o,'end')),number(o.freshness||365,1,3650)]);
  if(c==='add-role'){const p=await pa();return db.query('insert into roles(panel_id,name,skill,minimum_level,seats) values($1,$2,$3,$4,$5) returning name,skill,seats',[p.id,need(o,'position'),need(o,'skill'),number(need(o,'level'),1,5),number(need(o,'seats'))]);}
  if(c==='record-skill'){const e=await ex();return db.query('insert into skills(expert_id,name,level,valid_until,evidence) values($1,$2,$3,$4,$5) on conflict(expert_id,lower(name)) do update set level=excluded.level,valid_until=excluded.valid_until,evidence=excluded.evidence returning name,level,valid_until',[e.id,need(o,'skill'),number(need(o,'level'),1,5),date(need(o,'until')),need(o,'evidence')]);}
  if(c==='set-clearance'){const e=await ex(),p=await pa();return db.query('insert into clearances(expert_id,panel_id,conflict,mitigation,nda_until,valid_until,evidence) values($1,$2,$3,$4,$5,$6,$7) on conflict(expert_id,panel_id) do update set conflict=excluded.conflict,mitigation=excluded.mitigation,nda_until=excluded.nda_until,valid_until=excluded.valid_until,evidence=excluded.evidence returning conflict,nda_until,valid_until',[e.id,p.id,need(o,'conflict'),o.mitigation||'',date(need(o,'nda-until')),date(need(o,'until')),need(o,'evidence')]);}
  if(c==='nominate'){const e=await ex(),p=await pa(),r=await role(db,p,need(o,'position')),t={id:randomUUID(),expert_id:e.id,role_id:r.id,starts_on:date(need(o,'start')),ends_on:date(need(o,'end'))};await validateTerm(db,t);return db.query('insert into terms(id,code,expert_id,role_id,starts_on,ends_on) values($1,$2,$3,$4,$5,$6) returning code,status',[t.id,code(need(o,'code')),e.id,r.id,t.starts_on,t.ends_on]);}
  if(c==='decide-term'){const t=await resolve(db,'terms',need(o,'term'));if(t.status!=='proposed')throw Error('Only a proposed term can receive a decision');const evidence=need(o,'evidence'),decision=need(o,'decision');if(decision==='accepted')return accept(db,t,evidence);if(decision!=='declined')throw Error('Decision must be accepted or declined');return db.query("update terms set status='declined',decision_evidence=$2 where id=$1 returning code,status",[t.id,evidence]);}
  if(c==='close-term'){const t=await resolve(db,'terms',need(o,'term'));if(t.status!=='accepted')throw Error('Only accepted terms can close');const [{today}]=await db.query('select current_date::text as today');if(t.ends_on>=today)throw Error('Cannot close a current or future term; use a reviewed term amendment');return db.query("update terms set status='completed',decision_evidence=decision_evidence || E'\nCompletion: ' || $2 where id=$1 returning code,status",[t.id,need(o,'evidence')]);}
  if(c==='add-action'){const p=await pa();return db.query('insert into actions(code,panel_id,title,owner,due_on) values($1,$2,$3,$4,$5) returning code,title',[code(need(o,'code')),p.id,need(o,'title'),need(o,'owner'),date(need(o,'due'))]);}
  if(c==='complete-action'){const a=await resolve(db,'actions',need(o,'action'));if(a.completed_on)throw Error('Action already completed');return db.query('update actions set completed_on=current_date,evidence=$2 where id=$1 returning code,completed_on',[a.id,need(o,'evidence')]);}
  if(c==='log-note'){const p=await pa();return db.query('insert into notes(panel_id,body,actor) values($1,$2,$3) returning body,actor',[p.id,need(o,'text'),actor]);}
  if(c==='import')return importLineup(db,o,pos);
 },!!o['dry-run']);
}
export function format(rows){if(!rows.length)return '(none)';const normal=rows.map(r=>Object.fromEntries(Object.entries(r).map(([k,v])=>[k,Array.isArray(v)?v.join('; '):v&&typeof v==='object'?JSON.stringify(v):v])));return textTable(normal,Object.keys(normal[0]).map(key=>({key,label:key.replaceAll('_',' ')})));}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){let db;try{db=await getDb();const args=process.argv.slice(2);if(args.includes('--help')){console.log(commands.join('\n'));}else{const result=await run(db,args);console.log(args.includes('--json')?JSON.stringify(result,null,2):format(result));}}catch(e){console.error(JSON.stringify({error:e.message}));process.exitCode=1;}finally{await db?.close();}}
