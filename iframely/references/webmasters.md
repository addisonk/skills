---
title: "A guide to optimizing your site for Iframely"
description: "Publish your meta for Iframely"
source: https://iframely.com/docs/webmasters
---

# A guide to optimizing your site for Iframely

This document describes how to optimize your web-hosted content that people share to apps that use Iframely.

## Target Iframely with your meta

When an end-user shares URL to your webpage in one of the Iframely user apps, [our robot](/docs/about) gathers [meta](/docs/meta) information from your website or app to present that URL to other people and engage them.

We use Facebook's [Open Graph](http://ogp.me/), [Twitter Cards](https://developer.twitter.com/en/docs/tweets/optimize-with-cards/overview/abouts-cards.html),
[oEmbed](https://oembed.com) and Google's [Structured Data](https://developers.google.com/search/docs/advanced/structured-data/intro-structured-data#markup-formats-and-placement).
If none are present, we’ll use your SEO tags for title and description.

Iframely uses metadata to create a [summary card](/docs/cards) so your content gets better engagement.
Our customers, however, may opt to get plain data via API and build their URL previews on their instead.

Here's an example of how it may look.

  
    
  
  
    
  

If you optimized the website for social sharing, you don’t necessarily need to do anything else.

### Meta markup

You may override any piece of `meta` we get for your URLs with Iframely-prefixed Open Graph tags:

```html
<meta property="iframely:title" content="…" />
<meta property="iframely:description" content="…" />
<meta property="iframely:image" content="…" />
…
```

This data will have the highest priority over all other available sources. You may define any of the [meta fields](/docs/meta) that Iframely supports, such as author and date.

### Media card attachment

Iframely can create a [media card](/docs/cards#media-cards) if we find a rich media attachment on your page.

By default, we recognize the most popular video platforms in your Open Graph video, Twitter players and VideoObject structured data.
The known publishers include YouTube, Vimeo, Dailymotion, SoundCloud, Brightcove, and tens of others.

We treat it as an “attachment” and generate the media card like these:

  
    
  
  
    
  

You can also "attach" a video explicitly for Iframely from any of the supported [media publishers](/domains) via `attach` meta field this way:

```html
<meta
	name="iframely:attach"
	content="https://players.brightcove.net/…/index.html?videoId=5847…001"
/>
```

## Target specific Iframely user apps

Like optimizing for the entire Iframely network, you may target specific Iframely user apps, provided they share with you their app name.

Ask the app's support team about that information if needed. If you get click-throughs from the app with a correctly set up name in Iframely, you'll get the name added as referring `&utm_source=…` parameter.
The most common choice for an app name is the company/product/web domain name.

> If you're an Iframely app owner, add your app name [in your settings](/settings/about).

Knowing app name, you can optimize your website for it via `{AppName}:` prefix of Open Graph. For example,

```html
<meta property="drift:title" content="…" />
```

> As an Iframely app owner, you can enter other app's name to consume meta the way they do.
> For example, `og` to consume Open Graph meta as Facebook, or `twitter` to consume it as Twitter.

## Target a user-agent

You may target Iframely via user-agent string. App owner can also submit their extension. [Our robot](/docs/about) will add it at the end of the UA string. By default, the extension is the capitalized app name, if any:

```
Iframely/1.3.1 (+https://iframely.com/docs/about)
Iframely/1.3.1 (+https://iframely.com/docs/about) Atlassian
Iframely/1.3.1 (+https://iframely.com/docs/about) Bloomberg
…
```

Please see how to [allow Iframely robot on your network](/docs/about#allow-iframely-robot-on-your-network) based on user-agent and IPs.

## Troubleshoot Iframely robot's access

Basic robot requirements:

- Your server must use gzip, deflate or brotli encodings.
- Any meta properties needs to be listed in the `<head>` section of your website or app, or they will be cutoff.
- Ensure that your server replies to our robot within 10 seconds. Iframely will otherwise raise a timeout error and will not be able to display your content.
- If your website or app supports several language, you can return relevant variant following Iframely's `accept-language` request header.
- [Add to your allow list](/docs/about#allow-iframely-robot-on-your-network) either the user agent strings or the IP addresses used by Iframely robot.
- If your website uses React, Angular, Redux or other similar SPA technologies, prerender your pages and meta for Iframely robot.

To check how Iframely sees your webpage, please use content [sharing debugger](/debug).

