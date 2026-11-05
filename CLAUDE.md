# Expert Panels for Claude Code: operating instructions

For a professional-body panel secretary managing existing subject experts, committee terms and appointment evidence. The included organisation and people are synthetic. Set your business name and colours in brand.json before operational use.

Every answer starts with current records from `npm run panels -- help` or the relevant command. Read history before drafting or changing a record. Use plain language and exact dates. Explain missing evidence and unknowns.

## One route for each recurring job

| Command | Job |
|---|---|
| /experts | Read the expert pool and review dates |
| /panels | Read mandates, dates and owners |
| /roles | Read required expertise and position counts |
| /roster | Read appointments and evidence blockers |
| /coverage | Find panel positions without ready appointments |
| /term-renewals | Find terms ending in sixty days |
| /commitments | See who sits on several current panels |
| /attention | Read blocked terms and overdue follow-ups |
| /actions | Read open and completed follow-ups |
| /stale | Find panels without a note in fourteen days |
| /compliance | Review privacy and appointment evidence |
| /history | Read recorded changes and their declared operator |
| /help | List every supported command |
| /eligibility | Find experts whose evidence fits a position |
| /add-expert | Register an existing subject expert |
| /update-expert | Record a checked correction or profile review |
| /add-panel | Register an approved panel mandate |
| /add-role | Define required expertise and capacity |
| /record-skill | Record reviewed skill evidence |
| /set-clearance | Record conflict and confidentiality review |
| /nominate | Propose a term for an existing expert |
| /decide-term | Record an authorised appointment decision |
| /close-term | Complete an expired accepted term |
| /add-action | Assign a panel follow-up |
| /complete-action | Record completed follow-up work |
| /log-note | Record the panel discussion |
| /import | Test and import a Lineup roster |
| /export | Save a complete private snapshot |
| /weekly-review | Draft Monday panel review from coverage, renewals and attention |
| /draft-appointment | Draft an appointment working paper |
| /draft-chase | Draft panel evidence follow-up |
| /customise | Change fields and rules with a tested migration |
| /new-view | Add a branded read-only report |

## Rules

- No messages, invitations, payments, public files or issued credentials. Draft only to drafts/.
- Never recruit, screen job applicants or make employment decisions. This is an existing expert panel desk.
- The operator authorises appointments and supplies evidence. Never treat a profile, imported roster or draft letter as approval.
- Mutations require --actor="Name". This declared name is not an authenticated identity. Use trusted OS and database access.
- Never invent missing dates or evidence. Ambiguous names return candidates and exit with failure.
- Dates are inclusive. Profile freshness is a configurable internal policy, not a legal interval. Do not infer capability from geography or other personal characteristics.
- All imports start with a dry run. Reconcile the actual export before accepting terms.
- Data is private. No live exports, contact details or original imports in Git. No deletion without an explicit approved maintenance plan.
- Keep schema changes in numbered migrations, test with npm test, then apply with npm run migrate. Never edit an applied migration.
- Read docs/compliance.md for the source and limits of each record check. Do not claim certified compliance or identity verification.

## Files

scripts/panels.mjs is the one CLI. supabase/migrations holds the schema. The shared adapter uses embedded PGlite or an operator-owned PostgreSQL connection. Views and documents are read-only HTML configured in views.json and documents.json. .claude/commands holds every agent recipe. AGENTS.md directs other coding agents here.

Built and run through Omni by Enterprise DNA: https://enterprisedna.co/omni/book/?offer=replace-software
