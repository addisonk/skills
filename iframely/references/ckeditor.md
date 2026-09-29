---
title: "Iframely embeds for CKEditor oEmbed plugin"
description: "How-to guide to CKEditor embeds configuration"
source: https://iframely.com/docs/ckeditor
---

# Configure Iframely for CKEditor

> This guide is for CKEditor 5. For previous version, refer to [CKEditor 4 guide](/docs/ckeditor4).

[CKEditor](http://ckeditor.com/) includes [Media Embed](https://ckeditor.com/docs/ckeditor5/latest/features/media-embed.html) feature as `@ckeditor/ckeditor5-media-embed` package.
See the [default demo](https://ckeditor.com/docs/ckeditor5/latest/features/media-embed.html#demo) and documentation.

## Understanding Media Embed feature

CKEditor distinguishes between rich media embeds codes that are meant for `preview` in text editor itself (that is, when an author writes an article) and embed codes that are meant to be shown to end-user by your CMS ("actual" embed codes).

By default, CKEditor comes with limited support for text editor `preview` embed codes, and only for select number of predefined publishers.
You can extend or overwrite those preview codes yourself.

When it comes to saving an article into CMS/database, CKEditor offers two options:

- "Semantic data output" (default): that is when generic `<oembed url="…">` tags are saved in the article's markup body;
- Save HTML embed `preview` codes that were used in the editor.

It is recommended that you save semantic data output. Then your CMS gets the actual rich media embed codes on your server-side and replaces `<oembed>` tags with real up-to-date HTML codes, before serving an article to your end-users.

The reasoning behind is simple - CKEditor avoids using any 3rd party scripts as `preview` embed codes as it makes DOM changes and histories uncontrollable.
This would include embed codes from Twitter, Facebook, Instagram, Iframely [cards](/docs/cards) and many others. CKEditor prefers `iframe` as the `preview` code.

Iframely voiced support for this approach during feature development. And we have our own reasons too: your CMS needs to periodically update rich media embed codes from the publishers and use fresh data.

## Media previews in your CKEditor

We recommend simply using Iframely [iFrames](/docs/iframes) for all rich media previews in your CKEditor. Steps you need to take:

- Configure CKEditor to templated Iframely [iFrame](/docs/iframes) code as previews for all URLs. Include your `api_key` and `url` as the iFrame src's query-string parameters.
- Add Iframely [embed.js](/docs/embedjs) on the page with your text editor. The script will simply adjust the height of preview iFrame according to its sizes.
- Optionally add Iframely [default CSS](/docs/omit-css) to the page with your editor (this way you'll have a nicer and slimmer template for your previews).

Here's the complete gist for CKEditor previews:

> Don't forget to add our embed.js file to the webpage with your text editor as below.
> The parameter `?cancel=0` will recover [URLs with no preview](/docs/embedjs#act-when-unfurling-fails) as regular `&lt;a&gt;` link.

```javascript
<script async src="https://iframely.net/embed.js?cancel=0"></script>
```

## On your server / CMS

Please make sure to keep CKEditor's default semantic output in your config.
That way you'll get `<oembed url="…">` tags that you can replace on your server with actual production-ready embed codes.

To get the codes on your server, please use our [oEmbed](/docs/oembed-api) or full [Iframely API](/docs/iframely-api) endpoints.
The HTML you'll get will follow your API settings and API [query-string parameters](/docs/parameters).

You may want to keep the `html` from Iframely API in the cache of your CMS not to make API calls every time.

From the other hand, if your plan supports [Content IDs](/docs/ids), we recommend that you use those and, when time comes to refresh the codes, you refresh all rich media in your article with single API call (in form of `iframe.ly/{ID1}-{ID2}-…-{IDn}.json`) - see [Batch ID requests](/docs/ids#batch-request-up-to-100-ids).

## Fare warning

As you'll figure out, you may of course skip making API calls to retrieve actual HTML codes from Iframely from your CMS. The preview iFrame codes can of course be used technically and will work for your end-users on your site's front-end (provided, you also include our embed.js script yourself on those pages).

But we recommend you don't. Please make the API calls as the HTML codes you will get are better optimized for high traffic, production-ready and will bring better user experience. Besides, that way you'll be able to change your [API settings](/settings) with Iframely and have those reflected on your front-end.

If anything, say your CMS can't make API calls in general or you don't have time for it right away, please consider unfurling `<oembed>` URL tags with features of our [embed.js](/docs/embedjs) script.

