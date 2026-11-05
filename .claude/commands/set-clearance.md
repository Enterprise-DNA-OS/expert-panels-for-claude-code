# Record conflict and confidentiality review

Read relevant current records and history first. Replace the example values with operator-supplied values and actual dates. Do not invent people, evidence or approvals.

```sh
npm run panels -- set-clearance --expert=EXP-01 --panel=PANEL-01 --conflict=clear --nda-until=YYYY-MM-DD --until=YYYY-MM-DD --evidence="Declaration reference" --actor="Operator name"
```

A managed conflict also requires --mitigation="Approved handling plan". Never infer a clear conflict from missing records.

Every command accepts --json. Use --key=value syntax. Names are case-insensitive. If a name or ID prefix is ambiguous, show the listed candidates and ask the operator to choose. All writes require the declared operator name; this is a record, not authentication.
