---
title: "Iframely API - META Semantics"
description: "Iframely gives you rich semantics meta that you can easily and reliable plug into your header-menu"
source: https://iframely.com/docs/meta
---

# Iframely API: Meta

Most web pages have organic `<meta>` data published using different semantics standards and optimized for other platforms. For example, oEmbed, Open Graph, Twitter Cards, core HTML meta for Google, Dublin Core, Parsely, Sailthru, etc.

Iframely merges various semantics into a simple one-level object with consistent properties. Any property may be absent, and event all of them together.

## Example of `meta`

```json
"meta": {
  "title": "Input/Output",
  "description": "A new short from Terri Timely and Park Pictures",
  "author_url": "https://vimeo.com/user1946955",
  "author": "Terri Timely",
  "site": "Vimeo",
  "canonical": "https://vimeo.com/141567420",
  "duration": 249,
  "date": "2015-10-06",
  "medium": "video"
}
```

Iframely API returns `meta` object that may contain the following fields at the moment.

## General meta

- `title`
- `description`
- `date` - the publication date
- `canonical` - canonical URL of the resource
- `shortlink` - URL shortened through publisher
- `category`
- `keywords`

## Medium

- `medium` - rich media embed type

If you need a simple category for media type, and our primary `rel` array isn't simple enough, you can use this `medium` field. It's analog of the `type` field in [oEmbed](/docs/oembed-api).

The inconclusive list of possible values is this: `"video"`, `"audio"`, `"playlist"`, `"slideshow"`, `"gifv"`, `"3d"`, `"image"`, `"file"`, `"article"`, `"reader"`,`"event"`, `"product"`, `"survey"`, `"form"`, `"link"`.

`"Article"` is for web pages that identify as such. `"Link"` is for links that do not fall into any other category and that webmasters optimized for social-sharing. The other general links will have no `medium` field at all.

We may add other values if new use cases arise.

## Attribution

- `author`
- `author_url`
- `copyright`
- `license`
- `license_url`
- `site`

## Stats

- `views` - number of views on the original host, e.g. YouTube
- `likes`
- `comments`
- `duration` (in seconds, duration of video or audio content)

## Geo data

Following Open Graph spec:

- `country-name`
- `postal-code`
- `street-address`
- `region`
- `locality`
- `latitude`
- `longitude`

## Product info

Following Pinterest spec:

- `price`
- `currency_code`
- `brand`
- `product_id`
- `availability`
- `quantity`

