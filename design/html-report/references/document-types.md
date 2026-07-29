# Document types

Start with the closest preset, then delete blocks the report does not need.

| Need | Preset | Useful opening |
|---|---|---|
| Decision, review, status, findings, recommendations | `report.json` | Summary, signals, decision |
| Technical or product specification | `spec-or-plan.json` | Problem, chosen approach, architecture |
| Implementation or rollout plan | `spec-or-plan.json` | Outcome, sequence, acceptance criteria |
| Conceptual explanation | `explainer.json` | Mental model, principle, diagram |
| Audit or research synthesis | `report.json` | Conclusion, evidence, findings, gaps |
| QA or browser evidence | `evidence-report.json` | Verdict, flow results, media, gaps |

Set `document.type` to `report`, `spec`, `plan`, `explainer`, `audit`, `research`, or `evidence`. The type is descriptive; it does not lock the available blocks.

Do not create a new preset for a one-off variation. Use standard blocks and one controlled `custom-html` block if the document genuinely needs an unusual layout.
