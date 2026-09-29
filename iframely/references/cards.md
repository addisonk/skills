---
title: "Iframely Summary Cards for URL Previews"
description: "Iframely generates number of summary previews and fallbacks, when used along with short URLs. Here's some"
source: https://iframely.com/docs/cards
---

# Card URL previews

Iframely generates cards as URL previews when we can't find rich media embed codes from the publisher.

If allowed in your [settings](/settings/cards), Iframely will try to generate a card previews. It follows this logic.

- Simple summary card for any public URL we have a thumbnail image for, if no other rich media is found from publisher.
- Summary card as fallback when publisher's rich media won't work for your user (Flash-only, or lack of SSL support) or when you specifically disabled that particular type of rich media in your settings.
- Media card, when we find rich media that is attached to the article (say, a post with embedded YouTube video in it).
- Media card for any video URL, if requested with `&iframe=card` API parameter or configured as preference in your settings.

Cards rely on our [iFrames](/docs/iframes) and follow the design your configure in your settings.

When Iframely suggests a summary preview for your URL, the primary `rel` array of [Iframely API](/docs/iframely-api) will contain `summary` in it.
For media card, we'll add `promo` to the list of rels. [oEmbed API](/docs/oembed-api) endpoint returns both as `rich` type.

## Summary cards

Summary cards are URL previews. We do it for articles, for media players that we do not allow, and also for general URLs that at least have a thumbnail image (thus, trying to avoid private links and internal in-app URLs).

  
    
  
  
    
  

To always get a summary card (i.e. disable rich media for a particular URL), you can make your API requests with `&media=0` in query-string [parameters](/docs/parameters).

Compact card is generated when we only have a smaller or portrait thumbnail image. Plus, you can also force a compact card in your cards settings or by adding `&card=small` parameter to your API call.

## Media cards

Media cards wrap rich media such as players into a card with all URL attribution details. By default, we do it for players that are "attached" to the article - meaning that they do not represent the main content of the webpage (or simply don't have an attribution link to the canonical URL). You can also request it for any player by adding `&iframe=card` to your API call.

  
    
  
  
    
  

Media cards can be combined with [click-to-play](/docs/click-to-play) and also will support [player events](/docs/playerjs) if requested. A compact media card will always go with click-to-play, even if we don't actually have an autoplaying media.

## Change design of the cards

You can change the layout and design for the cards via our flexible [WYSIWYG editor](/settings/cards). Load a few samples from presets to get some inspiration. Change the design of click-to-play buttons separately in your [player settings](/settings/players).

Let us know if you need a hand with it.

## Dark and light themes {#themes}

Iframely supports theming of the cards and [user consents](/docs/consents). If your app offers dark or light themes to your users, you can change cards to match the user preferences.

- Using the [WYSIWYG editor](/settings/cards), define colours for two card themes: dark and light.
- You can configure the default card theme to be dark or light specifically, or "auto" mode. Iframely will then match the user's operating system preferences.
- Override your default theme for an individual user using query-string parameters below with `dark` , `light` or `auto` values.

There are a few ways to override your default setting of theme for a specific user:

- You may repeat the API calls with `&theme=…` parameters.
- You may call `setTheme` method of Iframely's [embed.js](/docs/embedjs) script:

  ```js
  iframely.setTheme('dark');
  ```

- If you use the [omit_script](/docs/omit-script) API parameter and add our embed.js script to the page yourself, you can add query-string to the `src` of the file:

  ```html
  <script src="https://iframely.net/embed.js?theme=dark">
  ```

If you run into the issue of flickering while loading cards in light mode and then switching to a dark one, please lazy-load iFrames with `&lazy=1`.

