---
title: "Fine-tune Iframely embeds with CSS"
description: "Use &omit_css=true to switch Iframely to use class names instead of inline CSS styles"
source: https://iframely.com/docs/omit-css
---

# Omit CSS and adjust styles

Iframely wraps responsive iFrames into two `div` elements. By default, required styles are included inline so the HTML works right away.

You may add a bit of required CSS to the stylesheet of your page and use Iframely with class names. Here's when it's particularly useful:

- If your content management system is sensitive for inline styles;
- Just to get slimmer HTML codes so they take less space in your database;
- To activate the predictive height mechanism for the apps such as Twitter and Facebook.

## Add required styles to your page

First of all, add these required classes either as `<style>` section in the head of your page, or your main CSS file as they no longer come with our HTML codes:

```css
.iframely-responsive {
	position: relative;
	top: 0;
	left: 0;
	width: 100%;
	height: 0;
	padding-bottom: 56.25%;
}
.iframely-responsive > * {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	border: 0;
}
```

It includes most CSS styles. But in your CMS, you still need to white-list `padding-bottom: …`, `pading-top`, `height` and `max-width` as iFrames' sizing may differ and Iframely will keep including required styles with HTML codes.

## Omit CSS from API responses

Make your API requests with `&omit_css=true` and you will get an HTML similar to this:

```html
<div class="iframely-embed">
	<div class="iframely-responsive">
		<iframe src="…" allowfullscreen scrolling="no"></iframe>
	</div>
</div>
```

Both native and [hosted iFrames](/docs/iframes) will be returned with class names.

In the styles you added to your page, you match all elements as `.iframely-responsive>*`, not just iFrames, because Iframely may include other features depending on your settings, say a video placeholder.

## Customize embeds via class iframely-embed

The class `iframely-embed` is yours to define and customize.

For example, here's styles if you'd like to center the `max-width`'ed embeds or portrait videos, provided that your parent div is `embed-parent`:

```css
.embed-parent {
	display: flex;
	justify-content: center;
}
.embed-parent .iframely-embed {
	width: 100%;
}
```

If need be, you can add a `max-width` for responsive videos wrapped into `iframely-embed`; or define `padding` after the embed, etc.

For a possible UI fix for Facebook embeds that do not fit on smaller iOS screens (min width for Facebook posts is 350px): try adding `-webkit-overflow-scrolling: touch; overflow-x:scroll;` for class `.iframely-embed`. Horizontal overflow will be scrollable and will not affect your main content.

## Other class names

Iframely will add some more feature class names to the main embed code so that you can fine-tune CSS the way you want:

- Main feature names `iframely-player`, `iframely-app`, `iframely-image`, `iframely-reader`, `iframely-survey`;
- Additional feature flags for players: `iframely-audio`, `iframely-playlist`, `iframely-gifv`, `iframely-slideshow`, `iframely-3d`;
- Iframely cards will come with `iframely-card`. Additionally, there will be `iframely-small` for compact cards.
- Finally, the domain class `iframely-youtube`, `iframely-twitter` and the like. We take the domain name, and remove trailing `.com`, `.net` and `.io` from it. After that, any remaning dots `.` are replaced with dashes `-`.

For example,

```html
<div class="iframely-youtube iframely-player iframely-embed">
	<div class="iframely-responsive">
		<iframe src="…"></iframe>
	</div>
</div>
```

> For HTML widgets such as Twitter, Facebook and Instagram, class names are added only when HTML code is wrapped into Iframely iFrame.
> Native codes from publishers will have no additional class names.

