# Test and import a Lineup roster

Read relevant current records and history first. Replace the example values with operator-supplied values and actual dates. Do not invent people, evidence or approvals.

```sh
npm run panels -- import lineup ./imports/roster.csv --panel=PANEL-01 --start=YYYY-MM-DD --end=YYYY-MM-DD --dry-run --actor="Operator name"
```

Read docs/replace-lineup-teams.md first. Inspect the actual headings and reconcile positions. Start with --dry-run, then remove that flag for the authorised import. Imported terms stay proposed. The preview rolls back all changes.

Every command accepts --json. Use --key=value syntax. Names are case-insensitive. If a name or ID prefix is ambiguous, show the listed candidates and ask the operator to choose. All writes require the declared operator name; this is a record, not authentication.
