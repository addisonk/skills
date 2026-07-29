import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  parseReportSource,
  renderReport,
  validateRenderedHtml,
  validateReportSource,
} from "../scripts/lib/report-core.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const skillRoot = join(here, "..");

const validSource = {
  version: 1,
  document: {
    title: "Launch readiness",
    summary: "A concise view of readiness, risk, and next actions.",
    type: "report",
    date: "2026-07-29",
    status: "Ready with conditions",
    tags: ["launch", "readiness"],
  },
  blocks: [
    {
      type: "prose",
      id: "overview",
      title: "Overview",
      html: "<p>The release is ready after the two named follow-ups.</p>",
    },
    {
      type: "stats",
      id: "signals",
      title: "Signals",
      items: [
        { label: "Checks passed", value: "18/18", detail: "Required suite" },
        { label: "Open blockers", value: "0", detail: "At review time" },
      ],
    },
    {
      type: "custom-html",
      id: "special-layout",
      title: "Special layout",
      html: "<div class=\"custom-grid\"><strong>Controlled extension</strong></div>",
    },
  ],
};

test("validates the shared source contract", () => {
  assert.deepEqual(validateReportSource(validSource), []);
});

test("returns actionable source errors", () => {
  const invalid = structuredClone(validSource);
  invalid.blocks[1].id = "Overview";
  invalid.blocks.push({
    type: "prose",
    id: "overview",
    title: "Duplicate",
    html: "<script>alert('no')</script>",
  });

  const errors = validateReportSource(invalid);
  assert.ok(errors.some((error) => error.includes("blocks[1].id") && error.includes("lowercase")));
  assert.ok(errors.some((error) => error.includes("duplicate block id")));
  assert.ok(errors.some((error) => error.includes("blocks[3].html") && error.includes("script")));
});

test("parses JSON with a useful error", () => {
  assert.throws(
    () => parseReportSource('{"version":1,'),
    /Invalid report JSON/,
  );
});

test("renders a portable single-file document with embedded source data", async () => {
  const template = await readFile(join(skillRoot, "templates/document.html"), "utf8");
  const html = renderReport(validSource, template);

  assert.match(html, /<!doctype html>/i);
  assert.match(html, /id="report-data"/);
  assert.match(html, /Launch readiness/);
  assert.doesNotMatch(html, /__REPORT_DATA__/);
  assert.doesNotMatch(html, /<script[^>]+src=/i);
  assert.doesNotMatch(html, /<link[^>]+stylesheet/i);
  assert.deepEqual(validateRenderedHtml(html), []);
});

test("escapes serialized data so report content cannot close the JSON script", async () => {
  const source = structuredClone(validSource);
  source.blocks[0].html = "<p>Literal </script> text remains data.</p>";
  const template = await readFile(join(skillRoot, "templates/document.html"), "utf8");
  const html = renderReport(source, template);

  assert.equal((html.match(/<\/script>/gi) || []).length, 2);
  assert.match(html, /\\u003c\/script\\u003e/);
});

test("rejects an invalid template token count", () => {
  assert.throws(() => renderReport(validSource, "<html></html>"), /exactly one __REPORT_DATA__/);
});

test("detects broken anchors and remote runtime dependencies", () => {
  const invalidHtml = `<!doctype html><html><head>
    <link rel="stylesheet" href="https://example.com/theme.css">
  </head><body><a href="#missing">Missing</a><script src="https://example.com/app.js"></script></body></html>`;
  const errors = validateRenderedHtml(invalidHtml);
  assert.ok(errors.some((error) => error.includes("broken anchor")));
  assert.ok(errors.some((error) => error.includes("remote stylesheet")));
  assert.ok(errors.some((error) => error.includes("remote script")));
});
