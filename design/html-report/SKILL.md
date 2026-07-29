---
name: html-report
description: Create a polished, shareable single-file HTML report from structured content. Use only when the user explicitly asks for an HTML report, shareable report, interactive report, or a report they can upload and send as a link. Supports reports, specs, plans, explainers, audits, research summaries, and QA evidence. Do not use for ordinary Markdown responses, production web pages, or UI prototypes.
---

# HTML Report

Build a quick, disposable document that is easy to read and share. The report is throwaway; the bundled shell, blocks, and uploader are the reusable parts.

## Workflow

### 1. Choose the closest preset

Copy one JSON file from `templates/` into the working folder:

- `report.json` — decisions, findings, status, risks, and recommendations
- `spec-or-plan.json` — requirements, architecture, comparisons, and implementation steps
- `explainer.json` — concepts, mental models, diagrams, and examples
- `evidence-report.json` — verdicts, tested flows, screenshots, recordings, and gaps

Read [document-types.md](references/document-types.md) only when the right preset is unclear.

Treat the copied JSON and rendered HTML as disposable output. Do not commit them unless the user asks.

### 2. Replace the example content

Keep this top-level shape:

```json
{
  "version": 1,
  "document": {
    "title": "Decision-ready title",
    "summary": "What this document establishes and why it matters.",
    "type": "report",
    "date": "2026-07-29"
  },
  "blocks": []
}
```

Use standard blocks before reaching for `custom-html`. Give every block a unique lowercase `id` and a clear `title`. Keep only blocks that help the reader understand or decide something; do not turn the report into a work log.

Read [block-catalog.md](references/block-catalog.md) for block shapes.

For a visual reference, open `templates/report-blocks.html`. Its embedded data comes from `templates/report-blocks.json`, which shows every supported block in one reusable kitchen-sink document. This is the generic counterpart to the E2E skill's block library.

### 3. Render

From this skill folder, run:

```bash
node scripts/render.mjs /path/to/report.json /path/to/report.html
```

The renderer checks the source, writes one self-contained HTML file, and checks the output. The file has inline CSS and JavaScript, system fonts, light/dark mode, mobile layout, print styles, anchored navigation, and no remote runtime dependencies.

If rendering fails, fix the named field. Do not bypass validation by editing the generated HTML.

### 4. Look once, then hand it over

Open the HTML in a browser. Check the opening view and one narrow mobile width. Fix obvious overflow, broken media, missing sections, or content that is hard to scan.

Do not add a test suite, application scaffolding, package dependencies, or reusable abstractions to the generated report. This is a shareable document, not product code.

Return the absolute path to the HTML file.

### 5. Publish only when requested

Local rendering never requires credentials. If the user asks for a public link, read [publishing.md](references/publishing.md), then run:

```bash
node scripts/publish.mjs /path/to/report.json /path/to/report.html --key short-report-name
```

Publishing uploads relative images and recordings first, rewrites a cloned source to their public URLs, uploads the HTML last, verifies every uploaded URL, and prints the report URL.

Never put credentials in report JSON. Never publish without an explicit request to upload or share publicly.

## Authoring rules

- Lead with the conclusion. Use the title and summary to orient the reader immediately.
- Prefer a few strong sections over a kitchen-sink report.
- Use monochrome presentation; reserve color for pass, warning, and failure status.
- Use real evidence. If evidence is unavailable, name the gap instead of inventing it.
- Keep tables compact. Move long explanation into prose or callouts.
- Add alt text to every gallery image.
- Keep links and published media absolute HTTPS URLs. Relative media is allowed before `publish.mjs` rewrites it.
- Use inline SVG for diagrams. Do not add remote scripts, stylesheets, fonts, iframes, event handlers, or `javascript:` URLs.
- Use `custom-html` for an unusual layout, not to rebuild standard blocks.

## Included commands

```bash
# Validate source JSON without rendering
node scripts/validate.mjs /path/to/report.json

# Validate an already rendered file
node scripts/validate.mjs --html /path/to/report.html

# Upload one standalone artifact when automatic media rewriting is unnecessary
node scripts/upload-artifact.mjs /path/to/file --key reports/name/file

# Check public URLs
node scripts/upload-artifact.mjs --verify https://cdn.example.com/reports/name/report.html
```
