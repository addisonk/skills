---
title: "Iframely API for Responsive Web Embeds"
description: "Mighty API for Responsive Web Embeds. Based on oEmbed, Open Graph, Twitter Cards"
source: https://iframely.com/docs/iframely-api
---

# Iframely API endpoint

Iframely-formatted endpoint provides complete JSON data Iframely could fetch about your URL.

The basic flow is the same as with [oEmbed API](/docs/oembed-api):

- You make an HTTP GET request with your link as the `&url=` query-string parameter.
- If any, HTML embed code is in the `html` field of JSON response.

The `html` and rich media content depend on your [API settings](/settings) and optional [request parameters](/docs/parameters).

If we cannot find third-party rich media for your URL, we will prepare a [summary card](/docs/cards). We deliver it via a [hosted iFrame](/docs/iframes).
You may request to get an iFrame every time if you need any other technical improvements or Iframely interactives it brings.

In addition to the main `html` field, Iframely data will also give you URL's unified semantics and attribution as `meta` data and all available publisher's media variants as `links`.

Together, `links` and `meta` sections mimic the `<head>` of a requested web page, similar to Iframely [embeds discovery](/docs/publish).

## API request

- `url` and `api_key` parameters are required.
- `url` needs to be URL-encoded.
- For additional security, you may substitute `api_key` with the `key` parameter. It should be the md5 hash value of your actual API key (see [Allow origins](/docs/allow-origins) guide).
- There are also other optional [query-string parameters](/docs/parameters) available.

> If you make API calls for each user via client-side JavaScript, use our CDN at `iframely.net/api/iframely/…`.

If you use [Content IDs](/docs/ids), you can repeat the API call at `iframe.ly/{ID}.json`.
You can even fetch data in batches of up to 100 content IDs, separated by `-` hyphen.

## API response

Iframely responds with a JSON that has a top-level `html` field with our recommendation as embed code. Plus all other information we have found about your URL.

[Here’s an example response for Vimeo](https://iframe.ly/api/iframely?url=https://iframe.ly/qH98az):

```json
{
  "id": "qH98az",

  // URL Content ID (if available) plus canonical URL
  "url": "https://vimeo.com/141567420",

  // Rel use cases and html code for primary variant of embed
  // Check for `autoplay` if you requested it
  "rel": ["player", "ssl"],

  // That's the embed code we recommend
  "html": "<div …>…</div>",

  // Meta object with attribution & semantics
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
  },

  // Plus list of all media that we have for this URL
  // Embed src links with functional rels, for example:
  "links": {

    // List of player embed widgets
    "player": [{

      // SRC of embed
      "href": "https://player.vimeo.com/video/141567420",

      // Functional and technical use cases
      "rel": ["player", "ssl", "html5"],

      // Link's MIME type, says "embed as iFrame"
      "type": "text/html",

      // Media query, e.g. aspects
      "media": {
        "aspect-ratio": 1.777778
      },

      // Plus generated HTML code for simplicity of use
      "html": "<div … ></div>"
    }, {
      …
      // Might have multiple variations of the same player.
      // Say, one that 'autoplay's, one as MP4 video, one as https.
    }],
    "thumbnail": [{
      "media": {
        // Exact sizes here
        "height": 360,
        "width": 640
      },

      // We repeat the same rel for consistency
      "rel": ["thumbnail"],
      "type": "image",

      // "Use href as src of an image"
      "href": "http://cdn1.aka … med_1381670134_00040.jpg"
    }, {
      …
    }],

    // Also possible: header-menu, image (as rel), reader, survey, file, logo, icon

    "icon": [{
      …
    }]
  }}
```

- `rel` is the primary information about the use case of the embeds. Primary rels are `player`, `thumbnail`, `app`, `image`, `reader`, `survey`, `summary`, `icon` and `logo`.

- `meta` will contain the list of semantic attributes we could get and unify to the standard naming.

> Array values with only one element will go as a single object (i.e. no `[]`).

On plans that support it, Iframely also returns an `options` object. Use it for [URL Options](/docs/options) editor.

