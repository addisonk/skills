---
name: html-report
description: Create a polished, shareable single-file HTML report from structured content. Use only when the user explicitly asks for an HTML report, shareable report, interactive report, or a report they can upload and send as a link. Supports reports, specs, plans, explainers, audits, research summaries, and QA evidence. Do not use for ordinary Markdown responses, production web pages, or UI prototypes.
---

# HTML Report

Build a quick, disposable document that is easy to read and share. The report is throwaway; this skill's report engine, block catalog, presets, and uploader are the reusable parts.

## Workflow

### 1. Place the report close to its subject

Save the source JSON and rendered HTML in the current project, close to the work the report documents. Follow an existing reports or artifacts convention when one exists. Otherwise, place clearly named `<topic>-report.json` and `<topic>-report.html` files beside the nearest relevant module, page, or source material; for a project-wide report, use the project root.

Do not invent a new top-level directory or save generated reports inside this skill folder. Use a temporary directory only when no project folder applies or the user explicitly wants no files added to the project, and disclose that location.

### 2. Choose a preset

Copy the closest JSON file from `templates/` into the report location chosen in step 1:

- `report.json` — decisions, findings, status, risks, and recommendations
- `spec-or-plan.json` — requirements, architecture, implementation steps, and acceptance criteria
- `explainer.json` — concepts, mental models, flows, and examples
- `evidence-report.json` — verdicts, tested flows, screenshots, recordings, and gaps

Read [document-types.md](references/document-types.md) only when the right preset is unclear.

Treat the copied JSON and rendered HTML as disposable output. Name them so a casual reader can tell they are reports, and do not commit them unless the user asks.

### 3. Use the canonical blocks

Open `templates/report-blocks.html` in a browser before authoring. It is the exact visual block library shared with the E2E skill: the current styling, schemas, renderers, and **Show JSON** examples live there.

Do not invent block types or use the retired generic blocks from earlier versions of this skill. Use only:

`properties`, `context`, `verdict`, `metrics`, `charts`, `flow-results`, `assertions`, `collapsible`, `flowchart`, `userflows`, `before-after`, `recording`, `specs`, `ledger`, `unit-tests`, `playwright`, `maestro`, `backend`, `gaps`.

Keep this top-level shape:

```json
{
  "report": {
    "eyebrow": "HTML report",
    "title": "Decision-ready title",
    "summary": "What this report establishes and why it matters.",
    "verdict": "pass",
    "footer": ["Shareable HTML report"]
  },
  "blocks": []
}
```

Copy exact block shapes from the visual catalog or [block-catalog.md](references/block-catalog.md). `_name`, `_note`, `_eyebrow`, and `_group` control report section framing and are omitted from each block's **Show JSON** view. Keep flat reports in canonical block order. For reports with multiple scopes, keep each scope's blocks adjacent under the same `_group`.

Keep only sections that help the reader understand or decide something. Do not turn the report into a work log.

### 4. Render

From this skill folder, run:

```bash
node scripts/render.mjs /path/to/report.json /path/to/report.html
```

The renderer validates the JSON and injects it into `templates/report-template.html`, the matching E2E report engine with generic report framing. The output is one responsive HTML file with inline layout and behavior. Do not edit the generated HTML or fork the engine for a one-off report; fix the source JSON instead.

### 5. Look once, then hand it over

Open the HTML in a browser. Check the opening view and one narrow mobile width. Fix obvious overflow, broken media, missing sections, or content that is hard to scan.

Do not add a test suite, application scaffolding, package dependencies, or reusable abstractions to the generated report. This is a shareable document, not product code.

Return the absolute path to the HTML file.

### 6. Publish only when requested

Local rendering never requires credentials. If the user explicitly asks for a public link, read [publishing.md](references/publishing.md), then run:

```bash
node scripts/publish.mjs /path/to/report.json /path/to/report.html --key short-report-name
```

Publishing uploads relative screenshots and recordings first, rewrites a cloned source to their public URLs, uploads the HTML last, verifies every uploaded URL, and prints the report URL.

Never put credentials in report JSON. Never publish without an explicit request to upload or share publicly.

## Authoring rules

- Lead with the conclusion. Use the title and summary to orient the reader immediately.
- Prefer a few strong sections over a kitchen-sink report.
- Preserve the canonical engine's monochrome presentation; reserve color for status.
- Use real evidence. If evidence is unavailable, name the gap instead of inventing it.
- Prefer `specs` for long descriptions and `ledger` for compact key/value rows.
- Use `userflows`, `before-after`, and `recording` only when their media exists.
- Keep published links and media as absolute HTTPS URLs. Relative media is allowed before `publish.mjs` rewrites it.
- Do not add a `custom-html` block or modify the engine to create a one-off layout.

## Included commands

```bash
# Validate source JSON without rendering
node scripts/validate.mjs /path/to/report.json

# Validate an already rendered file
node scripts/validate.mjs --html /path/to/report.html

# Upload one standalone artifact
node scripts/upload-artifact.mjs /path/to/file --key reports/name/file

# Check public URLs
node scripts/upload-artifact.mjs --verify https://cdn.example.com/reports/name/report.html
```
