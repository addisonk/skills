---
title: "Get started with Iframely API"
description: "Iframely gives you responsive embeds via oEmbed, Twitter Cards and Open Graph parsers"
source: https://iframely.com/docs
---

# Let's connect

If you know where you are heading to, use links to the left. Otherwise, read on.<br>
This introduction gives the same links in proper context.

## Basic flow

Iframely takes your URL as an input, fetches its semantics from the origin server and tries to return rich media embed codes and other URL data.
If successful, you'll get `html` as embed code that follows your [API settings](/settings) and optional query-string [parameters](/docs/parameters).
If the request fails, you'll get an [error code](/docs/result-codes) and a message.

## API endpoint

Iframely API follows JSON format. There are (just) two API endpoints available: one follows [oEmbed spec](/docs/oembed-api), another provides detailed [Iframely data](/docs/iframely-api).
Think of it as the `&lt;head&gt;` of the origin URL with `&lt;meta&gt;` and media `&lt;link&gt;`s.

oEmbed is excellent for simple embedding. Iframely data brings more [URL meta](/docs/meta) and details about rich media [types & feature flags](docs/links).

[Embed.js](/docs/embedjs) lets you use Iframely without API calls.

## What URLs to send

[We suggest](/docs/providers) you send everything you have. Iframely knows rich media from over 1900 domains but recognizes thousands more.
We offer that you control what you get by allowing [rich media types](/docs/embeds).

## What to expect as output

[Rich media](/docs/embeds) from third-party publishers comes in a variety of types. Many rich media embeds can be used as-is.
Some may require an Iframely-hosted [iFrame helper](/docs/iframes) to display correctly.
For example, [React](/docs/react) does not add third-party scripts, and you will need to [omit scripts](/docs/omit-script).

[Hosted iFrames](/docs/iframes) deliver Iframely interactives such as [summary cards](/docs/cards), [click-to-play](/docs/click-to-play) and [player events](/docs/playerjs).

## Customize & fine-tune

You can control every aspect of Iframely via your [settings](/settings), API [query-string parameters](/docs/parameters) and WYSIWYG editors.
Initially, your account is configured for the most common use cases.

You can give your authors our [URL options](/docs/options) for individual URLs to choose the media variant just the way they want it.

## Deliver the content

You should cache API responses, including error codes, on your end and refresh your local data periodically.
We recommend cache time-to-live of 1 to 24 hours.

You can have longer TTLs if you use [hosted iFrames](/docs/iframes) because Iframely will keep updating its rich media for you in the background.
You may deliver iFrames via [your own CDN](/docs/cdn).

For CMS use, we recommend our [content IDs](/docs/ids) so that you can refresh Iframely data in batches of up to 100 URLs in your articles.
Otherwise, we recommend that you [manage your origins](/docs/allow-origins).

## Available integrations & guides

Some Iframely integrations are available.
[WordPress](/wordpress) plugin, [Meteor](https://github.com/itteco/meteor-oembed/) package,
[Medium](/docs/medium)-like text editor add-on, [CKEditor](/docs/ckeditor) supports Iframely,
[NodeBB](https://github.com/nodebb/nodebb-plugin-iframely) forums, to mention a few.
There are also integration guides for [React](/docs/react), [Angular](/docs/angular) and [AMP](/docs/amp).

If you use of Iframely with Web Components, please read about required [Shadow DOM](/docs/shadow-dom) tweaks.

## Become a publisher

Learn about [our robot](/docs/about) and how to recognize and allow it on your network.
[Publish your rich media](/docs/publish) for Iframely.
If you already provide embed codes for your users, [submit your site](/qa/request) as a provider.

