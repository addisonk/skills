---
title: "Iframely Responsive Async iFrame Helpers"
description: "Iframely can wrap raw html embed codes into hosted iFrames for security, speed and required fallbacks"
source: https://iframely.com/docs/iframes
---

# Iframely-hosted rich media helpers

Iframely hosts iFrame containers for [rich media embeds](/docs/embeds) from publishers. iFrames are served from our or [your](/docs/cdn) CDN.

By default, we activate iFrame helpers only when required for specific rich media. Depending on your system, you may request our iFrames for all content. Or to help with specific technical requirements only. Or disable each fallback or Iframely interactive that may use an iFrame.

Hosted iFrames provide technical features and improvements. Iframely knows [rich media](/docs/embeds) from [over 1900 domains](/domains). It might be overwhelming to keep up with all the inconsistencies. Our iFrame helpers aim to resolve it for you.

All Iframely interactives require a hosted iFrame. It includes [cards](/docs/cards), [consents](/docs/consents), images, [click-to-play](/docs/click-to-play) covers, [player events](/docs/playerjs), sync and [GIFs](/docs/gifs).

> iFrames are part of APIs for billing purposes. They trigger billing hits the same way. Because of this, our default is to activate iFrame only when required.

## Technical and system consistency

Hosted iFrames add the following technical features to all providers.

- **Async load** - our iFrames do not block scripts waiting for `<body>`'s `onload` event. The iFrames load empty, fire `load` event instantly, and only after that, they start rendering their third-party content.

- **JavaScript-friendly** - embeds from some publishers cannot be added to the DOM of your page via JavaScript. For example, if they use `document.write`. We wrap those into iFrame by default to fix that.

- **Third-party scripts** - many systems set HTML via `innerHTML` (say, [React](/docs/react)). They do not execute any third-party scripts in the added HTML. We can wrap such HTML embeds into iFrame and give you a single [embed.js](/docs/embedjs) script that you need to make an exception for. Read more in [Omit scripts](/docs/omit-script) guide.

- **Minimizing layout shift** - Iframely tries to predict the height of dynamic scripted widgets, so they take the required space right away and minimize [CLS](https://web.dev/cls/). It covers Twitter, Facebook and Instagram and other HTML widgets. Our iFrames adjust the height to the exact actual value when it becomes known.

- **HTTPs** - if rich media is not SSL-friendly, we wrap it into our iFrame. If loaded over HTTP, iFrames will show third-party rich media. Over HTTPs, iFrame will fall back to a [summary card](/docs/cards). You can disable all non-SSL rich media.

- **Caching**: Iframely iFrames keep updating their URLs and rich media in the background. You do not need to re-cache embed codes on your own that often.

- **URL options** - you can give your authors our [URL options](/docs/options) for individual URLs to choose the media variant just the way they want it.

- **Web components** - while we call it "iFrames", we use Shadow DOM and imports when it's beneficial. In browsers that support it, we bulk-insert web components via a single HTTP request. You can disable this upgrade in your settings or via `&import=0` [API parameter](/docs/parameters#import=0).

- **AMP** - Iframely interactives and rich media embeds formatted for [Accelerated Mobile Pages](/docs/amp).

- **[Lazy-loading](/docs/lazy-load)** - for all iFrames or players only. For players, we show an image placeholder right. Then swap it with an actual player it finishes loading.

## How we source iFrame helpers

Iframely handles billions of frame-views via our global content-delivery network and through the [bring-your-own CDN](/docs/cdn) option.

Depending on your [plan](/pricing) and settings, the iFrame source will either include the [hashed value](/docs/allow-origins) of your API key or permanent public embed code through the [Content IDs](/docs/ids).

The iFrames with content ID will keep being available even if you decide to cancel your subscription later. Check the box in your [iFrames settings](/settings/media) page or use &id=1 API parameter to turn content IDs on.

HTML of the embed code may contain Iframely's [embed.js](/docs/embedjs) script to resolve the unknown widget height and other features. Embed.js script is available [on GitHub](https://github.com/itteco/embedjs) if you wish to self-host.

To limit the use of your iFrames to your domains only, please refer to [Allow origins](/docs/allow-origins) guide.

## How to activate iFrame helpers

You can activate hosted iFrames in your [API settings](/settings) or by sending `&iframe=1` [query-string parameter](/docs/parameters) with your API requests.

API settings let you configure the use of iFrames in a more flexible way. For example, skip certain domains or only use iFrames when a technical fix or Iframely interactive are needed.

If you'd instead not get any iFrames at all, you may use `iframe=0` with your API calls to disable any helpers.

