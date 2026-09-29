---
title: "Player Events & Playback Sync"
description: "Iframely unifies player events across multiple publishers"
source: https://iframely.com/docs/playerjs
---

# Player events & playback sync

Iframely [iFrames](/docs/iframes) give you an option to listen, react or control embedded video playback with JavaScript using unified events-methods model.

That flow relies on cross-window communication via `postMessage` mechanism available for iFrames. To make it happen, Iframely adds JavaScript connectors for number of video publishers, unifying their various APIs into a consistent event model.

Say, you may listen to an event that video is paused or start video playback using your custom button. Our iFrames helpers can cover one use-case out-of-the-box: make sure that only one player is active at a time.

## Player events API

Iframely events API follows [Player.js](http://playerjs.io) spec, published under Creative Commons by our colleagues from Embedly.

- Add `&playerjs=1` to your API calls to get Iframely iFrames that follow Player.js spec. It works when Iframely iFrame is returned.
- To orchestrate the players, you can get player.js library [on GitHub](https://github.com/embedly/player.js/), or simply listen to the specified events yourself.
- If you use [Iframely JSON](/docs/iframely-api) as your API format, check `rel` array attribute. We add `playerjs` value there if we could make player be compatible.

## Browser support

Please be advised that most browsers have caveats when starting media with sound. Please see the browser support warning in our [Autoplay](/docs/autoplay) document. Therefore, consider muting your media before playing it, especially if there is no user interaction.

> If a video with sound would not start when asked, please try to muted it first, then play again.

## Supported publishers

Iframely recognizes YouTube, Vimeo, SoundCloud, Dailymotion, Brightcove, Streamable, Vid.me, Facebook videos, Wistia, all MP4 videos (+ [friendly gifs](/docs/gifs)) and MP3 audio, Office Mix, sendvid, playstv.

[Click-to-play](/docs/click-to-play) mode adds partial player events to all publishers with an autoplaying media variant. Albeit, with a "stop" function that reverts back to an original "not-started" state.

We constantly monitor, discover and add new publishers that can fit into unified events API.

## Playback sync

The most common use case for player events is to synchronize playback across multiple videos on your site. So that when user clicks to play a new video - the one that is already playing will stop automatically.

Iframely covers this feature without the need to handle events on your side. Simply activate it in your [player settings](/settings/players), and Iframely will let only one video play at a time (among popular players that we can control).

## Quick demo

Here's the playback sync in action. Try starting a video, and then another. It works across multiple browser tabs too.

