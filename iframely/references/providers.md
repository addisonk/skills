---
title: "What URLs to send to Iframely APIs"
description: "Send us as many URLs as you like. You won't be billed for poor results"
source: https://iframely.com/docs/providers
---

# What URLs to send to Iframely?

Iframely is your single API endpoint. We strive to provide embed code or data for every URL. If we miss a provider you think we should support, please [let us know](/qa/request).

Traditional rich media involves a list of URL patterns. It is to detect supported embeds providers and route accordingly. We encourage you to go ahead and send us all your URLs.

Instead of having an allow-list, choose from [supported media types](/docs/embeds) and Iframely interactives in your settings. Request Iframely to reply with an error otherwise. If a URL does not match your criteria, it won't be billed.

## URL patterns

Giving you a definite list of providers is quite a challenge. We simply gave up trying and stopped counting:

- Iframely has rich media from over [1900 domains](/domains) in our QA database.
- Number of providers offer custom domain for thousands of their customers. Brightсove, Bandcamp, Tumblr, Behance, 23video, Libsyn, Podbean, Art19, Custed, Droplr and many others.
- Thousands websites make videos they embed discoverable for SEO. We recognize: YouTube, Vimeo, Wistia, Brightcove, Kaltura, Dailymotion, JWPlayer, SoundCloud and others.
- Local news stations of USA Today, CNE, NBC and other news networks.
- Self-hosted distributed platforms such as Peertube and Mastodon.
- Every news, media and blogging site that we provide a [summary card](/docs/cards) for.
- Direct URL links to an image, [GIF](/docs/gifs), MP4 video, PDF or office file.
- Any variation of URL shorteners and URL redirects that may mask original URL.

This said, we recommend you send us all URLs that match `/^https?:\/\//i`.

If you absolutely need one, here's the ever-changing list of domains we have in our QA database: [iframe.ly/domains.json](https://iframe.ly/domains.json).

## Manage your own providers list

Alternatively, you can always build a list of URL patterns you want to allow on your end.

To block any of the available domains, you can simply head to [provider settings](/providers) and add any domains that want Iframely to ignore. We'll respond with [error 417](/docs/result-codes#417), no matter the URL redirects.

To disable rich media from individual providers, you may send [&media=0](/docs/parameters#media=0) API parameter. Iframely will disable the media for that individual URL (perhaps, falling back to a [summary card](/docs/cards) if allowed).

> Your providers block list is limited to ~ 800 digits. Use `*` wildcard if required.

## Follow the rules
Before you send a URL to us, please remember about legal implications of doing so.

According to our [Terms of Use](/terms), Iframely is only a technical intermediary.
Whereby, you are responsible for adhering to the terms of service for each provider.

For your convenience and quick reference, here are the links to the terms of use of our most popular rich media providers:
[YouTube](https://www.youtube.com/t/terms), [Twitter](https://developer.twitter.com/en/developer-terms/agreement-and-policy.html),
[Facebook](https://developers.facebook.com/policy/) and [Instagram](https://www.instagram.com/about/legal/terms/api/).

Each provider will also have their own privacy policy. Please consider our [GDPR](/gdpr) input. If needed or wanted, take a look at our [Consents](/docs/consents) feature.

> Please manage a list of providers if you need to control which third party Terms of Use you bind yourself too.

