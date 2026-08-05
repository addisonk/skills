---
name: html-report
description: Use when the user explicitly asks for a polished single-file HTML report, shareable report, interactive report, or link-ready report for a specification, plan, explainer, audit, research summary, or QA evidence packet.
---

# HTML Report

Create a disposable, decision-ready document with the reusable report engine. Keep ordinary answers in Markdown; use this skill only for the explicit HTML-report requests named in the description, not production pages or UI prototypes.

## Workflow

### 1. Establish the source contract

Before authoring, sort the input into four classes:

- **Supplied material** — facts, requirements, evidence, constraints, and exclusions. Preserve their meaning and certainty.
- **Grounded synthesis** — conclusions directly supported by supplied material. Make the supporting material traceable in the report.
- **Open items** — unknowns, gaps, and undecided choices. Keep them open.
- **Recommendations** — new proposals or inferences. Include these only when the user asks for recommendations, and label them as recommendations rather than facts, evidence, requirements, or acceptance criteria.

Authentic screenshots, recordings, documents, test output, and metrics remain source evidence. Preserve them rather than recreating their content. When evidence is missing, record a gap.

This step is complete when every material claim has a clear source class and no open item has silently become a decision.

### 2. Place the report and choose a preset

Save the source JSON and rendered HTML in the current project, close to the work they document. Follow an existing reports or artifacts convention. Otherwise, use clearly named `<topic>-report.json` and `<topic>-report.html` files beside the nearest relevant source, or in the project root for a project-wide report. Use a temporary directory only when no project applies or the user wants no project files, and disclose its location.

Copy the closest preset from `templates/`:

- `report.json` — decisions, findings, status, risks, and recommendations
- `spec-or-plan.json` — requirements, architecture, steps, and acceptance criteria
- `explainer.json` — concepts, mental models, flows, and examples
- `evidence-report.json` — verdicts, tested flows, media, and gaps

Read [document-types.md](references/document-types.md) only when the choice is unclear. Treat copied JSON and rendered HTML as disposable output; do not commit them unless the user asks.

### 3. Shape the report for scanning

Open `templates/report-blocks.html` in a browser to inspect the exact visual library. Use only the block types and JSON shapes in that catalog or [block-catalog.md](references/block-catalog.md); the reference is the source of truth for block order, grouping, and metadata fields. Generated reports omit catalog-only **Show JSON** disclosures.

Lead with a title and summary that state what the report establishes and why it matters. Keep only sections that help the reader understand or decide something.

- Keep `context.body` to one or two sentences.
- Move three or more parallel facts, rules, options, or steps into `context.items`, `properties`, `specs`, `ledger`, `flowchart`, or another fitting structured block.
- Choose columns by payload, not item count. Classify a repeated set by its densest item:
  - **Glanceable** — a title, one value or status, and one short sentence. Use up to three columns.
  - **Comparative** — a short explanation plus one supporting layer such as a list, visual, or evidence note. Use up to two columns.
  - **Explanatory** — multiple supporting layers such as a metric, chart, rationale, evidence, and conclusion. Use one column, or split the layers into `specs`, `ledger`, or nested accordions.
- Set `density` on every `verdict`, `metrics`, and `charts` block. Let the renderer choose the permitted column count; use optional `columns` only to make the grid narrower. The validator independently checks the payload and rejects an understated density or excessive column count. Read [block-catalog.md](references/block-catalog.md) for the exact content-fit contract.
- Make the argument apparent from section and item titles; use descriptions for evidence, qualifications, and exceptions.
- Prefer a few strong sections. Use `specs` for longer descriptions and `ledger` for compact key/value rows.
- Use media blocks only when the referenced media exists.
- Preserve the canonical monochrome presentation; reserve color for status.

This step is complete when the headings alone form a useful outline, every repeated set uses the column count allowed by its densest item, and the report contains no work-log narration or unsupported content.

### 4. Validate and render

From this skill folder, run:

```bash
node scripts/validate.mjs /path/to/report.json
node scripts/render.mjs /path/to/report.json /path/to/report.html
node scripts/validate.mjs --html /path/to/report.html
```

Fix the source JSON and rerun the commands until all three pass. Source and HTML validation both enforce grid content fit. The result is one responsive HTML file with inline layout and behavior. Keep the shared engine intact: do not edit generated HTML, add one-off block types, or fork the renderer.

### 5. Verify the rendered document

Open the report in the available in-app browser. If the browser blocks a local `file://` URL, serve only the report directory on loopback with an available port, open the corresponding `http://127.0.0.1:<port>/...` URL, and stop that server after verification.

Check the opening view at desktop width and one narrow mobile width. Correct overflow, broken media, missing sections, weak hierarchy, and passages that are hard to scan by editing the source JSON and rerendering.

This step is complete only after both widths have been inspected and the validators still pass. Return the absolute path to the HTML file.

### 6. Publish only when explicitly requested

Local rendering requires no credentials. For an explicit request for a public link, read [publishing.md](references/publishing.md), then run:

```bash
node scripts/publish.mjs /path/to/report.json /path/to/report.html --key short-report-name
```

Publishing uploads relative media first, rewrites a cloned source to public URLs, uploads the HTML last, verifies the URLs, and prints the report URL. Keep credentials out of report JSON. Published links and media must use absolute HTTPS URLs.

## Completion criteria

A finished report has:

- source JSON and a rendered single-file HTML document in the disclosed location;
- no unsupported claims or silently resolved open decisions;
- a conclusion-led, scannable structure using canonical blocks;
- passing source and rendered-file validation;
- verified desktop and narrow-mobile presentation;
- no new application scaffolding, dependencies, reusable abstractions, or committed disposable output; and
- a public URL only when the user explicitly requested publishing.

## Other included commands

```bash
# Upload one standalone artifact
node scripts/upload-artifact.mjs /path/to/file --key reports/name/file

# Check public URLs
node scripts/upload-artifact.mjs --verify https://cdn.example.com/reports/name/report.html
```
