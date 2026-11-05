# Register an existing subject expert

Read relevant current records and history first. Replace the example values with operator-supplied values and actual dates. Do not invent people, evidence or approvals.

```sh
npm run panels -- add-expert --code=EXP-NEW --name="Full name" --email=person@example.invalid --actor="Operator name"
```



Every command accepts --json. Use --key=value syntax. Names are case-insensitive. If a name or ID prefix is ambiguous, show the listed candidates and ask the operator to choose. All writes require the declared operator name; this is a record, not authentication.
