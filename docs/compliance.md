# Record checks for expert panels

Checked 5 November 2026. These checks support a human panel secretary. They do not certify legal compliance, accreditation, professional competence or an appointment. No payroll, payments, recruitment or regulated credential issue is performed.

| Check | Basis | What the command does |
|---|---|---|
| Profile accuracy | [NZ Privacy Act principle 8](https://www.privacy.org.nz/privacy-principles/8/) and [Australia APP 10](https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-10-app-10-quality-of-personal-information) | Flags a missing, future or old review date. The panel policy defaults to 365 days, which is an operational choice, not a statutory period. |
| Retention review | [NZ principle 9](https://www.privacy.org.nz/privacy-principles/9/) and [Australia APP 11](https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-11-app-11-security-of-personal-information) | Flags missing or overdue review dates. The operator sets a date for the actual purpose and applicable obligations. No automatic deletion occurs. |
| Collection notice | [NZ principle 3A](https://www.privacy.org.nz/privacy-principles/3a/) | Requires a reference to a notice or a documented applicable exception before accepting a term. Imported profiles have no assumed notice. This reference does not verify notice content, timing or an exception. |
| Panel eligibility | Your panel mandate and recorded evidence | Checks the required skill and level, conflict decision and confidentiality evidence through the whole term. A managed conflict needs written mitigation. A blocked conflict prevents acceptance. These are configurable internal controls, not universal laws. |
| Term boundaries | [Lineup seat terms](https://support.lineupteams.com/hc/en-us/articles/18676491184407-Seat-Terms) and your panel mandate | Inclusive dates, terms within panel dates, no overlapping accepted terms for one person on the same panel. Capacity checked at every relevant boundary. |

`npm run panels -- compliance` reports exceptions. It never approves a person, sends a notice or certifies a conflict decision. Confirm which Australian privacy obligations apply to your organisation. Ask your privacy lead to review imported records and the collection notice before use.

Keep evidence references rather than uploading sensitive documents to this repository. Database exports and original import bytes contain personal information. Restrict access to the working folder, database, backups and generated reports. Review retention across all copies, including audit entries and originals. After authorised retention review, a maintainer must prepare, test and approve a scoped deletion or de-identification migration, including backup expiry. Append-only triggers protect normal operations; they are not a legal retention mandate.

The CLI actor is a declared operator name, not authenticated identity. Use trusted operators with OS and database access controls. Public database privileges are revoked and row-level security is enabled without end-user policies. The database owner remains privileged. No multi-tenant or expert self-service access is provided.
