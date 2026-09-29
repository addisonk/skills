---
title: "Iframely embeds for CKEditor 4 oEmbed plugin"
description: "How-to guide to CKEditor embeds configuration"
source: https://iframely.com/docs/ckeditor4
---

# Configure Iframely for CKEditor 4

This guide is for CKEditor 4. For latest version, refer to [CKEditor 5 guide](/docs/ckeditor).

[CKEditor](http://ckeditor.com/) has two available plugins that rely on Iframely oEmbed API: [Media Embed](http://ckeditor.com/addon/embed) and [Semantic](http://ckeditor.com/addon/embedsemantic) Media Embed.

See [Media Embed's demo](http://sdk.ckeditor.com/samples/mediaembed.html) and its own [documentation](http://docs.ckeditor.com/#!/guide/dev_media_embed).

The plugins use Iframely's demo endpoint out-of-the-box, and you need to change it to the production address with your API key.

## Connect CKEditor to your Iframely account

The option you need to change is `embed_provider`. See details in [CKEditor docs](http://docs.ckeditor.com/#!/api/CKEDITOR.config-cfg-embed_provider).

Here's the production endpoint:

```js
CKEDITOR.config.embed_provider =
	'https://iframe.ly/api/oembed?url={url}&callback={callback}&api_key=YOUR_API_KEY_HERE';
```

Please leave `{…}` values as-is, because CKEditor uses them as template. `YOUR_API_KEY_HERE` needs to be replaced with your actual API key that you see in your profile.

You can also add `&iframe=1` and any other optional [query-string parameters](/docs/parameters) in `embed_provider` endpoint. The embed codes you get will follow your own API settings.

## Known issue

CKEditor has built-in changes and history manager. It needs a better control of the DOM as you edit your article. Hence, CKEditor does not execute the inline scripts that go with the HTML embeds you add.

It will cause text-only previews for some popular embeds like Facebook, Twitter, Instagram, Imgur, GitHub Gists, Iframely [cards](/docs/cards) and [lazy-loaded](/docs/lazy-load) iFrames. All iFrame-based embeds will be previewed alright.

This limitation causes inconveniences only in editor's preview - the actual embed codes will be reinstated and work great after you publish your article.

However, if that is the issue for your users, you can add `&iframe=1&omit_script=1` to your `embed_provider` configuration and [load embed.js](/docs/omit-script#load-when-required) yourself.

Make sure to load embed.js on the article's public page as well. But please do it only if required: when there are embeds in your article. See [this gist](/docs/omit-script#load-when-required).

