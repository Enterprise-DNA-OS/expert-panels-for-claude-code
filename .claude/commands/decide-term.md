# Record an authorised appointment decision

Read relevant current records and history first. Replace the example values with operator-supplied values and actual dates. Do not invent people, evidence or approvals.

```sh
npm run panels -- decide-term --term=TERM-NEW --decision=accepted --evidence="Appointment minute reference" --actor="Operator name"
```

Use accepted only for an operator-authorised appointment supported by the exact minute or decision. A declined decision also requires evidence. The CLI checks full-term evidence, overlap and capacity.

Every command accepts --json. Use --key=value syntax. Names are case-insensitive. If a name or ID prefix is ambiguous, show the listed candidates and ask the operator to choose. All writes require the declared operator name; this is a record, not authentication.
