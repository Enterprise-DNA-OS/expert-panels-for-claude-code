# Assign a panel follow-up

Read relevant current records and history first. Replace the example values with operator-supplied values and actual dates. Do not invent people, evidence or approvals.

```sh
npm run panels -- add-action --code=ACT-NEW --panel=PANEL-01 --title="Review declaration" --owner="Secretary" --due=YYYY-MM-DD --actor="Operator name"
```



Every command accepts --json. Use --key=value syntax. Names are case-insensitive. If a name or ID prefix is ambiguous, show the listed candidates and ask the operator to choose. All writes require the declared operator name; this is a record, not authentication.
