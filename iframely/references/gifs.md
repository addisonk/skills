---
title: "Embed GIF by converting them to looped MP4 videos (GIFV)"
description: "Iframely Embeds API will present your GIFs in mobile-friendly way"
source: https://iframely.com/docs/gifs
---

# Web-friendly GIFs

Converting plain GIF files into looped MP4 videos is Web- and mobile-friendly approach, pioneered by Gfycat, Imgur and Twitter. Iframely does the same.

Here’s why. MP4 version is nearly 10 times smaller:

  
    
  
  
    <img src="https://iframely.net/files/gifv-example.gif" width="400" height="213" alt="Original GIF, 2.7Mb">
  

> Try clicking on Iframely version above - you&#39;ll see that your clicks pause and resume the&nbsp;playback.

Iframely downloads the original GIF file, transcodes it and serves as video in our <a href="/docs/iframes">iFrames helper</a> to save some bandwidth for your users. We call it GIFV - the name suggested by Imgur for such "GIF Videos".

## How to activate

Support for GIFVs is turned on by default. In your [settings](/settings/media), you can disable GIF files as allowed media types. If your plan doesn't include GIFVs, Iframely will consider them disabled too.

When Iframely returns a GIFV, the `rel` array in [Iframely API](/docs/iframely-api) format will include `gifv` value. [oEmbed API](/docs/oembed-api) will return GIFV as `video` type.

While transcoding may take a few seconds, depending on the GIF size, our iFrames may initially use original GIF file until after the MP4 file is ready.

## Click-to-play

You can make GIFs to not load at all until user interacts with it first. Just activate [click-to-play](/docs/click-to-play) for them in your [players settings](/settings/players). On desktop, click-to-play starts GIFV when user hovers it. On mobile - when user clicks it. For example,

Click-to-play is the default behaviour of converted GIFs on mobile devices that don't support autoplaying MP4 videos (say, all WebViews in iOS apps as of April 2018).

