create table experts (
 id uuid primary key default gen_random_uuid(), code text not null unique, name text not null check(length(trim(name))>0),
 email text not null check(email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'), organisation text not null default '', region text not null default '',
 active boolean not null default true, reviewed_on date, retention_review date, purpose text not null default '', notice_evidence text not null default '',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index expert_email on experts(lower(email));
create table panels (
 id uuid primary key default gen_random_uuid(), code text not null unique, name text not null, purpose text not null,
 starts_on date not null, ends_on date not null, owner text not null, freshness_days integer not null default 365 check(freshness_days between 1 and 3650),
 check(ends_on>=starts_on), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table roles (
 id uuid primary key default gen_random_uuid(), panel_id uuid not null references panels, name text not null, skill text not null,
 minimum_level integer not null check(minimum_level between 1 and 5), seats integer not null check(seats between 1 and 1000),
 unique(panel_id,name), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table skills (
 id uuid primary key default gen_random_uuid(), expert_id uuid not null references experts, name text not null,
 level integer not null check(level between 1 and 5), valid_until date not null, evidence text not null check(length(trim(evidence))>0),
 unique(expert_id,name), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table clearances (
 id uuid primary key default gen_random_uuid(), expert_id uuid not null references experts, panel_id uuid not null references panels,
 conflict text not null check(conflict in ('clear','managed','blocked')), mitigation text not null default '',
 nda_until date not null, valid_until date not null, evidence text not null check(length(trim(evidence))>0),
 check(conflict<>'managed' or length(trim(mitigation))>0), unique(expert_id,panel_id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table terms (
 id uuid primary key default gen_random_uuid(), code text not null unique, expert_id uuid not null references experts, role_id uuid not null references roles,
 starts_on date not null, ends_on date not null, status text not null default 'proposed' check(status in ('proposed','accepted','declined','completed')),
 decision_evidence text not null default '', check(ends_on>=starts_on),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table actions (
 id uuid primary key default gen_random_uuid(), code text not null unique, panel_id uuid not null references panels, title text not null,
 owner text not null, due_on date not null, completed_on date, evidence text not null default '',
 check(completed_on is null or length(trim(evidence))>0), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table notes (
 id uuid primary key default gen_random_uuid(), panel_id uuid not null references panels, body text not null, actor text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table import_batches (
 id uuid primary key default gen_random_uuid(), fingerprint text not null unique, panel_id uuid not null references panels,
 filename text not null, original_base64 text not null, rows jsonb not null, actor text not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table audit (
 id uuid primary key default gen_random_uuid(), entity text not null, record_id uuid not null, operation text not null, actor text not null,
 before_record jsonb, after_record jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create function change_record() returns trigger language plpgsql as $$
begin
 if coalesce(current_setting('app.actor',true),'')='' then raise exception 'An actor is required'; end if;
 if TG_OP='UPDATE' then NEW.updated_at=clock_timestamp(); end if;
 return NEW;
end $$;
create function record_audit() returns trigger language plpgsql as $$
begin
 insert into audit(entity,record_id,operation,actor,before_record,after_record)
 values(TG_TABLE_NAME,NEW.id,TG_OP,current_setting('app.actor',true),case when TG_OP='UPDATE' then to_jsonb(OLD) else null end,to_jsonb(NEW));
 return NEW;
end $$;
create function deny_rewrite() returns trigger language plpgsql as $$ begin raise exception 'Append-only record: use a reviewed maintenance procedure'; end $$;
do $$ declare n text; begin
 foreach n in array ARRAY['experts','panels','roles','skills','clearances','terms','actions','notes','import_batches'] loop
 execute format('create trigger track_change before insert or update on %I for each row execute function change_record()',n);
 execute format('create trigger log_change after insert or update on %I for each row execute function record_audit()',n);
 execute format('create trigger no_delete before delete on %I for each row execute function deny_rewrite()',n);
 end loop;
 foreach n in array ARRAY['audit','notes','import_batches'] loop
 execute format('create trigger immutable before update or delete on %I for each row execute function deny_rewrite()',n);
 end loop;
 foreach n in array ARRAY['experts','panels','roles','skills','clearances','terms','actions','notes','import_batches','audit'] loop
 execute format('alter table %I enable row level security',n);
 execute format('revoke all on %I from public',n);
 end loop;
end $$;
create view v_term_readiness as
select t.id,t.code,t.expert_id,r.panel_id,t.role_id,e.name as expert,p.name as panel,r.name as position,t.starts_on,t.ends_on,t.status,
 array_remove(array[
 case when not e.active then 'inactive profile' end,
 case when e.reviewed_on is null or e.reviewed_on<current_date-p.freshness_days or e.reviewed_on>current_date then 'profile review needed' end,
 case when e.purpose='' or e.notice_evidence='' then 'privacy evidence missing' end,
 case when e.retention_review is null or e.retention_review<current_date then 'retention review due' end,
 case when s.id is null or s.level<r.minimum_level or s.valid_until<t.ends_on then 'skill evidence insufficient for term' end,
 case when c.id is null or c.conflict='blocked' or c.valid_until<t.ends_on then 'conflict review needed' end,
 case when c.id is null or c.nda_until<t.ends_on then 'confidentiality evidence needed' end,
 case when t.starts_on<p.starts_on or t.ends_on>p.ends_on then 'term outside panel dates' end
 ],null) as blockers
from terms t join experts e on e.id=t.expert_id join roles r on r.id=t.role_id join panels p on p.id=r.panel_id
left join skills s on s.expert_id=e.id and lower(s.name)=lower(r.skill)
left join clearances c on c.expert_id=e.id and c.panel_id=p.id;
create view v_panel_coverage as
select p.id as panel_id,p.code,p.name as panel,r.name as position,r.skill,r.seats as required,
 greatest(current_date,p.starts_on) as coverage_on,
 count(t.id) filter(where t.status='accepted')::int as accepted,
 count(t.id) filter(where t.status='accepted' and cardinality(t.blockers)=0)::int as ready,
 greatest(0,r.seats-count(t.id) filter(where t.status='accepted' and cardinality(t.blockers)=0))::int as gap
from panels p join roles r on r.panel_id=p.id
left join v_term_readiness t on t.role_id=r.id and t.starts_on<=greatest(current_date,p.starts_on) and t.ends_on>=greatest(current_date,p.starts_on)
where p.ends_on>=current_date group by p.id,p.code,p.name,p.starts_on,r.id,r.name,r.skill,r.seats;
create view v_attention as
select 'term'::text as kind,t.code,t.panel,t.expert as subject,array_to_string(t.blockers,'; ') as issue,t.ends_on as due_on
from v_term_readiness t where t.status in ('proposed','accepted') and cardinality(t.blockers)>0
union all
select 'action',a.code,p.name,a.title,'overdue follow-up',a.due_on from actions a join panels p on p.id=a.panel_id where a.completed_on is null and a.due_on<current_date
union all
select 'renewal',t.code,t.panel,t.expert,'term ends within 60 days',t.ends_on from v_term_readiness t where t.status='accepted' and t.ends_on between current_date and current_date+60;
revoke all on v_term_readiness,v_panel_coverage,v_attention from public;
create unique index skill_name_ci on skills(expert_id,lower(name));
create unique index role_name_ci on roles(panel_id,lower(name));
