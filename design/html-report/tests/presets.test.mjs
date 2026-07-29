import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { renderReport, validateRenderedHtml, validateReportSource } from "../scripts/lib/report-core.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const templateDir = join(root, "templates");
const presetNames = ["report.json", "spec-or-plan.json", "explainer.json", "evidence-report.json"];
const supportedBlockTypes = new Set([
  "prose", "callout", "quote", "stats", "table", "comparison", "checklist",
  "timeline", "code", "diagram", "verdict", "flow-results", "gallery",
  "recording", "gaps", "sources", "custom-html",
]);

test("ships exactly the documented JSON presets", async () => {
  const files = (await readdir(templateDir)).filter((name) => name.endsWith(".json")).sort();
  assert.deepEqual(files, presetNames.toSorted());
});

test("every preset validates and renders", async (t) => {
  const template = await readFile(join(templateDir, "document.html"), "utf8");
  const coveredTypes = new Set();

  for (const name of presetNames) {
    await t.test(name, async () => {
      const source = JSON.parse(await readFile(join(templateDir, name), "utf8"));
      assert.deepEqual(validateReportSource(source), []);
      for (const block of source.blocks) coveredTypes.add(block.type);
      const html = renderReport(source, template);
      assert.deepEqual(validateRenderedHtml(html), []);
      assert.ok(html.length > 15_000, `${name} should produce a substantial standalone document`);
    });
  }

  assert.deepEqual(coveredTypes, supportedBlockTypes);
});
