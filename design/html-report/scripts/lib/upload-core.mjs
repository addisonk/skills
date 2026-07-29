import { createHash, createHmac } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { basename, dirname, extname, resolve } from "node:path";
import http from "node:http";
import https from "node:https";

import { parseReportSource, renderReport, validateRenderedHtml, validateReportSource } from "./report-core.mjs";

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
  ".txt": "text/plain; charset=utf-8",
  ".log": "text/plain; charset=utf-8",
};

export function contentTypeFor(file) {
  return CONTENT_TYPES[extname(file).toLowerCase()] || "application/octet-stream";
}

function required(value, message) {
  if (!value) throw new Error(message);
  return value;
}

export function resolveUploadConfig(publish = {}, env = process.env) {
  const endpoint = required(publish.endpoint || env.R2_ENDPOINT, "R2_ENDPOINT or publish.endpoint is required");
  const bucket = required(publish.bucket || env.R2_BUCKET, "R2_BUCKET or publish.bucket is required");
  const publicBase = required(publish.publicBase || env.R2_PUBLIC_URL, "R2_PUBLIC_URL or publish.publicBase is required");
  const accessKeyId = required(env.R2_ACCESS_KEY_ID, "R2_ACCESS_KEY_ID is required");
  const secretAccessKey = required(env.R2_SECRET_ACCESS_KEY, "R2_SECRET_ACCESS_KEY is required");
  return {
    endpoint: endpoint.replace(/\/$/, ""),
    bucket,
    publicBase: publicBase.replace(/\/$/, ""),
    region: publish.region || env.R2_REGION || "auto",
    keyPrefix: String(publish.keyPrefix ?? "reports").replace(/^\/+|\/+$/g, ""),
    accessKeyId,
    secretAccessKey,
  };
}

const encode = (value) => encodeURIComponent(value).replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
const encodePath = (value) => value.split("/").map(encode).join("/");
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const hmac = (key, value) => createHmac("sha256", key).update(value).digest();

function requestClient(url) {
  return url.protocol === "http:" ? http : https;
}

export async function uploadFile(file, objectKey, config) {
  const body = await readFile(file);
  const key = objectKey.replace(/^\/+/, "");
  const endpoint = new URL(config.endpoint);
  const canonicalUri = `/${encodePath(config.bucket)}/${encodePath(key)}`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = sha256(body);
  const contentType = contentTypeFor(file);
  const canonicalHeaders = [
    `content-type:${contentType}`,
    `host:${endpoint.host}`,
    `x-amz-content-sha256:${payloadHash}`,
    `x-amz-date:${amzDate}`,
    "",
  ].join("\n");
  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = ["PUT", canonicalUri, "", canonicalHeaders, signedHeaders, payloadHash].join("\n");
  const scope = `${dateStamp}/${config.region}/s3/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, sha256(canonicalRequest)].join("\n");
  const dateKey = hmac(`AWS4${config.secretAccessKey}`, dateStamp);
  const regionKey = hmac(dateKey, config.region);
  const serviceKey = hmac(regionKey, "s3");
  const signingKey = hmac(serviceKey, "aws4_request");
  const signature = createHmac("sha256", signingKey).update(stringToSign).digest("hex");
  const authorization = `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  const requestUrl = new URL(`${endpoint.origin}${endpoint.pathname.replace(/\/$/, "")}${canonicalUri}`);

  const response = await new Promise((resolveRequest) => {
    const request = requestClient(requestUrl).request(requestUrl, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
        "Content-Length": body.length,
        Host: endpoint.host,
        "X-Amz-Date": amzDate,
        "X-Amz-Content-Sha256": payloadHash,
        Authorization: authorization,
      },
    }, (result) => {
      const chunks = [];
      result.on("data", (chunk) => chunks.push(chunk));
      result.on("end", () => resolveRequest({ status: result.statusCode || 0, body: Buffer.concat(chunks).toString() }));
    });
    request.on("error", (error) => resolveRequest({ status: 0, body: error.message }));
    request.end(body);
  });

  if (![200, 201, 204].includes(response.status)) {
    throw new Error(`Upload failed (${response.status}) for ${file} -> ${config.bucket}/${key}\n${response.body.slice(0, 600)}`);
  }
  return `${config.publicBase}/${key}`;
}

