---
title: "Publish your rich media for Iframely"
description: "How to make your rich media embeds available on Iframely"
source: https://iframely.com/docs/publish
---

# Publish your rich media for Iframely

To make your rich media iFrames available on Iframely, please make them discoverable to Iframely first by adding a `<link>` element that points to that iFrame. We would need to review and approve your media before it becomes available on Iframely. 

We also recognize [oEmbed](https://oembed.com), Facebook's [Open Graph](http://ogp.me/), [Twitter Cards](https://developer.twitter.com/en/docs/tweets/optimize-with-cards/overview/abouts-cards.html),
and Google's [Structured Data](https://developers.google.com/search/docs/advanced/structured-data/intro-structured-data#markup-formats-and-placement).

> [Submit your domain](/docs/publish#submit-for-review) for our review; unrecognized `link` will not work.

## Discovery via `<link>` meta tag

If your rich media embeds as an iFrame, let Iframely discover it via custom `<link>` in the `<head>` section of your page:

```html
<link
	rel="iframely"
	href="https://coub.com/embed/2pc24rpb"
	media="(aspect-ratio: 1280/720)"
/>
<!--
  [rel]:   Target Iframely,
  [type]:  optional, "text/html" to publish embed as iFrame
  [href]:  with this href as src
  [media]: and with this size
-->
```

Iframely translates such `link` into the following responsive embed code:

```html
<div style="width: 100%; height: 0px; position: relative; padding-bottom: 56.25%;">
	<iframe
		src="https://coub.com/embed/2pc24rpb"
		style="width: 100%; height: 100%; position: absolute;"
		frameborder="0"
	>
	</iframe>
</div>
```

## Discovery via `link` HTTP header

If it is simpler for you to set [Link Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Link), publish your Iframely link this way:

```html
Link: <https:// … >; rel="iframely"; type="text/html"; media="…"
```

## Link attributes

### href

Link's `href` attribute is a source of a media element, primarily an `src` attribute of an iFrame. Because iFrame is our default case, `type` optional there. Or you can publish it as `text/html` for an explicit value.

`href` can also point to images with the corresponding image `type`.

Please make sure [Iframely robot](/docs/about) can access href resource.. We will fetch it to verify that iFrame source is valid, and that there is no `x-frame-options` or `frame-ancestors` headers that prevent it from embedding.

### rel

Rel attribyte is a string representing an array of space-separated values:

- `rel` list should start with `iframely` to recognize that you publish for us.
- Add primary functional rel from the [list of recognized rels](/docs/links#functional-use-case-rels), for example, `rel="iframely player"` for video players. If omitted, we use `app` as default. You can also publish `thumbnail` images.
- Optionally add [information rels](/docs/links#information-rels) such as `audio` and `playlist` (`rel="iframely player audio"` );
- Or required [feature-policy](/docs/links#feature-policy) directives. We'll pass them into `allow` attribute of the embedded iFrame code (`rel="iframely player encrypted-media"`).
- Please add `playerjs` into `rel` if you publish a player that supports [playback events](/docs/playerjs).

> Please do not include `autoplay` if you need it for feature-policy. It's not supported and will be considered as functional `rel` instead. Your player will be handled as auto-starting and requiring a [click-to-play](/docs/click-to-play) cover.

### media

Media attribute represents your iFrame's sizing. It is an optional attribute, with the default fixed aspect-ratio of 16/9 for iFrames and sizing auto-detect for images.

Any sizing media query from the [supported dictionary](/docs/links#sizes-in-media-query) works. If you need another aspect-ratio, include it as this:

```html
<link … media="aspect-ratio: 4/3;" />
```

To add a max-width or small fixed padding on top or at the bottom, use `max-width` and `padding-bottom`, respectively, in pixels:

```html
<link … media="aspect-ratio: …; max-width: 640; padding-bottom: 16" />
```

### `type` attribute

`type` attribute is optional, defaulting to `text/html` for an iFrame embed. 

Similarly, you can publish MP4 and streaming video sources, audio and images simply by choosing a `type` from [supported MIME types](/docs/links#mime-types). For images, you may omit the `media` sizing altogether.

## Frequently requested

Our most-common case is a responsive iframe that resizes via a fixed aspect-ratio. The next most popular sizing choice after our, as is shown in our default example. We also also see many publishers that build media that requires a horizontally-resizing iframe, or widgets with dynamic height altogether.

### Horizontal iFrame

"Horizontal" iFrame is a special media case where an iFrame that resizes to 100% of available width with a fixed height.

To achieve that, provide just `height: …` (in pixels) as your `media` attribute:

```html
<link rel="iframely reader" href="…" media="height: 420" />
```

If you would like to give your users an option to change the height of your iFrame, please add `resizable` into `rel` of your link. We will then add the height mechanism to [user options](/docs/options).

### Embeds with dynamic sizes

If the height of your iFrame needs to change depending on the user device and available space, you'd likely need to include `<script>` in there and pass the entire `html` to Iframely.

Please make it available for [oEmbed](https://oembed.com) discovery and [submit your site](/qa/request) for review.

## Target specific Iframely user apps

Like publising for the entire Iframely network, you may target specific Iframely user apps, provided they share with you their app name:

```html
<link rel="atlassian" href="…" media="aspect-ratio: 16/9" />
```

If your rich media is targeted, skip `iframely` from the `rel` and leave on app name. Only that specific app will receive your media.

## Submit for review

We would need to review and approve your media before it becomes available on Iframely. Please make sure that your site is live and ready for our review in one go.

Here is what we will be looking for:

- You have an active production-ready website and rich media.
- You have working examples of production URLs created by your users.
- We will try and discover other URLs on our own.
- You provide embed codes for manual copy-pasting by end-users. 
- Preferrably, there is a link to your documentation about the feature.
- The domain and links you provide are useful for end-users.
- There are no restrictions via `frame-ancestors` or `x-frame-options`. We may enable your intergation for specific Iframely users if you do need the restrictive content security policy.

> Once ready, [submit your domain](/qa/request) for our review.

