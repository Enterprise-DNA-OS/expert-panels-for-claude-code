# Replace the Lineup Teams panel desk

1. In Lineup, open each team, choose the gear menu and **Export Team**. The [vendor guide](https://support.lineupteams.com/hc/en-us/articles/360040006334-Exporting-team-roster) documents a CSV containing person details, tracked fields and position.
2. Create the panel with its approved dates, then its named positions and required skills. Match position names in the export. Do not infer the mandate or skill threshold from names.
3. Run a test import:

```sh
npm run panels -- import lineup ./imports/roster.csv --panel=PANEL-01 --start=2026-11-05 --end=2027-04-01 --dry-run --actor="Panel secretary"
```

Remove `--dry-run` to write the same import. That is the one-command switch for a prepared team's roster. Preview performs all validations in a transaction and rolls back every row, including audit records.

4. Reconcile people, positions and dates against the source. New records are proposed terms. Review privacy notices, current profiles, skill evidence, confidentiality and conflicts before accepting any appointment. Your supplied dates apply to the entire file. Export separate groups or map individual historical seat dates before importing mixed terms.
5. Run coverage, compliance and export. Compare the working paper with the source before changing any live subscription.

## Mapping

The vendor's [sample export image](https://support.lineupteams.com/hc/article_attachments/360053032874/Screen_Shot_2019-12-13_at_11.55.53_AM.png), opened during this build, shows FirstName, MiddleName, LastName, Email, City, State, Phone, Position and TeamExperience. Our fixture follows those visible headings with synthetic people. It is not a captured customer export.

FirstName and LastName form the display name, optional MiddleName is retained in it. Email identifies a person. Position maps case-insensitively to an existing panel position. Organisation/Organization and Region/State map when present. All source columns and the original file bytes remain in the import batch. City, Phone, TeamExperience and other tracked fields are preserved there, not silently converted into skills or accepted terms. Headers with spaces in First Name, Middle Name and Last Name also work.

An identical file, panel and date window imports once. Changed files that overlap existing proposed or accepted terms fail for review. A matching email with a different name fails rather than overwriting a profile. Duplicate emails, unknown positions, missing names, invalid emails, malformed CSV and invalid dates roll back the entire batch. Existing profiles keep their reviewed fields.

The roster export does not establish skill evidence, signed documents, complete seat history, application responses, communication history, evaluations, permissions or integrations. Map those separately after checking an actual export. Do not call the import a complete Lineup account migration.

## Owned export and restore

`npm run panels -- export --out=exports/panel-snapshot.json` writes all domain records, audit history and import originals. It refuses to overwrite a file. Protect the snapshot as personal information. Restore is a maintainer-reviewed task against an empty database with reconciled references; no automatic restore command is included. Use native database backups and test recovery as well.
