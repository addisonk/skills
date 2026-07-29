import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

import {
  collectLocalMedia,
  publishReport,
  rewriteLocalMedia,
} from "../scripts/lib/upload-core.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const template = join(here, "..", "templates", "document.html");

const source = {
  version: 1,
  document: {
    title: "Checkout evidence",
    summary: "Evidence for the critical checkout flow.",
    type: "evidence",
    date: "2026-07-29",
  },
  blocks: [
    {
      type: "gallery",
      id: "screenshots",
      title: "Screenshots",
      items: [{ image: "media/checkout.png", alt: "Completed checkout" }],
    },
    {
      type: "recording",
      id: "recording",
      title: "Recording",
      video: "media/checkout.mp4",
      label: "Checkout run",
      poster: "https://cdn.example.com/poster.png",
    },
  ],
  publish: { keyPrefix: "reports" },
};

test("collects only relative local media and rewrites a cloned source", () => {
  assert.deepEqual(collectLocalMedia(source), ["media/checkout.png", "media/checkout.mp4"]);
  const rewritten = rewriteLocalMedia(source, new Map([
    ["media/checkout.png", "https://cdn.test/checkout.png"],
    ["media/checkout.mp4", "https://cdn.test/checkout.mp4"],
  ]));

  assert.equal(source.blocks[0].items[0].image, "media/checkout.png", "input must not be mutated");
  assert.equal(rewritten.blocks[0].items[0].image, "https://cdn.test/checkout.png");
  assert.equal(rewritten.blocks[1].video, "https://cdn.test/checkout.mp4");
  assert.equal(rewritten.blocks[1].poster, "https://cdn.example.com/poster.png");
});

test("publishes assets before HTML, rewrites the rendered copy, and verifies every URL", async () => {
  const dir = await mkdtemp(join(tmpdir(), "html-report-publish-"));
  const mediaDir = join(dir, "media");
  await import("node:fs/promises").then(({ mkdir }) => mkdir(mediaDir));
  await writeFile(join(mediaDir, "checkout.png"), "png");
  await writeFile(join(mediaDir, "checkout.mp4"), "mp4");
  const sourcePath = join(dir, "report.json");
  const outputPath = join(dir, "report.html");
  await writeFile(sourcePath, JSON.stringify(source));

  const uploaded = [];
  const verified = [];
  const upload = async (file, key) => {
    uploaded.push({ file: basename(file), key });
    return `https://cdn.test/${key}`;
  };
  const verify = async (urls) => {
    verified.push(...urls);
    return urls.map((url) => ({ url, status: 200, contentType: "test/type" }));
  };

  const result = await publishReport({ sourcePath, outputPath, templatePath: template, key: "checkout", upload, verify });

  assert.deepEqual(uploaded.map(({ file }) => file), ["checkout.png", "checkout.mp4", "report.html"]);
  assert.equal(uploaded.at(-1).key, "reports/checkout/report.html");
  assert.equal(result.reportUrl, "https://cdn.test/reports/checkout/report.html");
  assert.deepEqual(verified, [
    "https://cdn.test/reports/checkout/assets/checkout.png",
    "https://cdn.test/reports/checkout/assets/checkout.mp4",
    "https://cdn.test/reports/checkout/report.html",
  ]);
  const html = await readFile(outputPath, "utf8");
  assert.match(html, /https:\/\/cdn\.test\/reports\/checkout\/assets\/checkout\.png/);
  assert.doesNotMatch(html, /"publish"/);
});
