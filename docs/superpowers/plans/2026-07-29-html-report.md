# HTML Report Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a tested `html-report` skill that renders structured JSON into polished HTML and optionally publishes the document and its media to S3-compatible storage.

**Architecture:** A shared Node module validates source JSON, injects escaped data into one HTML shell, and validates rendered output. Thin CLI scripts expose validation and rendering. A second shared module implements SigV4 upload and URL verification; `publish.mjs` rewrites local media in a cloned manifest, uploads assets, renders the CDN-ready document, uploads HTML last, and verifies every URL.

**Tech Stack:** Node.js built-ins, ESM, `node:test`, semantic HTML, CSS, browser JavaScript, AWS Signature Version 4.

## Global Constraints

- Create the skill at `design/html-report/` and add it to the Design table in `README.md`.
- Trigger only when the user explicitly requests an HTML report, spec, plan, explainer, audit, research document, or QA evidence page.
- Keep `html-artifact` and `e2e-test` unchanged.
- Keep all CSS and runtime JavaScript inside the generated HTML; permit absolute HTTPS evidence media and ordinary links.
- Use standard blocks first and `custom-html` only for content outside the block catalog.
- Local rendering works without upload credentials; CDN publishing is an explicit optional branch.
- Keep credentials in environment variables and publish configuration non-secret.
- Use Node built-ins only; add no package dependency.

---

### Task 1: Baseline evaluations and scaffold

**Files:**
- Create: `docs/superpowers/evals/2026-07-29-html-report-baseline.md`
- Create: `design/html-report/SKILL.md`
- Create: `design/html-report/agents/openai.yaml`
- Create: `design/html-report/scripts/`
- Create: `design/html-report/references/`
- Create: `design/html-report/templates/`

**Interfaces:**
- Consumes: the three baseline prompts from the design spec.
- Produces: recorded baseline failures and an initialized skill directory with no implemented behavior.

- [ ] **Step 1: Run three baseline evaluations without the new skill**

Use fresh agents and dedicated temporary output directories for status-report, implementation-spec, and QA-evidence tasks. Record exact observed failures in `docs/superpowers/evals/2026-07-29-html-report-baseline.md`, including whether each agent produces reusable structure, validates output, handles missing evidence honestly, and verifies desktop/mobile rendering.

- [ ] **Step 2: Confirm RED**

The baseline is red when at least one required behavior is missing or inconsistent across runs. Preserve the exact failure descriptions for the GREEN implementation.

- [ ] **Step 3: Initialize the skill**

Run the system skill initializer with `--resources scripts,references`, then add `templates/`:

```bash
python3 /Users/addisonkowalski/.codex/skills/.system/skill-creator/scripts/init_skill.py \
  html-report \
  --path design \
  --resources scripts,references \
  --interface display_name="HTML Report" \
  --interface short_description="Create structured, polished HTML documents" \
  --interface default_prompt="Create a polished HTML report for this material."
mkdir -p design/html-report/templates
```

- [ ] **Step 4: Commit the initialized structure with the baseline record**

```bash
git add docs/superpowers/evals/2026-07-29-html-report-baseline.md design/html-report
git commit -m "chore: scaffold html-report skill"
```

### Task 2: Source validation and rendering core

**Files:**
- Create: `design/html-report/scripts/lib/report-core.mjs`
- Create: `design/html-report/scripts/validate.mjs`
- Create: `design/html-report/scripts/render.mjs`
- Create: `design/html-report/tests/report-core.test.mjs`
- Create: `design/html-report/templates/document.html`

**Interfaces:**
- Produces: `validateSource(data, options)`, `validateHtml(html)`, `renderDocument(data, template)`, `loadAndValidateSource(path)`, and `writeRenderedDocument(sourcePath, outputPath)`.
- Consumes: `templates/document.html` containing exactly one `__REPORT_DATA__` token.

- [ ] **Step 1: Write failing validator tests**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { validateSource } from "../scripts/lib/report-core.mjs";

