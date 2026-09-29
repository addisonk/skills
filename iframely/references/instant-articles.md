---
title: "Iframely Embeds for Facebook Instant Articles"
description: "Iframely helps you deliver embeds for use in Facebook Instant Articles"
source: https://iframely.com/docs/instant-articles
---

# Iframely embeds for Instant Articles

All of Iframely embeds should work fine in Facebook Instant Articles out-of-the-box. There are couple of caveats though.

If you're new to Instant Articles, follow [these instructions](https://www.facebook.com/instant_articles/signup) to sign up for it with Facebook.

## How-to: use op-interactive

> Please refer to [this Facebook documentation](https://developers.facebook.com/docs/instant-articles/reference/embeds) about `op-interactive`.

Using Iframely embed codes with Instant Articles is simple:

```html
<figure class="op-interactive">
	<iframe class="no-margin">
		<!-- place HTML code you get from Iframely here -->
	</iframe>
</figure>
```

Any HTML code you get from us should work well: our [iFrame](/docs/iframes) helpers, cards, or native publisher's "as-is" code.

## Avoid pitfalls

### iFrame tag should not have attributes

Leave iFrame tag in `op-interactive` wrapper empty: just `<iframe>`.

If Facebook sees any attributes in iFrame, it will also request that `width` and `height` are supplied, and then FB will use those for resizing iFrames dynamically using fixed aspect-ratio, which isn't right for a number of embeds publishers.

### Make sure figure is standalone

We saw people having issues with Instant Articles because `<figure>` was also wrapped into `<p>` element. The `<figure>` should stand by itself. Here's what Facebook's documentation says:

> The `<figure>` element representing the embed must be included standalone within the body of the article and not enclosed within a `<p>` element.

## Transformer rules

If you use Instant Article SDK with automatic [Transormer Rules](https://developers.facebook.com/docs/instant-articles/sdk/transformer-rules), here's the rule that you need to transform Iframely rich media embeds into `op-interactive` given above.

The below transformer rule code assumes that you wrap all Iframely rich media embeds into a `<div class='iframely-wrapper'> … </div>`:

```json
{
	"class": "InteractiveRule",
	"selector": "div.iframely-wrapper",
	"properties": {
		"interactive.iframe": {
			"type": "children",
			"selector": "div.iframely-wrapper"
		}
	}
}
```

> If you use [WordPress](/wordpress) with Gutenberg editor, your rich media is wrapped into two `div`s.
> Get your transformer rule from [this gist](https://gist.github.com/nleush/abeb2931c74acd4406c1b45f2269ef15).

Please [let us know](mailto:support@iframely.com) if you run into other issues. We'll be debugging with you and updating this manual as required.

