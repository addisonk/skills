#!/usr/bin/env node
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { publishReport } from "./lib/upload-core.mjs";

const args = process.argv.slice(2);
const sourcePath = args.shift();
const outputPath = args.shift();
let key;
while (args.length) {
  const argument = args.shift();
  if (argument === "--key") key = args.shift();
  else {
    console.error(`ERROR: Unknown argument: ${argument}`);
    process.exit(2);
  }
}
if (!sourcePath || !outputPath || (process.argv.includes("--key") && !key)) {
  console.error("Usage: node scripts/publish.mjs <source.json> <output.html> [--key <report-key>]");
  process.exit(2);
}

try {
  const here = dirname(fileURLToPath(import.meta.url));
  const result = await publishReport({
    sourcePath,
    outputPath,
    templatePath: join(here, "..", "templates", "report-template.html"),
    key,
  });
  for (const verification of result.verification) {
    console.log(`OK   ${verification.status}  ${verification.contentType}  ${verification.url}`);
  }
  console.log(result.reportUrl);
} catch (error) {
  console.error(`ERROR: ${error.message}`);
  process.exit(1);
}
