const DOCUMENT_TYPES = new Set(["report", "spec", "plan", "explainer", "audit", "research", "evidence"]);
const BLOCK_FIELDS = {
  prose: ["html"],
  callout: ["html"],
  quote: ["text"],
  stats: ["items"],
  table: ["columns", "rows"],
  comparison: ["items"],
  checklist: ["items"],
  timeline: ["items"],
  code: ["code"],
  diagram: ["svg"],
  verdict: ["status", "lead"],
  "flow-results": ["flows"],
  gallery: ["items"],
  recording: ["video", "label"],
  gaps: ["items"],
  sources: ["items"],
  "custom-html": ["html"],
};
const HTML_FIELDS = ["html", "svg"];
const ANCHOR = /^[a-z][a-z0-9-]*$/;

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const hasValue = (value) => value !== undefined && value !== null && value !== "";

export function parseReportSource(text, label = "report source") {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Invalid report JSON in ${label}: ${error.message}`);
  }
}

function unsafeFragmentReason(fragment) {
  const checks = [
    [/<\s*script\b/i, "script elements are not allowed"],
    [/<\s*style\b/i, "style elements are not allowed"],
    [/<\s*(?:iframe|object|embed)\b/i, "embedded documents are not allowed"],
    [/\son[a-z]+\s*=/i, "event-handler attributes are not allowed"],
    [/javascript\s*:/i, "javascript: URLs are not allowed"],
    [/<\s*link\b[^>]*rel\s*=\s*["']?stylesheet/i, "stylesheets are not allowed"],
  ];
  return checks.find(([pattern]) => pattern.test(fragment))?.[1] || null;
}

export function validateReportSource(source) {
  const errors = [];
  if (!isObject(source)) return ["source must be a JSON object"];
  if (source.version !== 1) errors.push("version must be 1");
  if (!isObject(source.document)) {
    errors.push("document must be an object");
  } else {
    for (const field of ["title", "summary", "type", "date"]) {
      if (!hasValue(source.document[field])) errors.push(`document.${field} is required`);
    }
    if (hasValue(source.document.type) && !DOCUMENT_TYPES.has(source.document.type)) {
      errors.push(`document.type must be one of: ${[...DOCUMENT_TYPES].join(", ")}`);
    }
    if (hasValue(source.document.tags) && !Array.isArray(source.document.tags)) {
      errors.push("document.tags must be an array when provided");
    }
  }
  if (!Array.isArray(source.blocks) || source.blocks.length === 0) {
    errors.push("blocks must be a non-empty array");
    return errors;
  }

  const ids = new Set();
  source.blocks.forEach((block, index) => {
    const at = `blocks[${index}]`;
    if (!isObject(block)) {
      errors.push(`${at} must be an object`);
      return;
    }
    for (const field of ["type", "id", "title"]) {
      if (!hasValue(block[field])) errors.push(`${at}.${field} is required`);
    }
    if (hasValue(block.id)) {
      if (!ANCHOR.test(block.id)) errors.push(`${at}.id must be a lowercase ASCII anchor using letters, numbers, and hyphens`);
      if (ids.has(block.id)) errors.push(`${at}.id is a duplicate block id: ${block.id}`);
      ids.add(block.id);
    }
    const required = BLOCK_FIELDS[block.type];
    if (!required) {
      if (hasValue(block.type)) errors.push(`${at}.type is unsupported: ${block.type}`);
      return;
    }
    for (const field of required) {
      if (!hasValue(block[field])) errors.push(`${at}.${field} is required for ${block.type}`);
    }
    if (block.type === "callout" && hasValue(block.tone) && !["info", "success", "warning", "error"].includes(block.tone)) {
      errors.push(`${at}.tone must be info, success, warning, or error`);
    }
    if (block.type === "verdict" && hasValue(block.status) && !["pass", "fail", "partial"].includes(block.status)) {
      errors.push(`${at}.status must be pass, fail, or partial`);
    }
    for (const field of HTML_FIELDS) {
      if (typeof block[field] === "string") {
        const reason = unsafeFragmentReason(block[field]);
        if (reason) errors.push(`${at}.${field}: ${reason}`);
      }
    }
    if (block.type === "gallery" && Array.isArray(block.items)) {
      block.items.forEach((item, itemIndex) => {
        if (!isObject(item) || !hasValue(item.image) || !hasValue(item.alt)) {
          errors.push(`${at}.items[${itemIndex}] requires image and alt`);
        }
      });
    }
    if (block.type === "sources" && Array.isArray(block.items)) {
      block.items.forEach((item, itemIndex) => {
        if (!isObject(item) || !hasValue(item.label) || !hasValue(item.url)) {
          errors.push(`${at}.items[${itemIndex}] requires label and url`);
        }
      });
    }
  });
  return errors;
}

function escapeJsonForHtml(value) {
  return JSON.stringify(value, null, 2)
    .replaceAll("&", "\\u0026")
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
}

export function renderReport(source, template) {
  const token = "__REPORT_DATA__";
  const count = template.split(token).length - 1;
  if (count !== 1) throw new Error(`Document template must contain exactly one ${token} token; found ${count}`);
  const embedded = structuredClone(source);
  delete embedded.publish;
  return template.replace(token, escapeJsonForHtml(embedded));
}

export function validateRenderedHtml(html) {
  const errors = [];
  if (!/^\s*<!doctype html>/i.test(html)) errors.push("rendered HTML must begin with <!doctype html>");
  if (html.includes("__REPORT_DATA__")) errors.push("rendered HTML contains unresolved __REPORT_DATA__ token");
  if (/<script\b[^>]*\bsrc\s*=/i.test(html)) errors.push("rendered HTML contains a remote script dependency");
  if (/<link\b[^>]*\brel\s*=\s*["']?stylesheet/i.test(html)) errors.push("rendered HTML contains a remote stylesheet dependency");
  if (/@import\s+(?:url\s*\()?\s*["']?https?:/i.test(html)) errors.push("rendered HTML contains a remote CSS import");
  if (/@font-face/i.test(html) && /https?:\/\//i.test(html)) errors.push("rendered HTML contains a remote font dependency");

  const ids = new Set();
  const duplicateIds = new Set();
  for (const match of html.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)) {
    if (ids.has(match[1])) duplicateIds.add(match[1]);
    ids.add(match[1]);
  }
  for (const id of duplicateIds) errors.push(`rendered HTML contains duplicate id: ${id}`);
  for (const match of html.matchAll(/\bhref\s*=\s*["']#([^"']+)["']/gi)) {
    if (!ids.has(match[1])) errors.push(`rendered HTML contains a broken anchor: #${match[1]}`);
  }
  return errors;
}

export const supportedBlockTypes = Object.freeze(Object.keys(BLOCK_FIELDS));
