---
title: "AMP Embeds - Accelerated Mobile Pages embeds via Iframely"
description: "Iframely helps you deliver embeds with your AMP pages"
source: https://iframely.com/docs/amp
---

# Iframely embeds for AMP Framework

The [Accelerated Mobile Pages](https://amp.dev/) (AMP) Project is a Google initiative that lets publishers create mobile-optimized content.
Google serves AMP view of the articles from their CDN when mobile users search for news.

The AMP framework needs that components for rich media embeds follow the required HTML markup and handle specific JavaScript events flow.
Iframely give you both the markup output in response to API calls and end-user render helpers via [Iframely iFrames](/docs/iframes).

To accomplish this, AMP includes Iframely-specific component - [`<amp-iframely>`](https://amp.dev/documentation/components/amp-iframely/).
If you'd like, however, we can also provide a markup for a hosted `<amp-iframe>`, or for supported publisher-specific AMP components such as `<amp-youtube>`, `<amp-facebook>`, `<amp-tiktok>` and the like.

## See it in action {#test-it-now}

Here's a quick demo. Enter some example URLs (one per line) and hit the button to generate a sample AMP article with that rich media components:

## How to get embeds for AMP

To get an AMP-compatible component, send `&#38;amp=1` as a [query string parameter](/docs/parameters) with your API call.
The `html` field of API response will include an `<amp-` component if any.

Like regular API calls, output HTML can either point to a (specially optimized) [Iframely iFrame](/docs/iframes) or publisher AMP component for supported providers.

By default, we follow your [iFrame settings](/settings/media), including generating [Iframely helpers](/docs/embeds#iframely-hosted-html-helpers) when required,
for cases such as [cards](/docs/cards), [consents](/docs/consents), [MP4s](/docs/click-to-play) and publishers that AMP does not support yet.

> Add `&iframe=1` parameter to your call to always get an Iframely-hosted component.

### Iframely iFrame-powered components

When Iframely returns a hosted iFrame, we can wrap it into Iframely-specific [`<amp-iframely>`](https://amp.dev/documentation/components/amp-iframely/) component
or the generic [`<amp-iframe>`](https://amp.dev/documentation/components/amp-iframe/) component, the latter being slightly more restrictive.

- `&#38;amp=1` parameter defaults to `<amp-iframely>` component (see pull quote below for legacy support).
- You may also call `&#38;amp=iframely` to explicitly request all Iframely iFrames be returned as `<amp-iframely>` component.
- Use `&#38;amp=iframe` to request `<amp-iframe>` instead when we need to generated hosted code.

> Earlier API version defaulted to `<amp-iframe>` for `&#38;amp=1` parameter. Legacy customers will keep getting `<amp-iframe>` on `&#38;amp=1` requests.
> To migrate, start sending `&#38;amp=iframely`, or uncheck that feature flag in your [Iframes settings](/settings/media).

### Provider-specific AMP components

Alternatively, if you do not wish to rely on `<amp-iframely>`, our APIs can also generate the following publisher-specific components supported by AMP.
Unfortunately, AMP support is limited only to these publishers:

`<amp-apester-media>`, `<amp-brightcove>`, `<amp-dailymotion>`, `<amp-facebook-page>`, `<amp-facebook>`, `<amp-gfycat>`, `<amp-gist>`,
`<amp-google-document-embed>`, `<amp-imgur>`, `<amp-instagram>`, `<amp-izlesene>`, `<amp-jwplayer>`, `<amp-kaltura-player>`,
`<amp-megaphone>`, `<amp-pinterest>`, `<amp-reddit>`, `<amp-soundcloud>`, `<amp-tiktok>`, `<amp-twitter>`,
`<amp-vimeo>`, `<amp-wistia-player>`, `<amp-youtube>`

Each component requires a specific JavaScript file to enable it. Please see the gist below for the guide on adding required scripts.

## Include required JavaScript for provided AMP components

AMP requires JavaScript for each component that needs to be enabled. For example, for [`<amp-iframely>`](https://amp.dev/documentation/components/<amp-iframely>/) include this script in the `head` of your page:

```html
<script
	src="https://cdn.ampproject.org/v0/amp-iframely-0.1.js"
	custom-element="amp-iframely"
	async
></script>
```

Overall, we suggest checking the returned embed code and extracting the component name. Having the name, you can then map it to the required JavaScript version, similar to this Gist:

Similarly, you may also add the required CSS for AMP Bento components.

## Avoid placing some media close to the top

Resizable AMP components [cannot appear](https://www.ampproject.org/docs/reference/components/<amp-iframe#behavior) close to the top of the document except when iFrame also uses an image placeholder.
It includes Twitter, Instagram and other script-based rich media.

Iframely will put a required image placeholder on all responsive and resizable embeds to make iFrames work anywhere on the AMP page.
However, AMP may ignore a resize request when an embed is already in the viewport.

Therefore, we recommend placing Twitter, Instagram etc. below 600px from the top of your page or 75% of the user's viewport.

