---
title: "Lazy-load your embed iFrames"
description: "Iframely will make embeds on your page load in a snap"
source: https://iframely.com/docs/lazy-load
---

# Lazy-load your iFrames

Lazy-loading yields priority to other resources that your user may need first. It postpones loading of all other iFrames until they are about to come into browser's viewport.

iFrames in general are great for security of your site. But your page's `onload` event is delayed until all iFrames load. If you have various scripts that wait for body to load, iFrames loading may add up and have significant drag on your site's performance, perceived or actual, and particularly for mobile users.

Our async [iFrames](/docs/iframes) fix it. iFrame loads empty and fires `onload` in a snap, yields rendering priority to your page, and then loads media in the background.

That approach makes wonders. But it still loads all media with no delay, even if it is way below the fold. This is because iFrames cannot discover whether they are visible or not on their own. They need some help from JavaSript on the parent page.

> If your site has multiple 3rd party add-on scripts such as ad networks or analytics, lazy-loading of rich media may give priority to those secondary 3rd party scripts and so make your primary content appear with a little delay. If that's your case, we recommend to limit lazy-loading to players only.

## How it works

Responsive players will be lazy-loaded with thumbnail image as placeholder first. When iFrame if about to come into viewport, it will be seamlessly replaced with an actual player when it's ready.

## How to activate lazy-loading

There are two ways to activate lazy-loading:

- Via [Player settings](/settings/players): select "Lazy-load" and it will only apply to players.

- Via query-string parameter for all media: add `&lazy=1&iframe=1` to your our API request.

> Heads up: lazy-loading will not turn on when Iframely returns native publisher's code. It only works with our own iFrames. Add [&iframe=1](/docs/parameters) if need be.

## What you get

The lazy-loaded Iframely iFrame will use this approach:

```html
<div style="…">
	<iframe data-iframely-url="https://iframely.net/NdU7I4" data-img …></iframe>
</div>
```

Our iFrame will have no `src` attribute initially. Embed.js script renders such iFrame when it's time. The iFrame sizes are already in the code to avoid screen flicks.

To omit embed.js script from API responses and add it to your page yourself, use [&omit_script](/docs/omit-script).

## Set a custom loading indicator for players

Iframely will not place a loading indicator for players by default. It's because a number of autoplaying videos will have their own spinner.

But there's a simple way to have your own custom loading indicator, all via CSS, if you do want one:

It relies on a single `div` element with the class `iframely-loader` that our script always places on top of the image placeholder while video loads. Your team can add CSS for that loader class. Any one-element loader will work. You can inspire, for example, from this great [collection of examples](https://projects.lukehaas.me/css-loaders/).

