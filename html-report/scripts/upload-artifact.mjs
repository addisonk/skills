#!/usr/bin/env node
import { stat } from "node:fs/promises";
import { basename, dirname } from "node:path";
import { resolveUploadConfig, uploadFile, verifyUrls } from "./lib/upload-core.mjs";

const args = process.argv.slice(2);
try {
  if (args[0] === "--verify") {
    if (args.length < 2) throw new Error("Usage: node scripts/upload-artifact.mjs --verify <url> [<url> ...]");
    const results = await verifyUrls(args.slice(1));
    for (const result of results) console.log(`OK   ${result.status}  ${result.contentType}  ${result.url}`);
    process.exit(0);
  }

  const file = args[0];
  if (!file) throw new Error("Usage: node scripts/upload-artifact.mjs <file> [--key <object-key>]");
  let key;
  for (let index = 1; index < args.length; index += 1) {
    if (args[index] === "--key") key = args[++index];
    else throw new Error(`Unknown argument: ${args[index]}`);
  }
  if (!key && args.includes("--key")) throw new Error("--key needs a value");
  const info = await stat(file);
  if (!info.isFile()) throw new Error(`File not found: ${file}`);
  const config = resolveUploadConfig();
  const objectKey = key || [config.keyPrefix, basename(dirname(file)), basename(file)].filter(Boolean).join("/");
  console.log(await uploadFile(file, objectKey, config));
} catch (error) {
  console.error(`ERROR: ${error.message}`);
  process.exit(1);
}
