# HTML Report Skill Design

**Date:** 2026-07-29
**Status:** Approved for implementation planning

## Summary

Create a standalone `html-report` skill for polished, structured HTML documents. It will support reports, specs, plans, explainers, audits, research, and evidence-heavy documents. It will trigger when a user explicitly requests HTML, preserving Markdown as the default for ordinary documentation workflows.

The skill will combine a deterministic, JSON-driven block system with one controlled `custom-html` escape hatch. It will generate a portable HTML file locally by default and optionally publish files to an S3-compatible CDN when the user requests a shareable URL and upload credentials are configured.

`html-artifact` and `e2e-test` will remain unchanged in the first release. The new skill will adapt the strongest proven ideas from both without depending on either skill at runtime.

## Goals

- Produce consistent HTML documents across several document types.
- Make common documents authorable by editing structured data instead of page markup.
- Preserve enough flexibility for inline SVG, unusual compositions, and specialized evidence.
- Generate responsive, accessible, dark-mode-aware, printable output.
- Validate document structure and portability before handoff.
- Offer optional, dependency-free publishing to Cloudflare R2 or another S3-compatible service.
- Keep the skill self-contained and usable across projects.

## Non-goals

- Replace `html-artifact` or migrate its users.
- Refactor `e2e-test` to consume the new skill.
- Build a general website, React application, or visual page builder.
- Add a hosted report service or require CDN credentials for local generation.
- Support arbitrary executable JavaScript inside document content.

## Invocation and naming

The skill will live at `design/html-report/` and use the name `html-report`.

Its model-facing description will cover explicit requests for an HTML report, spec, plan, explainer, audit, research document, or QA evidence page. The description will describe triggering conditions, while the skill body will contain the authoring process.

This boundary keeps the skill discoverable without turning every long Markdown document into HTML.

## Authoring model

Each document has two artifacts:

1. A JSON source file containing metadata, theme choices, and ordered blocks.
2. A generated, single-file HTML document containing the theme, renderer, and document data.

The renderer will preserve source order. Document-type presets provide useful defaults without imposing one canonical order across every type of document.

### Standard blocks

The first release will include blocks already proven useful by `e2e-test` or `html-artifact`:

| Family | Blocks |
| --- | --- |
| Narrative | `prose`, `callout`, `quote` |
| Data | `stats`, `table`, `comparison`, `checklist`, `timeline` |
| Technical | `code`, `diagram` |
| Evidence | `verdict`, `flow-results`, `gallery`, `recording`, `gaps` |
| Structural | `sources`, `custom-html` |

The document header is top-level metadata rather than a block. It carries the title, summary, type, status, date, provenance, and optional tags.

### Custom HTML escape hatch

`custom-html` will accept semantic HTML and inline SVG for content the standard catalog cannot express. It is an escape hatch, not the default authoring surface.

The validator will reject executable or externally styled fragments, including script tags, event-handler attributes, `javascript:` URLs, iframes, remote stylesheets, and remote scripts. Custom fragments may use classes and tokens provided by the document shell.

## Skill contents

```text
design/html-report/
├── SKILL.md
├── scripts/
│   ├── render.mjs
│   ├── validate.mjs
│   ├── publish.mjs
│   └── upload-artifact.mjs
├── templates/
│   ├── document.html
│   ├── report.json
│   ├── spec-or-plan.json
│   ├── explainer.json
│   └── evidence-report.json
└── references/
    ├── block-catalog.md
    ├── document-types.md
    └── publishing.md
```

The repository README will gain a Design-table entry for `html-report`.

### `SKILL.md`

`SKILL.md` will stay below 500 lines and contain only the common workflow:

1. Choose the closest document preset.
2. Gather the content and evidence.
3. Fill ordered standard blocks.
4. Use `custom-html` only for content outside the catalog.
5. Render and validate the document.
6. Inspect it at desktop and mobile widths.
7. Publish only when the user requests a hosted URL.

Each step will end with a checkable completion criterion. Conditional details will live one level down in the reference files.

### Templates

`document.html` will own the visual system and rendering engine. It will embed:

- Responsive layout and navigation.
- Light and dark palettes.
- Print styles.
- Semantic block renderers.
- Status colors reserved for pass, warning, and failure states.
- Accessible headings, media labels, tables, and inline SVG.
- No remote runtime scripts, fonts, or styles.

The JSON presets will demonstrate document composition without duplicating the shell. They will contain realistic starter data rather than placeholder-heavy kitchen sinks.

### References

- `block-catalog.md` will define every block's schema, appropriate use, and one concise example.
- `document-types.md` will map document types to recommended block combinations and identify required fields.
- `publishing.md` will document upload configuration, credential handling, usage, verification, and failure recovery.

Each reference will link directly from `SKILL.md`. References longer than 100 lines will begin with a table of contents.

## Rendering and validation

`render.mjs` will accept a JSON source path and output path. It will validate the source before rendering, embed the source data into the HTML shell safely, and write one portable HTML file.

`validate.mjs` will support source and rendered-output checks:

- Required metadata and valid document type.
- Known block types and required fields for each block.
- Stable, unique ASCII anchor IDs.
- Valid internal navigation targets.
- Safe custom HTML fragments.
- Media with descriptive labels or alternative text.
- External resources limited to declared evidence media and ordinary links.
- No remote scripts, fonts, stylesheets, or imports.
- No unresolved template markers.

