#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { parseReportSource, validateRenderedHtml, validateReportSource } from "./lib/report-core.mjs";

const args = process.argv.slice(2);
const htmlMode = args[0] === "--html";
const file = htmlMode ? args[1] : args[0];
if (!file || args.length !== (htmlMode ? 2 : 1)) {
  console.error("Usage: node scripts/validate.mjs [--html] <file>");
  process.exit(2);
}

try {
  const text = await readFile(file, "utf8");
  const errors = htmlMode
    ? validateRenderedHtml(text)
    : validateReportSource(parseReportSource(text, file));
  if (errors.length) {
    for (const error of errors) console.error(`ERROR: ${error}`);
    process.exit(1);
  }
  console.log(`OK: ${file}`);
} catch (error) {
  console.error(`ERROR: ${error.message}`);
  process.exit(1);
}
