# Canonical block catalog

`../templates/report-blocks.html` is the source of truth. Open it in a browser to see the exact report styling and its rendered examples. Expand **Show JSON** under a displayed block to copy its authoring shape; the schema comment and renderer map in the same file define the complete current set. These disclosures are catalog-only and never appear in generated reports.

The catalog and `../templates/report-template.html` use the same renderers. Do not recreate a block from prose in this reference when the live catalog is available.

## Structure reports

- Use flat blocks for one subject or scope. Do not wrap a single scope in a group.
- For two or more scopes, keep shared context, conclusions, metrics, and gaps at the top level.
- Put each scope's detailed blocks next to each other and give them the same `_group`. Grouping depends on adjacency.
- Keep process narration out. Include only sections that change how the reader understands the result or decision.
- Use `../templates/evidence-report.json` as the grouped example: shared findings first, then Desktop and Mobile evidence groups.

## Current blocks

Use this canonical order for flat reports. In grouped reports, keeping each group's blocks adjacent takes precedence:

1. `properties` — aligned label/value metadata
2. `context` — prose paragraphs or a numbered list
3. `verdict` — finding/status cards
4. `metrics` — headline stat cards
5. `charts` — small pie or bar charts, up to about six values
6. `flow-results` — result summary band and flow table
7. `assertions` — pass/fail checklist
8. `collapsible` — expandable detail rows with HTML bodies
9. `flowchart` — left-to-right connected steps
10. `userflows` — mobile or desktop screenshot sequence
11. `before-after` — paired comparison images
12. `recording` — inline video and fallback links
13. `specs` — grouped labels with long descriptions
14. `ledger` — grouped compact key/value rows and links
15. `unit-tests` — command/result table
16. `playwright` — Playwright result summary and attachments
17. `maestro` — linked Maestro artifacts
18. `backend` — backend command/result table
19. `gaps` — known limitations or missing evidence

## Report metadata

```jsonc
{
  "report": {
    "eyebrow": "HTML report",
    "title": "Project review",
    "summary": "What this report establishes.",
    "verdict": "pass",
    "pills": ["Updated today", { "label": "Owner", "code": "Team" }],
    "footer": ["Shareable HTML report"]
  },
  "blocks": []
}
```

`report.title` and `report.verdict` are required. Verdict is `pass`, `fail`, or `partial`.

Optional E2E-oriented metadata (`device`, `commit`, `timestamp`, and `testTypes`) populates the report engine's status/navigation details when useful.

## Section framing

Add authoring-only keys to a block when the report needs clearer navigation:

```jsonc
{
  "_group": "Desktop",
  "_eyebrow": "Chrome · 1440×900",
  "_name": "Checkout flow",
  "_note": "The primary path from cart to confirmation.",
  "type": "userflows",
  "steps": []
}
```

- `_name` labels the section and navigation item.
- `_note` adds a short section introduction.
- `_eyebrow` adds compact context above the section name.
- `_group` nests adjacent sections in a collapsible group.

These keys are stripped from the block JSON shown in the rendered report. They do not define new block behavior.
