const BLOCK_FIELDS = {
  properties: ["items"],
  context: [],
  verdict: ["items"],
  metrics: ["items"],
  charts: ["items"],
  "flow-results": ["flows"],
  assertions: ["items"],
  collapsible: ["items"],
  "nested-accordions": ["items"],
  flowchart: ["steps"],
  userflows: ["steps"],
  "before-after": ["pairs"],
  recording: ["video"],
  specs: [],
  ledger: ["groups"],
  "unit-tests": ["checks"],
  playwright: ["results"],
  maestro: ["artifacts"],
  backend: ["checks"],
  gaps: ["items"],
};

const CONTENT_FIT_BLOCKS = new Set(["verdict", "metrics", "charts"]);
const CONTENT_ITEM_FIELDS = Object.freeze({
  verdict: new Set(["title", "desc"]),
  metrics: new Set(["value", "label", "note", "ok"]),
  charts: new Set(["kind", "title", "data"]),
});
const CONTENT_DENSITIES = Object.freeze({
  glanceable: { rank: 1, maxColumns: 3 },
  comparative: { rank: 2, maxColumns: 2 },
  explanatory: { rank: 3, maxColumns: 1 },
});
const IDENTITY_FIELDS = new Set(["title", "label", "value", "status", "ok", "kind", "color"]);

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const hasValue = (value) => value !== undefined && value !== null && value !== "";

function flattenText(value) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(flattenText).join(" ");
  if (isObject(value)) return Object.values(value).map(flattenText).join(" ");
  return value == null ? "" : String(value);
}

function structuredLayerCount(value) {
  if (Array.isArray(value) || isObject(value)) return 1;
  if (typeof value !== "string") return 0;
  return [...value.matchAll(/<(?:p|ul|ol|table|figure|details|pre|blockquote|svg|canvas|video|img)\b/gi)].length;
}