export async function verifyUrls(urls) {
  const results = [];
  for (const value of urls) {
    const url = new URL(value);
    const result = await new Promise((resolveRequest) => {
      const request = requestClient(url).get(url, (response) => {
        response.resume();
        resolveRequest({
          url: value,
          status: response.statusCode || 0,
          contentType: response.headers["content-type"] || "-",
        });
      });
      request.on("error", () => resolveRequest({ url: value, status: 0, contentType: "-" }));
    });
    results.push(result);
  }
  const failures = results.filter(({ status }) => status !== 200);
  if (failures.length) throw new Error(`Published URL verification failed:\n${failures.map(({ status, url }) => `${status} ${url}`).join("\n")}`);
  return results;
}

function isLocalMedia(value) {
  return typeof value === "string" && value !== "" && !/^(?:[a-z]+:|\/\/|#|\/)/i.test(value);
}

export function collectLocalMedia(source) {
  const media = [];
  const seen = new Set();
  const visit = (value, key = "") => {
    if (Array.isArray(value)) return value.forEach((item) => visit(item, key));
    if (!value || typeof value !== "object") return;
    for (const [childKey, childValue] of Object.entries(value)) {
      if (["image", "video", "poster"].includes(childKey) && isLocalMedia(childValue)) {
        if (!seen.has(childValue)) { seen.add(childValue); media.push(childValue); }
      } else visit(childValue, childKey);
    }
  };
  visit(source);
  return media;
}

export function rewriteLocalMedia(source, replacements) {
  const clone = structuredClone(source);
  const visit = (value) => {
    if (Array.isArray(value)) return value.forEach(visit);
    if (!value || typeof value !== "object") return;
    for (const [key, childValue] of Object.entries(value)) {
      if (["image", "video", "poster"].includes(key) && replacements.has(childValue)) value[key] = replacements.get(childValue);
      else visit(childValue);
    }
  };
  visit(clone);
  return clone;
}

function slugify(value) {
  const slug = String(value).toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (!slug) throw new Error("Report key must contain at least one letter or number");
  return slug;
}

export async function publishReport({
  sourcePath,
  outputPath,
  templatePath,
  key,
  env = process.env,
  upload,
  verify = verifyUrls,
}) {
  const [sourceText, template] = await Promise.all([readFile(sourcePath, "utf8"), readFile(templatePath, "utf8")]);
  const source = parseReportSource(sourceText, sourcePath);
  const sourceErrors = validateReportSource(source);
  if (sourceErrors.length) throw new Error(sourceErrors.join("\n"));

  const config = upload ? null : resolveUploadConfig(source.publish || {}, env);
  const uploader = upload || ((file, objectKey) => uploadFile(file, objectKey, config));
  const prefix = (config?.keyPrefix ?? source.publish?.keyPrefix ?? "reports").replace(/^\/+|\/+$/g, "");
  const reportKey = slugify(key || source.document.title);
  const root = [prefix, reportKey].filter(Boolean).join("/");
  const sourceDir = dirname(resolve(sourcePath));
  const replacements = new Map();
  const uploadedUrls = [];

  for (const media of collectLocalMedia(source)) {
    const localPath = resolve(sourceDir, media);
    const objectKey = `${root}/assets/${basename(media)}`;
    const publicUrl = await uploader(localPath, objectKey, config);
    replacements.set(media, publicUrl);
    uploadedUrls.push(publicUrl);
  }

  const publishedSource = rewriteLocalMedia(source, replacements);
  delete publishedSource.publish;
  const html = renderReport(publishedSource, template);
  const htmlErrors = validateRenderedHtml(html);
  if (htmlErrors.length) throw new Error(htmlErrors.join("\n"));
  await writeFile(outputPath, html);
  const htmlKey = `${root}/${basename(outputPath)}`;
  const reportUrl = await uploader(outputPath, htmlKey, config);
  uploadedUrls.push(reportUrl);
  const verification = await verify(uploadedUrls);
  return { reportUrl, uploadedUrls, verification, outputPath };
}
