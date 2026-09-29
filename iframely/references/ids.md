---
title: "Iframely Content IDs for Rich Media URLs"
description: "Iframely will give you a short ID that you can use for batch cache refreshes or as permanent source for the iFrame embed"
source: https://iframely.com/docs/ids
---

# Iframely content IDs

For content management systems, Iframely can generate short identifiers (IDs) for each unique URL.
Use it to source [iFrames](/docs/iframes) in HTML embed codes, edit [URL options](/docs/options), for batch URL refreshes or to request different formats such as [AMP](/docs/amp).

Content IDs are unique within your account and are linked to your API settings. The feature is available on subscription [plans](/pricing) that support it.

Content IDs are a permanent source of Iframely iFrames in HTML codes and URL data and survive the termination: we keep maintaining the embed codes and refresh related media content even if you no longer have an active subscription with us.

Because of this commitment, URLs with associated IDs are stored permanently on Iframely network, unlike regular URLs that get cleaned up after a period of inactivity according to our privacy policy.

## How to get content IDs

There are three scopes you can request to generate content IDs for:

### iFrame settings

Configure this as default for iFrame `src`s in your [iFrames settings](/settings/media).

When Iframely needs to generate an [iFrame helper](/docs/iframes) based on publisher's data or according to your other API settings, the `html` field for such embed codes will link to permanent public short URL address:

```html
<iframe src="https://iframely.net/ABCDEFG" …></iframe>
```

By default, and on plans that don't support content IDs, our iFrame codes link to the hashed API key instead:

```html
<iframe src="https://iframely.net/api/iframe?url={URL}&key={API_KEY}" …></iframe>
```

### `id=1`

To activate IDs for all URLs, whether we wrap HTML embed code into our iFrame helper or not, make you API call with `&id=1` [query-string](/docs/parameters) parameter in [oEmbed](/docs/oembed-api) or [Iframely](/docs/iframely-api) formats. You'll get content `id` field in response JSON even when Iframely returns the native embed code from publisher without our iFrame helper.

### `id=0`

This query-string parameter overrides your [iFrames settings](/settings/media), and forces iFrame helpers, if any, to link to your hashed API key instead.

> Iframely Content IDs are case-sensitive.

## API calls with content IDs instead of URLs

When content ID is available, it will be returned as `id` field in the JSON response. You can use it for subsequent API calls to Iframely. Such API calls don't require your API key and are a good fit for public facing implementations.

### Fetch single content by ID

If you have received short `id` for your previous API call, your repeat calls may go directly to:

- [iframe.ly/{ID}.json](https://iframe.ly/qH98az.json) - for [Iframely API](/docs/iframely-api) format
- [iframe.ly/{ID}.oembed](https://iframe.ly/qH98az.oembed) - for JSON in [oEmbed](/docs/oembed-api) format

Such API calls do not require `api_key` and are publicly available (yet are still linked to your account).

You may add any [optional API parameters](/docs/parameters) to such anonymous calls. For example, quickly get an [AMP-formated](/docs/amp) iFrame with `&#38;amp=1`.

> If you fetch JSON data from users' browser, please use CDN: `iframely.net/{ID}.json` (or your own domain if you're on "bring your own CDN").

### Batch request up to 100 IDs

Instead of making a hundred API calls, we suggest you combine it into one. Simply generate an endpoint address this way: IDs delimited with `-` hyphen. For example:

- [iframe.ly/{ID1}-{ID2}-…-{IDn}.json](https://iframe.ly/qH98az-7QPpxhS.json) - for [Iframely API](/docs/iframely-api) format
- [iframe.ly/{ID1}-{ID2}-…-{IDn}.oembed](https://iframe.ly/qH98az-7QPpxhS.oembed) - for JSON in [oEmbed](/docs/oembed-api) format

Again, you can use any of the [optional API parameters](/docs/parameters).

The response will contain Iframely or oEmbed JSONs as values, with IDs as the root level keys:

```json
{
  "ID1": {
    …
  },
  "ID1": {
    …
  },
  …
  "ID-N": {
    …
  }
}
```

In other words, `body.IDn` from response of such batch calls will be the same JSON object as if you called `iframe.ly/IDn.json` or `iframe.ly/IDn.oembed` for a single ID.

> The order of IDs in response may not match the order from request. We fill the data based on latency of an individual ID.

