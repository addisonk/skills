---
title: "Optional query string parameters for Iframely APIs"
description: "Configure parameters in your settings or send with every API call"
source: https://iframely.com/docs/parameters
---

# Additional API parameters

Together with your API settings, optional query-string API parameters help you fine-tune what you receive from APIs.

API parameters let you override your settings for individual URLs and API calls.

For individual URLs, Iframely also offers an [options editor](/docs/options).
It adds a variety of provider-specific `_`-prefixed parameters to fine-tune particular rich media.

## Required parameters

### `api_key`

The API key you see in your profile. If your code faces users, you may replace `api_key` with `key` parameter, which should be the MD5 hash of your actual API key.

See how to [restrict API access](/docs/allow-origins) with your `key` in that case.

### `url`

URL-encoded value of the URL. Also, make sure it's HTTP or HTTPs link (we suggest you match against `/^https?:\/\//i`).

<div id="url-encode"></div>

> Please URL-encode the URLs you send to Iframely. Seriously.

## iFrame helpers

Below parameters are meant to complement your API settings. If you are in production and want to test some features, you may activate them via these query-string parameters.
And vice versa - if you have a feature in your settings, you can disable it via query-string.

To choose between query-string and API settings, consider this. Unlike your API settings, API query-string will be included with embed codes and you won't be able to undo it without making another API request.
Settings will be applied to all Iframely [iFrames](/docs/iframes) that are already on your site.

> When we give `=1` as parameter value, `=0` is also available to undo the feature in your settings.
> You can use `true` and `false` values instead, if you like it better.

### `iframe=1`

Explicitly activates our async [iFrames](/docs/iframes).

Rich media from the publisher will be put into Iframely-hosted iFrame and include the required delivery helper.
The media inside an iFrame will be kept up-to-date in the background on our end.

### `iframe=0`

