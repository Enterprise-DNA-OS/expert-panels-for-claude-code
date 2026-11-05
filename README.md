# Expert Panels for Claude Code

Know which panel positions are uncovered, whose term is ending and which appointment still lacks evidence. Keep your professional expert panels in a database you own.

## Three ways to own it

- **Do it yourself:** the MIT-licensed base is free. Run it with Claude Code, Codex, OpenCode or Cursor. Hosting, agent subscriptions and operating time are separate.
- **We customise it:** Enterprise DNA brings your Lineup Teams roster across, reconciles the positions and dates, changes fields and rules, connects your systems, and builds staff screens or another stack when needed. One setup fee, then a retainer for ongoing work.
- **We run it for you:** Omni by Enterprise DNA installs, connects and operates your version, including access controls, backups and recurring panel reviews. One setup fee, then a retainer.

[Book a 30-minute call with Sam](https://enterprisedna.co/omni/book/?offer=replace-software&utm_source=github&utm_medium=readme&utm_campaign=lineup-teams).

## Start with the synthetic demo

Node 20 or newer. No cloud account needed.

```sh
npm install
npm test
npm run demo
npm run panels -- coverage
npm run panels -- term-renewals
npm run panels -- compliance
npm run view
npm run docs
```

Ask your coding agent for /weekly-review. The demo includes an expiring chair, an unfilled specialist position, stale evidence, a blocked declaration, a person serving on two panels and an overdue follow-up. Every person and organisation is invented. Seeding twice preserves changes. Start a new DATA_DIR without demo seeding for real records.

## Instead of Lineup Teams

[Lineup's plans](https://www.lineupteams.com/teams/plans) start at $10,000 per year. The vendor displays dollars without a currency code. Confirm the quote currency; no NZD or AUD conversion or customer invoice is claimed. Checked 5 November 2026.

This is the internal expert panel desk: existing subject experts, position requirements, appointment terms, skill evidence, conflict decisions, confidentiality references and follow-up work. It does not recruit candidates, issue credentials, judge awards or schedule volunteer shifts. Lineup also supplies forms, communications, surveys, self-service and integrations that this base does not reproduce. Scope and test those services before cancelling a subscription.

## Recurring work

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

32 CLI commands and 34 slash commands. Every CLI command accepts --json. Writes use --actor="Name". Names and ID prefixes resolve case-insensitively; ambiguity lists candidates and fails. Use --key=value syntax. Each recipe includes required arguments.

## Ten questions your records answer

1. Which panel positions still lack a ready appointment? (`coverage`)
2. Which chair terms end in the next sixty days? (`term-renewals`)
3. Whose skill evidence expires before the proposed term ends? (`roster`)
4. Which appointment has a conflict decision that blocks acceptance? (`compliance`)
5. Who is serving on several panels at once? (`commitments`)
6. Which existing experts have evidence matching the next specialist position? (`eligibility --panel=PANEL-01 --position=Specialist`)
7. Which follow-ups are already overdue? (`attention`)
8. Which panel has no recorded update in fourteen days? (`stale`)
9. Who changed a profile, and what did it contain before the change? (`history`)
10. Which imported profiles still need privacy and accuracy review? (`compliance`)

These are implemented questions, not a claim that the vendor cannot answer them. Your own records can be joined to additional internal evidence without waiting for a preset dashboard.

## Your first hour: ten things to ask for

1. Put our business name and colours in brand.json.
2. Show uncovered panel positions.
3. Show chair terms ending soon.
4. Explain why the proposed specialist is blocked.
5. Draft the weekly panel review.
6. List people serving on more than one panel.
7. Test a roster import without changing records.
8. Reconcile imported positions and dates.
9. Add our committee reference through a tested migration.
10. Save a private snapshot and plan recovery.

## Move your roster

Read [the replace guide](docs/replace-lineup-teams.md). Export each Lineup team as CSV and use one import command after preparing panel positions and dates. The importer retains original bytes and unknown columns. Identical reimports do nothing; changed overlapping records fail for review. All imported terms are proposed. Skill evidence, declarations and privacy notices are not invented from an export. The fixture is synthetic and follows the vendor's visible sample headings.

## Rules that protect an appointment

Acceptance requires current profile review, recorded purpose and notice evidence, a future retention review, adequate skill evidence and reviewed conflict/confidentiality evidence through the full term. Managed conflicts require mitigation. A term must fit its panel dates, cannot overlap another accepted term for the person on that panel, and cannot exceed the position's capacity at any date. Readiness is evidence status, not a professional or legal certification.

Coverage is measured on the later of today and the panel start. Evidence must cover each appointment's whole term, but the coverage report does not promise every future day is staffed. Use term renewals and the roster to plan succession. Expired terms remain historical until explicitly completed. Availability is a human decision; concurrent panels are shown as commitments, not automatically rejected.

## Reports and paperwork

`npm run view` renders panel coverage, term renewals and the evidence desk. `npm run docs` renders panel briefs, appointment working papers and declaration checklists. They use brand.json and escape record text. Proposed appointments stay visibly proposed. Private HTML files are drafts for the secretary, never sent or published.

## Operations and limits

No DATABASE_URL uses embedded PGlite in DATA_DIR. DATABASE_URL uses PostgreSQL. Domain tables enable row-level security and revoke PUBLIC access. Connect as a trusted owner and restrict database and OS access. This is not a multi-tenant application or expert portal. The actor field is self-declared, not authentication. The CLI serialises mutations with database locks; do not bypass its appointment checks with ad hoc writes.

Changes record before/after values. Normal commands cannot rewrite audit entries, original imports or notes. Privacy retention still requires a reviewed maintenance procedure across records, imports, exports and backups. Export writes a complete JSON snapshot and refuses overwrite. Restore is reviewed maintenance, not an automated command. Use native backups too.

`npm test` uses a disposable database and output folder. It exercises every command and tests appointment gates, import rollback, reimports, immutable history and escaped HTML. CI supports Windows and Linux, Node 20 and 22, plus PostgreSQL. TEST_DATABASE_URL must name an empty disposable database.

Read [compliance](docs/compliance.md), [research](docs/research.md), [the replace guide](docs/replace-lineup-teams.md) and [why no front end](docs/why-no-front-end.md).

MIT licence. Copyright 2026 Enterprise DNA. Lineup Teams is its owner's trademark. Independent implementation, no vendor source code or assets.
