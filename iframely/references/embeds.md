---
title: "Third party rich media embed types and sizes"
description: "Send us as many URLs as you like. You won't be billed for poor results"
source: https://iframely.com/docs/embeds
---

# What to expect as rich media

Third-party publishers provide and host rich media. It comes in a variety of types. Iframely lets you control what to allow as embedded content.

The `html` field in API responses depends on your preferences. Many rich media embeds can be used as-is. Some would require an Iframely [iFrame helper](/docs/iframes) to display correctly.

If any widget type does not fit into your system, you can disable it in your settings. Iframely will try and generate an [Iframely card](/docs/cards) instead. You may disable cards too and get URL data to build URL preview yourself..

## Third-party rich media

Iframely gives you granular control and information about rich media types and general URLs data.

In your [media settings](/settings/media), please choose rich media types that work for your product. You do it via [functional use cases](/docs/links#functional-use-case-rels), `rel` in terms of [Iframely API](/docs/iframely-api) format.

- **Apps** - posts, maps, infographics and widgets, ex. Twitter, Facebook, Instagram, Google Maps, CodePen.
- **Players** - video, audio, podcasts, slideshows, playlists, ex. YouTube, iTunes, NY Times, SoundCloud.
- **Photos & images** - provider-hosted images like Imgur, 500px, Flickr. Otherwise, images are pulled & hosted by Iframely.
- **Raw media files** - GIFs and other direct links to image, video or audio files; served by Iframely.
- **Readers** - long-form readers like Tumblr articles, Twitter timelines, GitHub gists.
- **PDF** and **Office files** - served via Google Reader and MS Office live. Beware of [GDPR](/gdpr).
- **Surveys** - include polls, surveys and forms, ex. Apester, PollDaddy, Quizlet, JotForm.
- **Summary** - publisher's own branded cards for their URL previews, ex.: NY Times, Medium, Airbnb.
- **Attachment** - attached promo media, such as players embedded in an article. Wrapped into a [media card](/docs/cards).

You may disable any of the types. Instead, Iframely would try to build a [summary card](/docs/cards) in that case. [&media=0](/docs/parameters#media=0) API parameter lets you disable rich media for individual URLs.

Please refer to the list of additional Iframely API [rel flags](/docs/links#functional-use-case-rels).

> You can set APIs to respond with [error 417](/docs/result-codes#417) ("expectation failed") when an URL ends up with no HTML based on your preferences. We do not charge for error URLs.

## Iframely-hosted HTML helpers

Iframely provides and hosts additional optional interactives:

- [Cards](/docs/cards) - summary cards are URL previews. Media cards may contain a player attachment.

- Images - to avoid hot-linking to images, they are delivered via hosted iFrame. Images are fetched and optimized for the user.

- [Click-to-play](/docs/click-to-play) - an image placeholder with the "play" button, so player loads only when the user requests it. If publishers' video autoplays, we cover it with click-to-play by default.

- [MP4 player](/docs/click-to-play) - Iframely-hosted MP4 player delivers raw MP4 files and streams.

- [Player events](/docs/playerjs) - unified JavaScript API helps you control playback.

- [Playback sync](/docs/playerjs) - Iframely stops a playing video if a user starts interacting with another one.

- [Autoplay](/docs/autoplay) - videos are started on scroll, optionally muted.

- [GIFs](/docs/gifs) - Iframely transcodes GIFs into smaller auto-looping MP4 files.

- [User consents](/docs/consents) - if needed for [GDPR](/gdpr) or for its own intrinsic privacy value, you can ask user consents before exposing them to third-party rich media.

Iframely also resolves the number of technical inconsistencies from third-party publishers. Depending on your development environment, you might need a [hosted iFrame](/docs/iframes) to deliver media to an end-user.