function payloadRank(item, blockType) {
  const baseline = blockType === "charts" ? 2 : 1;
  if (typeof item === "string") {
    const words = item.trim().split(/\s+/).filter(Boolean).length;
    const sentences = (item.match(/[.!?](?:\s|$)/g) || []).length;
    return Math.max(baseline, words > 90 ? 3 : words > 40 || sentences > 2 ? 2 : 1);
  }
  if (!isObject(item)) return baseline;

  const layers = Object.entries(item).filter(([key, value]) =>
    !key.startsWith("_") && !IDENTITY_FIELDS.has(key) && hasValue(value)
  );
  const text = layers.map(([, value]) => flattenText(value)).join(" ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const sentences = (text.match(/[.!?](?:\s|$)/g) || []).length;
  const structuredLayers = layers.reduce((count, [, value]) => count + structuredLayerCount(value), 0);

  let rank = Math.max(baseline, layers.length >= 3 ? 3 : layers.length >= 2 ? 2 : 1);
  if (structuredLayers > 0 || words > 40 || sentences > 2) rank = Math.max(rank, 2);
  if (structuredLayers > 1 || words > 90) rank = 3;
  return rank;
}

function inferredDensity(block) {
  const rank = Math.max(1, ...(block.items || []).map(item => payloadRank(item, block.type)));
  return Object.entries(CONTENT_DENSITIES).find(([, rule]) => rule.rank === rank)?.[0] || "explanatory";
}

export function parseReportSource(text, label = "report source") {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Invalid report JSON in ${label}: ${error.message}`);
  }
}

export function validateReportSource(source) {
  const errors = [];
  if (!isObject(source)) return ["source must be a JSON object"];

  if (!isObject(source.report)) {
    errors.push("report must be an object");
  } else {
    if (!hasValue(source.report.title)) errors.push("report.title is required");
    if (!hasValue(source.report.verdict)) errors.push("report.verdict is required");
    if (hasValue(source.report.verdict) && !["pass", "fail", "partial"].includes(source.report.verdict)) {
      errors.push("report.verdict must be pass, fail, or partial");
    }
    if (hasValue(source.report.pills) && !Array.isArray(source.report.pills)) errors.push("report.pills must be an array when provided");
    if (hasValue(source.report.footer) && !Array.isArray(source.report.footer)) errors.push("report.footer must be an array when provided");
  }

  if (!Array.isArray(source.blocks) || source.blocks.length === 0) {
    errors.push("blocks must be a non-empty array");
    return errors;
  }

  source.blocks.forEach((block, index) => {
    const at = `blocks[${index}]`;
    if (!isObject(block)) {
      errors.push(`${at} must be an object`);
      return;
    }
    if (!hasValue(block.type)) {
      errors.push(`${at}.type is required`);
      return;
    }
    const required = BLOCK_FIELDS[block.type];
    if (!required) {
      errors.push(`${at}.type is unsupported: ${block.type}`);
      return;
    }
    for (const field of required) {
      if (!hasValue(block[field])) errors.push(`${at}.${field} is required for ${block.type}`);
    }
    if (block.type === "context" && !hasValue(block.items) && !hasValue(block.body)) {
      errors.push(`${at} requires items or body`);
    }
    if (block.type === "specs" && !hasValue(block.groups) && !hasValue(block.rows)) {
      errors.push(`${at} requires groups or rows`);
    }
    if (block.type === "nested-accordions") {
      if (!Array.isArray(block.items) || block.items.length === 0) {
        errors.push(`${at}.items must be a non-empty array for nested-accordions`);
      } else {
        block.items.forEach((parent, parentIndex) => {
          const parentAt = `${at}.items[${parentIndex}]`;
          if (!isObject(parent)) {
            errors.push(`${parentAt} must be an object`);
            return;
          }
          if (!hasValue(parent.title)) errors.push(`${parentAt}.title is required`);
          if (!Array.isArray(parent.items) || parent.items.length === 0) {
            errors.push(`${parentAt}.items must be a non-empty array`);
            return;
          }
          parent.items.forEach((child, childIndex) => {
            const childAt = `${parentAt}.items[${childIndex}]`;
            if (!isObject(child)) {
              errors.push(`${childAt} must be an object`);
              return;
            }
            if (!hasValue(child.title)) errors.push(`${childAt}.title is required`);
            if (!hasValue(child.body)) errors.push(`${childAt}.body is required`);
          });
        });
      }
    }
    if (CONTENT_FIT_BLOCKS.has(block.type)) {
      if (Array.isArray(block.items)) {
        block.items.forEach((item, itemIndex) => {
          const itemAt = `${at}.items[${itemIndex}]`;
          if (typeof item === "string" && block.type !== "verdict") {
            errors.push(`${itemAt} must be an object for ${block.type}`);
          } else if (typeof item !== "string" && !isObject(item)) {
            errors.push(`${itemAt} must be ${block.type === "verdict" ? "a string or object" : "an object"}`);
          } else if (isObject(item)) {
            for (const field of Object.keys(item)) {
              if (!field.startsWith("_") && !CONTENT_ITEM_FIELDS[block.type].has(field)) {
                errors.push(`${itemAt}.${field} is unsupported for ${block.type}; move supporting layers to a fitting block`);
              }
            }
          }
        });
      }
      if (!hasValue(block.density)) {
        errors.push(`${at}.density is required for ${block.type}`);
      } else if (!CONTENT_DENSITIES[block.density]) {
        errors.push(`${at}.density must be glanceable, comparative, or explanatory`);
      } else {
        const inferred = inferredDensity(block);
        if (CONTENT_DENSITIES[block.density].rank < CONTENT_DENSITIES[inferred].rank) {
          errors.push(`${at}.density is ${block.density}, but its payload requires at least ${inferred}`);
        }
        if (hasValue(block.columns)) {
          if (!Number.isInteger(block.columns) || block.columns < 1 || block.columns > 3) {
            errors.push(`${at}.columns must be an integer from 1 to 3`);
          } else if (block.columns > CONTENT_DENSITIES[block.density].maxColumns) {
            errors.push(`${at}.columns cannot exceed ${CONTENT_DENSITIES[block.density].maxColumns} for ${block.density} content`);
          }
        }
      }
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
  const pattern = /(<script\s+type="application\/json"\s+id="report-data">)[\s\S]*?(<\/script>)/i;
  const matches = template.match(pattern);
  if (!matches) throw new Error('Report template must contain <script type="application/json" id="report-data">');
  const embedded = structuredClone(source);
  delete embedded.publish;
  return template.replace(pattern, `$1\n${escapeJsonForHtml(embedded)}\n$2`);
}

export function validateRenderedHtml(html) {
  const errors = [];
  if (!/^\s*<!doctype html>/i.test(html)) errors.push("rendered HTML must begin with <!doctype html>");
  const embeddedMatch = html.match(/<script\s+type="application\/json"\s+id="report-data">([\s\S]*?)<\/script>/i);
  if (!embeddedMatch) {
    errors.push("rendered HTML must contain embedded report-data JSON");
  } else {
    try {
      const source = parseReportSource(embeddedMatch[1], "embedded report-data");
      errors.push(...validateReportSource(source).map(error => `embedded report-data: ${error}`));
    } catch (error) {
      errors.push(error.message);
    }
  }
  if (/<script\b[^>]*\bsrc\s*=/i.test(html)) errors.push("rendered HTML contains a remote script dependency");

  const ids = new Set();
  const duplicateIds = new Set();
  for (const match of html.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)) {
    if (ids.has(match[1])) duplicateIds.add(match[1]);
    ids.add(match[1]);
  }
  for (const id of duplicateIds) errors.push(`rendered HTML contains duplicate id: ${id}`);
  return errors;
}

export const supportedBlockTypes = Object.freeze(Object.keys(BLOCK_FIELDS));
