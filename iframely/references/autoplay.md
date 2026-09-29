---
title: "Autoplay Embedded Videos, Audio and GIFs"
description: "Iframely lets you safely autoplay videos when user sees them"
source: https://iframely.com/docs/autoplay
---

# Autoplay video, audio and GIFs

Iframely lets you safely autoplay embedded players. It works as "play-on-scroll": playback starts when/if user sees the media. Player pauses or stops when it leaves the viewport or another player is started.

The Autoplay feature is powered by Iframely [Hosted iFrames](/docs/iframes) and [Player events & playback sync](/docs/playerjs), with visibility detections via [embed.js](/docs/embedjs).

## API parameters

To use Autoplay, make your API calls to our [oEmbed](/docs/oembed-api) or [Iframely API](/docs/iframely-api) endpoints with the following optional query-string parameters:

### `&autoplay=1`

<div id="autoplay=1"></div>

To start media playback when player is visible.

HTML code in API response will point to Iframely iFrame and will also include the `embed.js` script. You can [omit the script](/docs/omit-script), as with any other API call.

Due to differences in implementations, the video may fail to start in some browsers in some cases. Please consider muting the video before playing it if that's your case.

If a video with sound would not start when asked, Iframely will retry it muted, albeit with a few seconds delay. The experience may be better if you mute it yourself right away.

### `&mute=1`

<div id="mute=1"></div>

To mute the players on start for supported publishers.

> The combination of `&autoplay=1` and `&mute=1` is ambiguous for audio. Iframely will return a regular player instead so you can safely make API calls targeting only muted video.

### `&mute=0`

If a video with sound would not start when asked, Iframely will retry it muted with a few seconds delay. To disable that fallback and simply fail, disable it with `&mute=0`.

## Supported browsers

### Visibility detection

First and foremost, Autoplay feature relies on [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) to detect when media is visible to your user.

Most modern browsers support the observers. [See the coverage](https://caniuse.com/#feat=intersectionobserver).

We deliberately do not fall back to the old school of visibility detections for the legacy browsers. The intention is to be gentle on end-user's CPU and not to render your site sluggish with constant synchronous visibility checks.

If we cannot run visibility checks, Iframely will simply fall back to non-autoplaying media variants.

### Chrome browser

Chrome's [Autoplay Policy](https://developers.google.com/web/updates/2017/09/autoplay-policy-changes) checks Media Engagement Index (MEI). It is calculated individually for your web domain.

Muted autoplay is always allowed. Autoplay with sound is allowed if user has interacted with the domain (click, tap, etc.) or if MEI threshold has been crossed.

In other words, whether a media will autoplay or not depends on your site's user experience and engagement of an individual user.

If autoplay isn't possible, most media publishers will simply catch a JavaScript error, and will fall back to their non-autoplaying variants by themselves.

> Please consider `&mute=1` and have all playback muted if most of your visitors are first-timers with no prior domain interactions.

For development and debugging purposes, you may also opt to change Autoplay-Policy via developer switches in `chrome://flags/#autoplay-policy`.

### Mobile

Most mobile platforms require a user gesture to autoplay a media with sound. Iframely will therefore try and mute media playback on mobile for all publishers that allow such control (see below).

For publishers that don't provide such mute control, Iframely will simply fall back to non-autoplaying media variants.

Additionally, WebKit has released the support of intersection observers in iOS 12.2. Older browser versions will fall back to non-autoplaying media.

## Supported media publishers

"Autoplay" requires playback sync so to pause/stop a playing video when another one on the page starts. Therefore, the list of supported media publishers for "Autoplay" is the same our list of publishers for "Playback sync". [See here](/docs/playerjs#supported-publishers).

