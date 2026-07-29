#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseReportSource, renderReport, validateRenderedHtml, validateReportSource } from "./lib/report-core.mjs";

const [sourcePath, outputPath] = process.argv.slice(2);
if (!sourcePath || !outputPath || process.argv.length !== 4) {
  console.error("Usage: node scripts/render.mjs <source.json> <output.html>");
  process.exit(2);
}

try {
  const here = dirname(fileURLToPath(import.meta.url));
  const [sourceText, template] = await Promise.all([
    readFile(sourcePath, "utf8"),
    readFile(join(here, "..", "templates", "document.html"), "utf8"),
  ]);
  const source = parseReportSource(sourceText, sourcePath);
  const sourceErrors = validateReportSource(source);
  if (sourceErrors.length) throw new Error(sourceErrors.join("\n"));
  const html = renderReport(source, template);
  const htmlErrors = validateRenderedHtml(html);
  if (htmlErrors.length) throw new Error(htmlErrors.join("\n"));
  await writeFile(outputPath, html);
  console.log(outputPath);
} catch (error) {
  console.error(`ERROR: ${error.message}`);
  process.exit(1);
}
