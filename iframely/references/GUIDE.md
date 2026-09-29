# Integration and troubleshooting guide

This is an authored guide. Detailed behavior is defined in the adjacent official docs.

## Troubleshoot in this order

1. Capture the input URL, endpoint, non-secret parameters, HTTP status, and JSON body. Redact keys and private URLs in shared output. Compare the result with https://iframely.com/try and https://iframely.com/debug where appropriate.
2. Classify the response. The default service configuration can mute HTTP errors into HTTP 200. Read `status` and `error`; status may be a string or number. Missing `html` can be valid metadata-only data, not an outage.
3. For 403, distinguish account/key/origin/header restrictions from private or robot-blocked source pages. A public key hash is client-facing, not a substitute for origin controls. Test new restrictions with a separate key before production changes.
4. For 417, inspect `:status` and `:error`: it can mean origin connection failure, provider block, or output rejected by account preferences. Check media/card/helper settings before treating it as unsupported content.
5. For 404/410, check deletion, privacy, source access and obsolete saved data. For 415, check unsupported resources or unrendered SPA templates. For 418, avoid tight retries; the docs describe an origin timeout and a retry cooldown. Treat unexpected HTTP 5xx as a service/transport problem with bounded backoff.
6. If data succeeds but rendering fails, inspect embed HTML, browser network and console, loaded embed.js, script readiness, lifecycle calls, sanitizer changes, CSP, origin/referrer policy and mixed content.
7. Compare native publisher HTML with hosted helpers. `iframe=0` disables helpers and interactives; it can remove cards or the workaround needed for scripted embeds. Do not combine it blindly with features that require helpers.
8. Check dynamic navigation, multiple embeds, narrow layouts, lazy loading and failed-link fallback in the actual app. State API-only limitations if browser validation is unavailable.

## API and schema details

- Hosted server endpoints: `https://iframe.ly/api/oembed` and `https://iframe.ly/api/iframely`. Browser requests should use corresponding `https://iframely.net/api/…` CDN paths.
- oEmbed: `rich`, `video`, `photo`, or `link`. A `photo` uses its `url` as an image resource and need not contain `html`.
- Full Iframely: top-level `html`, `url`, optional `id`, `rel`, `meta`, `links`, and optional `options`. All metadata fields can be absent.
- Do not assume every link has `href` or generated `html`. Preserve raw types and normalize singleton/array variants at the adapter boundary when required.
- Prefer top-level recommended `html`; choosing from raw `links` requires interpreting MIME type, functional rels and media sizing.
- Use URLSearchParams to encode URLs and options exactly once. Accept HTTP(S), with product-specific allow/block policies as needed.

## Delivery choices

| Intent | Parameters and requirements |
| --- | --- |
| Framework inserts HTML | `omit_script=1`; separately load embed.js and rerun loader after insertion/readiness |
| Always use hosted helpers | `iframe=1`; consider account billing implications |
| Summary card instead of publisher media | `media=0`; cards must be enabled and a usable preview must exist |
| Lazy loading for all media | `lazy=1&iframe=1`; embed.js required |
| CSS classes | `omit_css=1`; add documented baseline CSS and retain dynamic inline sizing |
| Playback control | `playerjs=1`; inspect `rel` for capability |
| Autoplay | `autoplay=1`, optionally `mute=1`; browser policy and provider capability can prevent it |
| Native WebView | `ssl=1`; preserve resizing/messaging and use hosted helpers as needed |
| Content IDs | `id=1` when supported; case-sensitive, public identifiers tied to the account |

Cache responses for a configurable interval; the getting-started docs recommend 1–24 hours including valid errors. Retain input URL and selected options so cache refresh can reproduce the requested variant. Batch up to 100 content IDs, delimited with hyphens, through `/{IDs}.json` or `/{IDs}.oembed`; map by returned ID keys, not response order.

Provider options are dynamic and URL-specific. Generate fields from `options`, skip reserved `query`, retain selected non-default values, and request updated options after changes. Obtain final optimized HTML from an API call before publishing editor previews.

For custom CDN, forward the host identity, query parameters and feature-specific headers, honor origin caching/Vary, and source embed.js from the same configured CDN. Consent state depends on both the CDN and referring site context. Page-scoped consent requires referrer detail; do not change to `unsafe-url` without considering private URL disclosure and the user's intended scope.

For Shadow DOM, read the supported `iframely-shadow`/custom shadow selector or findIframe hook approach; document-wide selectors cannot see arbitrary shadow roots.

## Source quality and boundaries

The bundled docs include older integration samples. Correct obvious errors instead of copying them verbatim: the React sample has a non-package import path, an empty dependency list that misses URL updates, and error handling inconsistent with the documented `status`/`error` shape. Implement current project conventions, cancellation, script readiness and safe fallback behavior.

Website self-hosting instructions and the repository README contain old Node minimums. Inspect current package.json engines and dependencies when actually self-hosting. Hosted cards, GIF conversion, per-URL options, predictive sizing and other cloud features are not guaranteed by the open-source parsers.

These files are a reference snapshot, not a promise of current provider coverage, legal compliance, plan availability, or browser behavior. Refresh the relevant official page when any of those affects the work.