- Disables any required iFrame [display helper](/docs/iframes#technical-and-system-consistency).
- Disables any allowed Iframely interactive such as [cards](/docs/cards), [click-to-play](/docs/click-to-play) and images.
- If any, you will get rich media from the publisher as-is and handle it yourself.

> In [oEmbed API](/docs/oembed-api) format, we cannot fit any autoplaying videos.

### `id=1`

If your plan supports it and during the initial trial period, the parameter adds a [content ID](/docs/ids) to the API response.

When you need to refresh the cache, you can use those IDs to re-fetch data in batches of up to 100 URLs.

For [hosted iFrame](/docs/iframes), it will link the source to content ID rather than your API key.
iFrames with IDs will remain in service even if you decide to cancel your subscription.

### `omit_script=1`

[Rich media](/docs/embeds) embed codes may also include `<script>` tag. Your system, for example, [React](/docs/react), may nullify scripts to prevent cross-site scripting attacks. The HTML content will not properly render.

`omit_script` parameter puts all such rich media into [Iframely iFrame](/docs/iframes). This affects Twitter, Facebook, Instagram, TikToks and others.

Our [embed.js](/docs/omit-script) script is also excluded from responses. We ask you to make an exception for it and add it to your page directly.

See our complete [scripts delivery guide](/docs/omit-script).

### `import=0`

In browsers that support it, we may switch to bulk insert or rich media embeds. We use Web Components instead of iFrames to save on HTTP requests.

`import=0` disables shadow DOM and imports. Iframely will use iFrame elements only.

### `omit_css=1`

Replaces inline styles in HTML embed code with [CSS class names](/docs/omit-css).

It also lets you fine-tune embed codes via CSS. It will add `iframely-embed` class, rel classes such as `iframely-player`, and domain classes such as `iframely-youtube`.

### `align=left`

Removes default center aligning of Twitter, Facebook, Instagram and other media restricted with a max-width by publisher.

### `lazy=1`

Activates [lazy-loading](/docs/lazy-load) when Iframely returns a [hosted iFrame](/docs/iframes). For players, we put an image placeholder first. Then swap it with the video when it is loaded.

## Interactive features {#iframe=card}

### `card=1`

Puts rich media into a [media card](/docs/cards#media-cards). Works for players, images and some apps.

Use `&card=small` to force a compact card layout.

### `amp=1`, `amp=iframely`, `amp=iframe`
Formats HTML code output for Accelerated Mobile Pages framework. See [our AMP guide](/docs/amp).

### `playerjs=1`

Activates [Player.js](/docs/playerjs) events to control playback where possible. Requires and is delivered via [hosted iFrame](/docs/iframes).

### `click_to_play=1`

Activates [click-to-play](/docs/click-to-play) mode for players. The player will be loaded only when requested by user.

### `consent=1`
Puts rich media into a [hosted iFrame](/docs/iframes) and activates [consents](/docs/consents) before your user is exposed to third-party rich media. Though not required for [GDPR](/gdpr), can be used for its own privacy value.

### `theme=dark`, `theme=light`, `theme=auto`
Overrides your default [theme settings](/docs/cards#themes) for cards, [consents](/docs/consents) and select rich media publishers that support themes (say, Twitter).

In "auto" mode, Iframely will match the user's operating system preferences. Cards will work out of the box.

Our auto-toggle for third-party providers uses `Sec-CH-Prefers-Color-Scheme` client hint header. It will require [additional configuration](https://web.dev/migrate-to-ua-ch/#strategy:-delegating-hints-to-iframes) of your (parent) page and [your CDN](/docs/cdn#for-any-cdn-provider):

> For `theme=auto` to work, your parent page needs to request client-hints from user's browser by setting this HTTP header: `Accept-CH: Sec-CH-Prefers-Color-Scheme`. Iframely will handle the rest.

## Content filters

### `language`

`Accept-Language`. For all publishers, it makes Iframely parsers fetch HTTP resources with that locale as the top choice via `accept-language` header (default is `en,*`). Many sites render different meta depending on language locale.

For some supporting rich media publishers, it also sets interface language.

The parameter value is an [ISO 639-1](http://www.loc.gov/standards/iso639-2/php/code_list.php) fully specified locale of two-letter language and region codes.
For example, `fr-CA` or `fr-FR` are both valid values. For some languages, Iframely might accept just the two-letter language code and add the default region code automatically.

We recommend testing your locale choice with Twitter, Facebook, YouTube and TED before pushing it live.
Instagram should also use either that language or the one from the user's browser.

### `ssl=1`

Returns only rich media that works under HTTPs with no active SSL mixed-content warnings.

### `media=1`

"Prefer media-only". For some publishers, Iframely knows status-like `app` rich media AND simple media, such as photos or video.
This option will make Iframely return the most straightforward media in the `html` field instead.

### `media=0`

Disables any rich media from a publisher and forces URL to try and resolve into a [summary card](/docs/cards) instead.

### `autoplay=1`

Activates [autoplay](/docs/autoplay) for players when possible. Check for `autoplay` in main `rel` to confirm. Add `&mute=1` to mute the playback.

## Code helpers

### `maxwidth`

Integer value, in pixels and without a unit of measure, for example `=800`. This is how it applies:

- When third-party rich media is a responsive iFrame-based (for example a YouTube player), requesting a `maxwidth` parameter will make Iframely to echo it as `width` attribute of the resulting iFrame. The `height` attribute of the iFrame include the properly calculated height according to the requested width.

> This is just a code helper for environemnts that restrict iFrames to having `width` and `height` parameters. The `maxwidth` does not affect the size of the iFrame in HTML. iFrame will still resize to 100% of the available width. If need be, we ask you to restrict the width the container on your side or use [&omit-css=1](#omit_css=1) instead.

- When third-party rich media is a responsive iFrame-based, `maxwidth` parameter will also make Iframely add `width` and `height` properties to our response in [oEmbed API](/docs/oembed-api) format. Use this if you need to migrate your legacy oEmbed integration that relies on width and height.

- `maxwidth` will also filter out a tiny number of third-party media that only supports a fixed size that is bigger than requested.

- `maxwidth` does not affect Iframely [cards](/docs/cards) and rich media that is not iFrame based, such as script-based Twitter, Facebook, Instagram, TikTok and others.

### `maxheight`

- Integer value, in pixels and without a unit of measure, for example `=600`.
- Or a percent of viewport height, as in `=100vh`.

Parameter applies in the following cases:

- For responsive apps, players and images with fixed aspect ratio. Iframely takes your `maxheight` and media's aspect ratio and calculates the max width that would match your `maxheight`. It is set as `max-width` inline style of HTML output so that responsive media isn't taller than the requested `maxheight`.

- In Iframely iFrame, for HTML-based embeds like Twitter, Facebook, Instagram, Gists whose dynamic height becomes known only after rendering. The `maxheight=` parameter in pixels is respected, and such widget won't exceed the requested size. Instead, if rich media becomes taller than the max-height, Iframely iFrame starts showing an internal scrollbar.

> `maxheight` is ignored in all other cases.

### `origin`

It is an optional text value tag that will help you later verify your API traffic. The default value is the one you give for your [API keys](/settings/keys).

You may override origin to indicate your end-customer or other functional categories. That way, you may request us to delete all links with origin from your account. It addresses the "right to be forgotten" of the EU GDPR act.

### `callback`

Name of a JavaScript function, if you need the response as JSONP.

### `format=xml`

For oEmbed API only, if you'd like to get your response as XML.

### `title=1`

Adds title attribute to all iFrames in the embed codes (hosted or native). Use this if you need to meet Level AA of Web Content Accessibility Guidelines (WCAG) 2.1.

For `a`-based hosted code, it adds page title as the text in `<a>…</a>` tag. Use this if your CMS sanitizes links with no content or if you have SEO concerns.

This title also makes the links that are no longer available at the origin (e.g. 404) to keep falling back to a regular HTML link (otherwise, Iframely removes such N/A widgets by default).

## For individual embeds publishers

Many rich media publishers provide various embedding options.

By default, Iframely provides rich media that we believe fit the most common use cases. But you, of course, might want it differently.

Most frequently requested adjustments are available for self-service in your [settings](/providers).
For other cases, our team can configure the exact embeds you like for your favourite publishers. [Ask away](mailto:support@iframely.com).

## For individual URLs

### `_ … =`
Per-use customization is available for CMS and text editors.

In addition to your default account's settings, API parameters and custom providers configuration, your users may choose a variant for an individual rich media in a specific post.

Our [per-URL options](/docs/options) editor will suggest additional query-string parameters for each URL and rich media publisher, starting with underscore `_` prefix.

You give these options to your editors to choose from, then repeat requests to Iframely APIs with the chosen query-string for a specific rich media variant.

