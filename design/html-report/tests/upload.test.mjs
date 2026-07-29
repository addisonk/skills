import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  contentTypeFor,
  resolveUploadConfig,
  uploadFile,
  verifyUrls,
} from "../scripts/lib/upload-core.mjs";

test("maps common report asset content types", () => {
  assert.equal(contentTypeFor("report.html"), "text/html; charset=utf-8");
  assert.equal(contentTypeFor("evidence.png"), "image/png");
  assert.equal(contentTypeFor("recording.mp4"), "video/mp4");
  assert.equal(contentTypeFor("data.bin"), "application/octet-stream");
});

test("source publishing settings override non-secret environment settings", () => {
  const config = resolveUploadConfig(
    { endpoint: "http://source.test", bucket: "source", publicBase: "http://public.test", region: "test-1", keyPrefix: "/reports/" },
    {
      R2_ENDPOINT: "http://env.test",
      R2_BUCKET: "env",
      R2_PUBLIC_URL: "http://env-public.test",
      R2_REGION: "env-1",
      R2_ACCESS_KEY_ID: "key",
      R2_SECRET_ACCESS_KEY: "secret",
    },
  );

  assert.deepEqual(config, {
    endpoint: "http://source.test",
    bucket: "source",
    publicBase: "http://public.test",
    region: "test-1",
    keyPrefix: "reports",
    accessKeyId: "key",
    secretAccessKey: "secret",
  });
});

test("fails clearly when upload credentials are absent", () => {
  assert.throws(() => resolveUploadConfig({}, {}), /R2_ENDPOINT/);
});

test("uploads with SigV4 and verifies the public URL against a disposable server", async (t) => {
  const http = await import("node:http");
  const received = [];
  const server = http.createServer((request, response) => {
    if (request.method === "PUT") {
      const chunks = [];
      request.on("data", (chunk) => chunks.push(chunk));
      request.on("end", () => {
        received.push({ request, body: Buffer.concat(chunks) });
        response.writeHead(200).end();
      });
      return;
    }
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }).end("ok");
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => server.close());
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;
  const dir = await mkdtemp(join(tmpdir(), "html-report-upload-"));
  const file = join(dir, "report.html");
  await writeFile(file, "<!doctype html><title>Test</title>");
  const config = {
    endpoint: base,
    bucket: "artifacts",
    publicBase: base,
    region: "auto",
    keyPrefix: "reports",
    accessKeyId: "test-key",
    secretAccessKey: "test-secret",
  };

  const url = await uploadFile(file, "reports/demo/report.html", config);
  assert.equal(url, `${base}/reports/demo/report.html`);
  assert.equal(received.length, 1);
  assert.equal(received[0].request.url, "/artifacts/reports/demo/report.html");
  assert.match(received[0].request.headers.authorization, /^AWS4-HMAC-SHA256 /);
  assert.equal(received[0].body.toString(), "<!doctype html><title>Test</title>");
  assert.deepEqual(await verifyUrls([url]), [{ url, status: 200, contentType: "text/html; charset=utf-8" }]);
});
