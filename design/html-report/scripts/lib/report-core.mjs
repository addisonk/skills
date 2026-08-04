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

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const hasValue = (value) => value !== undefined && value !== null && value !== "";

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
  if (!/<script\s+type="application\/json"\s+id="report-data">[\s\S]*?<\/script>/i.test(html)) {
    errors.push("rendered HTML must contain embedded report-data JSON");
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
