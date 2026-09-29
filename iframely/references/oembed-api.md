---
title: "oEmbed API - Responsive Embeds"
description: "oEmbed API for Responsive Web Embeds. Open-Source or hosted"
source: https://iframely.com/docs/oembed-api
---

# oEmbed API endpoint

One of the (only) two Iframely endpoints follows the [oEmbed](http://oembed.com) protocol:

- You make an HTTP GET request with your link as the `&url=` query-string parameter.
- If any, HTML embed code is in the `html` field of JSON response.

The `html` and rich media content depend on your [API settings](/settings) and optional [request parameters](/docs/parameters).

If we cannot find third-party rich media for your URL, we will prepare a [summary card](/docs/cards). We deliver it via a [hosted iFrame](/docs/iframes).
You may request to get an iFrame every time if you need any other technical improvements or Iframely interactives it brings.

## API request

- `url` and `api_key` parameters are required.
- `url` needs to be URL-encoded.
- For additional security, you may substitute `api_key` with the `key` parameter. It should be the md5 hash value of your actual API key (see [Allow origins](/docs/allow-origins) guide).
- There are also other optional [query-string parameters](/docs/parameters) available.

> If you make API calls for each user via client-side JavaScript, use our CDN at `iframely.net/api/oembed/…`.

If you use [Content IDs](/docs/ids), you can repeat the API call at `iframe.ly/{ID}.oembed`.
You can even fetch data in batches of up to 100 content IDs, separated by `-` hyphen.

## API Response

Iframely responds with a JSON that has a top-level `html` field for embed code and other oEmbed-specific data.

[Here’s an example response for Vimeo](https://iframe.ly/api/oembed?url=https://iframe.ly/qH98az):

```json
{
	"url": "https://vimeo.com/141567420",
	"type": "video",
	"version": "1.0",
	"title": "Input/Output",
	"description": "A new short from Terri Timely and Park Pictures",
	"author": "Terri Timely",
	"author_url": "https://vimeo.com/user1946955",
	"provider_name": "Vimeo",
	"thumbnail_url": "https://i.vimeocdn.com/…5aebf015a6472-d_295x166",
	"thumbnail_width": 295,
	"thumbnail_height": 166,
	"html": "<div style=\"left: 0px; width: 100%; height: 0px; position: relative; padding-bottom: 56.25%;\"><iframe src=\"https://player.vimeo.com/video/141567420\" style=\"top: 0px; left: 0px; width: 100%; height: 100%; position: absolute;\"></iframe></div>"
}
```

Iframely supports `photo`, `video` and `rich` types as oEmbed output.

For valid links, oEmbed API returns `link` type object and URL data when Iframely doesn't have any embed code for your URL. You can also get an [error code](/docs/result-codes) if URL fails.

> Beware: `photo` type in oEmbed spec provides `url` as a hotlink to the image, no `html`.

On plans that support it, Iframely also returns `options` object. Use it to pass [URL embed options ](/docs/options) to your authors.

