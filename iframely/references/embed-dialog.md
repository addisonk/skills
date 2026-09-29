---
title: "Embed dialog for your site to copy-paste of embed codes"
description: "Add embeds to your site with simple JavaScript"
source: https://iframely.com/docs/embed-dialog
---

# Embed dialog for your site

Embeds dialog is an easy way to give your site's visitors an option to manually copy-paste embed codes of a [Summary Card](/docs/cards) or [Promo Card](/docs/cards#media-cards) from your own site.

## For example

Click the link above to open example of Embed Dialog. It is shown as simple link, so you can design your own.

## Put it on your site

Put embed dialog on your page with simple HTML code:

```html
<a
	href="https://iframely.com"
	class="iframely-embed-button"
	data-iframely-api-key="cd400c7c5f78aad28b8f59"
>
	Embed this
</a>
<script async src="https://iframely.net/embed-dialog-init.js"></script>
```

The tiny script simply loads other dependencies when use clicks on the embed button.

For production use of the script:

- If you use [Custom CDN](/docs/cdn) you may load the script off your own domain name right away.
- Otherwise, please copy the [content of the script](https://iframe.ly/embed-dialog-init.js) and include the loader into `<script> … </script>` or even copy the script and simply source from your own domain.

## Additional data attributes

You can optionally specify the exact URL you want an embed dialog for, and also specify the media attachment:

```js
data-url="http://mashable.com/2015/02/13/friday-the-13th/"
data-promo="http://imgur.com/gallery/GlPlsDi"
```

- if no `data-url` given, the script will use current URL as default;
- if `data-promo` is given, Iframely will use it as media attachment and will generate embed code as [promo card](/docs/cards#media-cards) (available with certain plans);

You may also use MD5 hash of your API key as `data-iframely-key` instead of unencrypted value in `data-iframely-api-key` to make it more secure.

## Customize the look-and-feel

Embed button is designed specifically for ease of your customization of it. You can put any icon, text or have any UI as anchor.
As long as the class name for `<a>` element matches our selector, the embed dialog will work fine.

