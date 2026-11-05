# Record reviewed skill evidence

Read relevant current records and history first. Replace the example values with operator-supplied values and actual dates. Do not invent people, evidence or approvals.

```sh
npm run panels -- record-skill --expert=EXP-01 --skill=Facilitation --level=4 --until=YYYY-MM-DD --evidence="Evidence reference" --actor="Operator name"
```



Every command accepts --json. Use --key=value syntax. Names are case-insensitive. If a name or ID prefix is ambiguous, show the listed candidates and ask the operator to choose. All writes require the declared operator name; this is a record, not authentication.