const valid = {
  version: 1,
  document: { title: "Release readiness", summary: "Evidence and risks.", type: "report", date: "2026-07-29" },
  blocks: [{ type: "prose", id: "summary", title: "Summary", html: "<p>Ready.</p>" }],
};

test("accepts a valid document", () => assert.deepEqual(validateSource(valid), []));
test("rejects duplicate block ids", () => {
  const data = structuredClone(valid);
  data.blocks.push({ ...data.blocks[0] });
  assert.match(validateSource(data).join("\n"), /duplicate block id/i);
});
test("rejects executable custom HTML", () => {
  const data = structuredClone(valid);
  data.blocks = [{ type: "custom-html", id: "custom", title: "Custom", html: "<img onerror=alert(1)>" }];
  assert.match(validateSource(data).join("\n"), /event-handler/i);
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `node --test design/html-report/tests/report-core.test.mjs`

Expected: FAIL because `report-core.mjs` does not exist.

- [ ] **Step 3: Implement source validation**

Implement the exported interface with block-specific requirements, ASCII anchor validation, duplicate detection, HTML-fragment safety checks, media-label checks, and actionable error strings. Use a schema table so each block type has one source of truth:

```js
export const BLOCK_RULES = {
  prose: { required: ["html"] },
  callout: { required: ["html"] },
  quote: { required: ["text"] },
  stats: { requiredArrays: ["items"] },
  table: { requiredArrays: ["columns", "rows"] },
  comparison: { requiredArrays: ["items"] },
  checklist: { requiredArrays: ["items"] },
  timeline: { requiredArrays: ["items"] },
  code: { required: ["code"] },
  diagram: { required: ["svg"] },
  verdict: { required: ["status", "lead"] },
  "flow-results": { requiredArrays: ["flows"] },
  gallery: { requiredArrays: ["items"] },
  recording: { required: ["video", "label"] },
  gaps: { requiredArrays: ["items"] },
  sources: { requiredArrays: ["items"] },
  "custom-html": { required: ["html"] },
};
```

- [ ] **Step 4: Write failing render tests**

```js
import { renderDocument, validateHtml } from "../scripts/lib/report-core.mjs";

test("escapes report data before embedding it in a script element", () => {
  const data = structuredClone(valid);
  data.blocks[0].html = "<p></script><script>alert(1)</script></p>";
  assert.throws(() => renderDocument(data, "__REPORT_DATA__"), /unsafe/i);
});

test("rejects unresolved template tokens in output", () => {
  assert.match(validateHtml("<html>__REPORT_DATA__</html>").join("\n"), /unresolved/i);
});
```

- [ ] **Step 5: Implement rendering and the CLI wrappers**

`renderDocument` will strip the non-rendered `publish` configuration, serialize JSON, escape `<`, `>`, `&`, U+2028, and U+2029, replace the one template token, then validate the output. The CLIs will use these signatures:

```text
node scripts/validate.mjs <source.json>
node scripts/validate.mjs --html <output.html>
node scripts/render.mjs <source.json> <output.html>
```

- [ ] **Step 6: Implement the complete HTML shell**

The shell will parse `#report-data`, render navigation and every standard block, preserve source order, and use semantic elements. Its embedded CSS will provide responsive layout, dark mode, print rules, status colors, code styling, accessible tables, galleries, video, and inline SVG.

- [ ] **Step 7: Run tests and verify GREEN**

Run: `node --test design/html-report/tests/report-core.test.mjs`

Expected: all tests pass.

- [ ] **Step 8: Commit the rendering core**

```bash
git add design/html-report/scripts design/html-report/templates/document.html design/html-report/tests
git commit -m "feat: add html-report renderer and validator"
```

### Task 3: Document presets and block fixtures

**Files:**
- Create: `design/html-report/templates/report.json`
- Create: `design/html-report/templates/spec-or-plan.json`
- Create: `design/html-report/templates/explainer.json`
- Create: `design/html-report/templates/evidence-report.json`
- Create: `design/html-report/tests/presets.test.mjs`

**Interfaces:**
- Consumes: `writeRenderedDocument(sourcePath, outputPath)`.
- Produces: four valid, realistic presets that exercise every standard block at least once across the suite.

- [ ] **Step 1: Write a failing preset test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validateSource } from "../scripts/lib/report-core.mjs";

for (const name of ["report", "spec-or-plan", "explainer", "evidence-report"]) {
  test(`${name} preset validates`, async () => {
    const raw = await readFile(new URL(`../templates/${name}.json`, import.meta.url), "utf8");
    assert.deepEqual(validateSource(JSON.parse(raw)), []);
  });
}
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test design/html-report/tests/presets.test.mjs`

Expected: FAIL because the preset JSON files do not exist.

- [ ] **Step 3: Add the four presets**

Use realistic content and valid HTTPS evidence URLs. Spread block coverage across the four files; keep each preset focused on its document type.

- [ ] **Step 4: Render and validate every preset**

```bash
for source in design/html-report/templates/{report,spec-or-plan,explainer,evidence-report}.json; do
  name="$(basename "$source" .json)"
  node design/html-report/scripts/render.mjs "$source" "/tmp/html-report-$name.html"
  node design/html-report/scripts/validate.mjs --html "/tmp/html-report-$name.html"
done
```

Expected: four successful renders and four successful validations.

- [ ] **Step 5: Commit the presets**

```bash
git add design/html-report/templates/*.json design/html-report/tests/presets.test.mjs
git commit -m "feat: add html-report document presets"
```

### Task 4: Optional CDN uploader and publisher

**Files:**
- Create: `design/html-report/scripts/lib/upload-core.mjs`
- Create: `design/html-report/scripts/upload-artifact.mjs`
- Create: `design/html-report/scripts/publish.mjs`
- Create: `design/html-report/tests/upload.test.mjs`
- Create: `design/html-report/tests/publish.test.mjs`

**Interfaces:**
- Produces: `contentTypeFor(path)`, `resolveUploadConfig(data, env)`, `uploadFile(options)`, `verifyUrls(urls)`, `collectLocalMedia(data, sourceDir)`, and `rewriteLocalMedia(data, replacements)`.
- Consumes: report-core rendering and validation exports.

- [ ] **Step 1: Write failing upload tests**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { contentTypeFor, resolveUploadConfig } from "../scripts/lib/upload-core.mjs";

test("maps report media content types", () => {
  assert.equal(contentTypeFor("report.html"), "text/html; charset=utf-8");
  assert.equal(contentTypeFor("recording.mp4"), "video/mp4");
});

test("reports every missing upload setting", () => {
  assert.throws(() => resolveUploadConfig({}, {}), /R2_ENDPOINT.*R2_BUCKET.*R2_PUBLIC_URL/s);
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `node --test design/html-report/tests/upload.test.mjs`

Expected: FAIL because `upload-core.mjs` does not exist.

- [ ] **Step 3: Implement dependency-free SigV4 upload and verification**

Adapt the proven E2E uploader into importable functions. Select `http` or `https` from the endpoint URL so tests can use a disposable local server. Keep credentials in the environment and return the public URL only after a 200 or 201 upload response.

- [ ] **Step 4: Write the publisher integration test**

Start a local HTTP fixture that records PUT order and serves uploaded bodies. Publish a temporary source with one local image. Assert that the source stays unchanged, the asset uploads before the HTML, the output contains the public asset URL, and URL verification succeeds.

- [ ] **Step 5: Implement `publish.mjs`**

Expose:

```text
node scripts/publish.mjs <source.json> <output.html> [--key <report-key>]
```

Clone source data, collect existing relative media fields, upload them under `<keyPrefix>/<slug>/assets/`, rewrite the clone, render the publishable HTML, upload HTML last, verify all public URLs, and print the report URL.

- [ ] **Step 6: Run uploader and publisher tests**

Run: `node --test design/html-report/tests/upload.test.mjs design/html-report/tests/publish.test.mjs`

Expected: all tests pass without contacting a live CDN.

- [ ] **Step 7: Commit publishing support**

```bash
git add design/html-report/scripts design/html-report/tests
git commit -m "feat: add optional html-report publishing"
```

### Task 5: Skill instructions and references

**Files:**
- Modify: `design/html-report/SKILL.md`
- Modify: `design/html-report/agents/openai.yaml`
- Create: `design/html-report/references/block-catalog.md`
- Create: `design/html-report/references/document-types.md`
- Create: `design/html-report/references/publishing.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: every CLI and preset created in Tasks 2–4.
- Produces: a model-discoverable workflow with one-level context pointers and exact completion criteria.

- [ ] **Step 1: Write the minimal skill against baseline failures**

Keep the body below 500 lines. Use positive output contracts, precise CLI commands, and these completion criteria:

```text
Source complete: every factual section and available evidence appears in an ordered block.
Render complete: source and output validators both exit zero.
Visual check complete: desktop and 400px mobile views have no overflow, broken navigation, missing media, or console errors.
Publish complete: every uploaded URL verifies and the hosted report renders in a browser.
```

- [ ] **Step 2: Write the three references**

Document every block once in `block-catalog.md`, preset selection in `document-types.md`, and optional upload configuration and commands in `publishing.md`. Put a table of contents at the top of any reference longer than 100 lines.

- [ ] **Step 3: Regenerate Codex metadata**

```bash
python3 /Users/addisonkowalski/.codex/skills/.system/skill-creator/scripts/generate_openai_yaml.py \
  design/html-report \
  --interface display_name="HTML Report" \
  --interface short_description="Create structured, polished HTML documents" \
  --interface default_prompt="Create a polished HTML report for this material."
```

- [ ] **Step 4: Add the README entry**

Add `html-report` to the Design table with a concise description covering structured reports, specs, plans, explainers, and evidence pages.

- [ ] **Step 5: Validate the skill and prose**

```bash
python3 /Users/addisonkowalski/.codex/skills/.system/skill-creator/scripts/quick_validate.py design/html-report
wc -l design/html-report/SKILL.md
rg -n "TBD|TODO|FIXME|PLACEHOLDER" design/html-report README.md
```

Expected: validation passes, `SKILL.md` is under 500 lines, and the placeholder scan is empty.

- [ ] **Step 6: Commit skill documentation**

```bash
git add design/html-report README.md
git commit -m "docs: add html-report skill workflow"
```

### Task 6: Forward evaluation, visual verification, and PR readiness

**Files:**
- Modify as needed: `design/html-report/**`
- Modify: `docs/superpowers/plans/2026-07-29-html-report.md`

**Interfaces:**
- Consumes: the completed skill and baseline prompts.
- Produces: passing fresh-agent evaluations, passing browser checks, a clean branch, and a ready pull request.

- [ ] **Step 1: Run all automated checks**

```bash
node --test design/html-report/tests/*.test.mjs
python3 /Users/addisonkowalski/.codex/skills/.system/skill-creator/scripts/quick_validate.py design/html-report
git diff --check
```

- [ ] **Step 2: Run fresh-agent GREEN evaluations**

Run the three baseline-equivalent prompts with `html-report`. Verify preset selection, standard-block use, source/output validation, honest evidence handling, and successful local rendering.

- [ ] **Step 3: Inspect representative HTML in a browser**

Open the report and evidence presets at desktop and 400-pixel mobile widths. Check navigation, overflow, light/dark rendering, media states, console output, and print layout. Fix every observed defect and rerun the checks.

- [ ] **Step 4: Review the diff for skill quality**

Check invocation wording, information hierarchy, completion criteria, duplication, stale references, no-op instructions, and repo conventions. Apply focused fixes and rerun all checks.

- [ ] **Step 5: Push and update the pull request**

```bash
git push
gh pr ready 24
gh pr checks 24 --watch
```

Expected: draft status removed and required checks pass.