Validation will return a non-zero exit code and specific repair instructions for every failure. Rendering will stop until source validation passes.

## Media and portability

Generated HTML will contain all CSS and rendering JavaScript. Reports may reference absolute HTTPS images, recordings, downloadable evidence, and ordinary links. This matches the practical evidence model proven by `e2e-test` while keeping the report shell portable.

Local-only media may remain relative during local drafting. Before CDN publishing, every referenced local asset must be uploaded and replaced with its absolute public URL in a transient publish manifest. The original source JSON remains unchanged as the authoring source of truth.

## Optional CDN publishing

`upload-artifact.mjs` will adapt the E2E skill's dependency-free SigV4 uploader. It will use Node built-ins and support:

```text
node scripts/upload-artifact.mjs <file> [--key <object-key>]
node scripts/upload-artifact.mjs --verify <url> [<url> ...]
```

`publish.mjs` will orchestrate a complete document publication: validate the source, upload declared local media through `upload-artifact.mjs`, build a transient manifest with absolute CDN URLs, render the publishable HTML, upload the HTML last, and verify every URL. It will preserve the local source and draft output.

Configuration will come from environment variables:

- `R2_ENDPOINT`
- `R2_BUCKET`
- `R2_PUBLIC_URL`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- Optional `R2_REGION`

An optional, non-secret upload block in the document source may override the endpoint, bucket, public base URL, region, and key prefix. Credentials will remain in the environment.

Publishing is an explicit branch:

1. Render and validate locally.
2. Upload declared local media.
3. Replace local media references with absolute CDN URLs.
4. Render the publishable HTML.
5. Upload the HTML last.
6. Verify the HTML and every referenced asset return HTTP 200 with a compatible content type.
7. Open the hosted report and inspect the rendered page.

Missing upload configuration will stop the publishing branch with exact setup guidance. Local generation will remain successful and available.

## Source material from existing skills

Implementation will inspect and selectively adapt these E2E assets:

- `references/report-blocks.md` for presence-based block schemas and lean evidence rules.
- `templates/qa-report-blocks.html` for the data-driven renderer and block gallery.
- `templates/qa-report.html`, `example-web.html`, and `example-expo.html` for finished compositions.
- `scripts/upload-artifact.mjs` and `references/uploader.md` for SigV4 upload, content types, configuration, and URL verification.
- `scripts/audit-test-folder.sh` for the principle of preflight validation before upload.

It will also inspect `html-artifact` for document readability, responsive behavior, inline SVG conventions, print treatment, and document-type coverage.

The new skill will own its generic schemas and scripts. E2E-specific assumptions such as mandatory recordings, platform grouping, story labels, and QA-only canonical ordering will remain inside `e2e-test`.

## Error handling

Every script will fail with a non-zero status and a concrete repair message. The main failure classes are:

- Invalid JSON or schema: identify the block and missing or invalid field.
- Unsupported block: list the supported block types.
- Unsafe custom HTML: identify the rejected construct.
- Missing local media: report the unresolved path before rendering or publishing.
- Missing credentials: name the required environment variables and point to `publishing.md`.
- Upload failure: report the file, object key, HTTP status, and a bounded response excerpt.
- Verification failure: list every failed URL and observed content type.

The scripts will preserve the source JSON and local HTML when publishing fails, so the user can repair configuration or retry without rebuilding the document.

## Evaluation strategy

Skill development will follow a RED-GREEN-REFACTOR loop.

### RED: baseline evaluations

Fresh agents without `html-report` will receive three representative requests:

1. Create an HTML status report with statistics, a timeline, risks, and sources.
2. Create an HTML implementation spec with a comparison, code, and a diagram.
3. Create an HTML QA evidence report with verdicts, screenshots, a recording, and gaps.

The evaluation will record output shape, consistency, portability, missing evidence structure, and verification behavior. The skill will address observed failures rather than imagined ones.

### GREEN: implementation evaluations

Fresh agents with `html-report` will receive equivalent tasks. Success requires:

- Selection of the closest preset.
- Use of standard blocks before `custom-html`.
- Successful source and output validation.
- A readable generated artifact at desktop and mobile widths.
- Accurate reporting of unavailable evidence or upload configuration.

### REFACTOR: tighten observed gaps

Any divergent or incomplete behavior will become a focused change to the skill, template, schema, or validator. The same evaluation will run again after each change.

## Automated and visual verification

- Use Node's built-in test runner for renderer, validator, and uploader helpers.
- Test valid presets, invalid fields, duplicate anchors, unsafe custom HTML, unresolved markers, content-type mapping, missing upload configuration, and URL verification failures.
- Run the skill validator against `design/html-report/`.
- Generate all four presets.
- Open representative output at desktop and 400-pixel mobile widths.
- Check light mode, dark mode, print layout, navigation, overflow, console errors, and missing resources.
- Forward-test the completed skill with fresh agents before deployment.

## Completion criteria

The first release is complete when:

- The new skill and README entry are committed.
- All four presets render and validate.
- Standard blocks cover the three baseline evaluation tasks.
- `custom-html` supports inline SVG without weakening the safety checks.
- Local generation works without upload credentials.
- CDN publishing passes local integration tests against a disposable S3-compatible fixture; a live CDN smoke test runs only with explicit approval and a configured test prefix.
- Automated tests, skill validation, and browser checks pass.
- Fresh-agent evaluations show more predictable authoring and verification than the baseline.
- The branch is pushed and a pull request is open for review.
