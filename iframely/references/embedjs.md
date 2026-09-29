---
title: "Embed.js library to unfurl rich media embeds"
description: "Generate responsive embed codes for media players, rich other embeds and summary cards"
source: https://iframely.com/docs/embedjs
---

# Embed via JavaScript

Iframely hosts the `embed.js` JavaScript library that works in orchestrations with [hosted iFrames](/docs/iframes) for third-party rich media and Iframely interactives.

We include the `embed.js` by default as `<script>` to the HTML code of API responses when required if you get your data via our [oEmbed](/docs/oembed-api) or [Iframely API](/docs/iframely-api).

This document describes the library's events, methods and callbacks that you can use.

You may also use the library to unfurl URLs on your page without making API requests first. Instead of content-specific HTML codes from APIs, you could create an HTML template yourself. The HTML code will be less optimized for [layout shift](https://web.dev/cls/) but will work well otherwise.

## Unfurl URLs without API calls

### Add `embed.js` to your page

You can add the `embed.js` script in `<head>` of your page, or in its `<body>`. In the latter case, you'd probably want to add it before all other to avoid the need to run load function.

```html
<script async src="https://iframely.net/embed.js?key={MD5_KEY}"></script>
```

To load the `embed.js` script conditionally, only when rich media is on your page, please copy-paste this [example gist](/docs/omit-script#load-when-required).

- `src` should have either your `api_key` or its MD5 hash value as a `key` parameter in the query-string.
- Securing API by managing [allowed origins](/docs/allow-origins) is recommended for production use.
- You may add any of the other supported [query-string parameters](/docs/parameters).
- If you use a [custom CDN](/docs/cdn), source the `embed.js` script from your domain name.

> You may also self-host the `embed.js` script. It is available [on GitHub](https://github.com/itteco/embedjs) and NPM.

### HTML templates for your URLs

Iframely's `embed.js` will search for the following links on your page with `data-iframely-url` attribute:

```html
<div class="iframely-embed">
	<div class="iframely-responsive">
		<a data-iframely-url href="{URL_TO_EMBED_HERE}"></a>
	</div>
</div>
```

During its load cycle, `embed.js` replaces all such URLs with Iframely iFrame corresponding to the `href` link.

If all links are already in the DOM before you load the `embed.js` script, you'd get all links unfurled. If you load the `embed.js` before adding HTML template elements to your page, please see "Adding links dynamically" below.

You may add `iframely-embed` and `iframely-responsive` styles to your page yourself, as described in our <a href="/docs/omit-css">omit-CSS</a> document. It helps with layout shift until after `embed.js` is loaded.

> Still, if [cumulative layout shift](https://web.dev/cls/) is critical, you'd be better off using APIs instead.

### Adding links dynamically

If you add links dynamically, say, in a chat application or after the `embed.js` script is loaded, there's an extra step for you. Please call `embed.js` loader explicitly:

```js
iframely.load();
```

It will fetch all the missing links and unfurl them. You can also specify an element which `<a>` element to replace with its rich media Frame:

```js
iframely.load(linkElement);
// linkElement - is an <a> with 'href' attribute to replace
```

Alternatively, you may skip the HTML template altogether and specify container element and an URL to put there directly:

```js
iframely.load(containerElement, 'https://{YOUR_URL_HERE}');
```

### Act when unfurling fails

Perhaps an original link or its rich media are no longer available. For example, it was removed from YouTube, became private on Facebook, or changed you changed API settings and didn't allow that media type any longer.

Embed.js will automatically hide such failed rich media. If there's a container of rich media elements you want to hide, there are a couple of ways to do it.

- You may source `embed.js` with optional `&parent=…` parameter containing CSS style name of the parent container. Iframely will find the first parent element with such class name and hide it, leaving the rest of your page tidy.

```js
<script async src="https://iframely.net/embed.js?api_key=…&parent={CLASS_NAME}"></script>
```

- Alternatively, you can listen for the "after cancel" event and handle it as your app requires:

```js
iframely.on('cancel', function (url, parentNode) {
	// url - the original URL to rich media
	// parentNode - container of the deleted rich media
	//   e.g.: send a notification to your CMS to remove URL
	//   or restore simple <a href> link so users can click on it
});
```

- If you only need to restore the failed URl as `a href` link to the same resource, you can source `embed.js` with the parameter `&cancel=0`, and it will convert cancelled widgets into a link.

## Card events

`embed.js` raises a click event if you need to runa ny analytics when your user clicks in a [summary card](/docs/cards):

```js
iframely.on('click', function (href) {
	// For example, call Google Analytics
	ga('send', 'event', {
		eventCategory: 'URL preview',
		eventAction: 'click',
		eventLabel: href
	});
});
```

All clicks in cards open the URL in a new tab, except for the cards of your own domain. The same domain URLs are opened in the same window to allow for seamless navigation.

To change that, override `iframely.openHref` function:

```js
iframely.openHref = function (href) {
	// You're in full control now
};
```

## URL options events

iFrames that are sourced with [content IDs](/docs/ids) will declare [per-use options](/docs/options) for a URL they represent.

For Iframely in a text editor, use those options to build a unique customization form for that URL.

```js
iframely.on('options', function (widget, options) {
	// Use our options.js to build the options form for your text editor
});
```

## Shadow DOM

When you place Iframely card and other rich media embed codes into Shadow DOM, there may be issues.

Please see the guide about how to [use Iframely embeds with Web Components](/docs/shadow-dom).

