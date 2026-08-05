# Report types

Start with the closest preset, then delete blocks the report does not need.

| Need | Preset | Useful blocks |
|---|---|---|
| Decision, review, status, recommendations | `report.json` | `properties`, `context`, `verdict`, `metrics`, `specs`, `gaps` |
| Technical or product specification | `spec-or-plan.json` | `context`, `verdict`, `flowchart`, `specs`, `gaps` |
| Implementation or rollout plan | `spec-or-plan.json` | `context`, `flowchart`, `specs`, `ledger`, `gaps` |
| Conceptual explanation | `explainer.json` | `context`, `metrics`, `charts`, `flowchart`, `collapsible`, `specs` |
| Audit or research synthesis | `report.json` | `context`, `verdict`, `metrics`, `charts`, `specs`, `ledger`, `gaps` |
| QA or browser evidence | `evidence-report.json` | `verdict`, `flow-results`, `assertions`, `userflows`, `recording`, `playwright`, `gaps` |

The report type lives in its title, eyebrow, summary, and selected blocks; there is no separate `document.type` field.

Do not create a new block type for a one-off variation. Use the canonical block that communicates the information most clearly.
