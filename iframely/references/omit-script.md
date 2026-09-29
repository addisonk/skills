---
title: "Omit third-party scripts from HTML embed codes of rich media"
description: "Use &omit_script=true to skip Iframely script"
source: https://iframely.com/docs/omit-script
---

# Omit scripts from HTML

Third-party rich media embed codes may include a `<script>` tag. If your system adds HTML code via `innerHTML`, script tags will be ignored per HTML5 [specification](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML) to prevent cross-site scripting attacks.

It causes issues with any rich media with an otherwise legit script as part of its HTML. It will not render correctly or not at all.

It affects providers such as [Twitter](/domains/x-formely-twitter), [Facebook](/domains/facebook), [Instagram](/domains/instagram) and [Tiktok](/domains/tiktok) in system environments such as [React](/docs/react) and [Angular](/docs/angular).

Instead, Iframely suggests our [hosted iFrames](/docs/iframes) render scripted rich media.

Iframely's [embed.js](/docs/embedjs) script still needs to be excepted, but only this single script. Add it to your page yourself. To adjust the sizes of the iFrames and to handle other events.

## Omit third-party scripts

There are two ways to use [iFrame renders](/docs/iframes) for all rich media with third-party scripts:

- Set this option in your [API settings](/settings/about).
- Include `&omit_script=1` [query-string parameter](/docs/parameters#omit_script=1) with every API call or as needed.

It will only affect third-party rich media, whose HTML code includes a `<script>` tag. You'll get Iframely `<iframe>`- based code instead.

Please load Iframely's [embed.js](/docs/embedjs) script to your page yourself as described below

> Please load Iframely's [embed.js](/docs/embedjs) script to your page yourself as described below.

## Omit Iframely embed.js script

By default, we include our [Embed.js](/docs/embedjs) as `<script>` element in the HTML code when we [host](/docs/iframes) JavaScript-based rich media and for most of the Iframely [interactives](/docs/embeds#iframely-hosted-html-helpers).

Interactive examples include [cards](/docs/cards), [MP4 players](/docs/click-to-play) and playback sync. [Lazy-loading](/docs/lazy-load) delivery also requires emebed.js.

When you request `&omit_script=1`, we do not include our script with the HTML code. However, it is still required on your page and you need to add yourself. Please see an example below.

> Multiple Iframely embed.js script tags on your page do not put a drag on user's bandwidth or your site's performance.
> Browsers will load it only once, there is no need to omit Iframely script for that single reason.

## Embed.js is required {#load-when-required}

Embed.js is still required so your page can communicate with Iframely iFrames, for example to adjust the height of rich media. You can simply load embed.js by adding it to the head of your page:

```html
<script async src="https://iframely.net/embed.js"></script>
```

Your page may or may not have our embeds on it. Here is an example code that loads embed.js only when it is required:

See the [embed.js](/docs/embedjs) document if you need events and controls that our Embed.js script provides.

> If you use a [custom CDN](/docs/cdn) option, please, source the embed.js script from your distribution.
> You may also opt to self-host embed.js script file. It is available [on GitHub](https://github.com/itteco/embedjs) and NPM.

