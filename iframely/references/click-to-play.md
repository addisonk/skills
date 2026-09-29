---
title: "Click-to-play Embedded Videos"
description: "Iframely speeds up your site by holding video loads until user interacts with it"
source: https://iframely.com/docs/click-to-play
---

# Click-to-play videos

When Iframely knows that a video autoplays, we prevent it by putting a video placeholder with your custom "play" button inside our iFrame.
We call it "click-to-play" as the actual video loads only when user requests it.

You may choose "click-to-play" mode as your preference for all supported publishers. Iframely knows both regular and "autoplay" version for most popular videos sources.
It will speed up your site's load time significantly and improve the user experience.

On desktop, our iFrames actually start pre-rendering video when user only just starts reaching out to the play button.
So in many cases, video is readily available when click occurs, creating great speedy impression.

Click-to-play mode for all videos brings additional bonus of branding the "play" button your way across most videos on your site.

Finally, when [player events](/docs/playerjs) are requested, Iframely will add partial events for all click-to-play players.
Even to those publishers that do not natively support playback control.

## Example for general videos

Here’s YouTube video, which is wrapped into "click-to-play" iFrame helper:

## MP4 player

Iframely's video player will always use "click-to-play". Here's an example for [Daily Mail](https://iframely.com/embed/lAwPwq) video:

The player supports video files and HTTP Live Streaming (HLS). There's a link to the video source in the player, so users can check and see the original URL.

## MP3 player

Iframely audio player relies on a compact [media card](/docs/cards#media-cards), supports [player events](/docs/playerjs), [autoplay](/docs/autoplay) and playback sync.

The audio media cards follow both your click-to-play and cards design settings.

## Click-to-play in a card

Click-to-play also works with the cards. If you strictly request compact layout as your [cards design](/settings/cards), Iframely may turn on 'click-to-play' even for videos that we don't actually have an autoplaying variant.

Here's a compact click-to-play card for a TED video hosted on YouTube:

## Change players design

You can change the design of click-to-play videos via our flexible [WYSIWYG editor](/design/click-to-play). Load a few samples from presets to get some inspiration:

  

Let us know if you need any help with it.

## A word about mobile

On mobile touch devices, Iframely will use click-to-play approach only for YouTube, Vimeo, Wistia, Streamable, MP4 videos, MP3 audio and GIFs. We do it via provider's [playback control via JavaScript APIs](/docs/playerjs).
For other providers, we'll show the original non-autoplay player if there's one to avoid double-tap to play.

This is due to the long-lasting effect of early versions of Apple's iOS, which would not start a video except as a reaction to user gesture. This started to change [in iOS10](https://webkit.org/blog/6784/new-video-policies-for-ios/).
But, regardless, some publishers would still not honor `autoplay` variants of their videos on mobile.

There has been significant progress in unification in the past couple years. There's now a [feature policy](https://wicg.github.io/feature-policy/) HTML spec that lets origins delegate permissions to the iFrames.
As browsers adopt the [user gestures delegation](https://github.com/WICG/gesture-delegation/blob/master/explainer.md) and combine it with the feature policies, a reliable click-to-play on mobile becomes a reality.
Unfortunately, we are not quite there yet. We monitor and will add support for more providers when it becomes feasible.

