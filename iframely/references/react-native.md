---
title: "Add rich media embeds to React Native header-menu via Iframely webview"
description: "How to set up a WebView to use YouTube, Twitter, Instagram, Facebook embeds and many more."
source: https://iframely.com/docs/react-native
---

# Iframely embeds in React Native

If your build a mobile app using React Native, we suggest wrapping HTML codes you get from Iframely APIs for rich media embeds into a self-adjusting WebView.

> You don't need a separate component if you already serve your entire article's content in a WebView.
> The HTML codes will work just fine with the rest of your HTML content. This guide is for apps that want to render rich media embeds separately.

We took inspiration for the approach from Facebook [Instant Articles](/docs/instant-articles) and their `op-interactive` component.

- You first get HTML embed codes from our [oEmbed](/docs/oembed-api) or [Iframely](/docs/iframely-api) API endpoints.
- Then you put those HTML codes as the source property of `WebView` component of React Native framework.
- Plus, inject a simple JavaScript that sends a message to the parent to change the height of the WebView once the embed codes unfurl themselves.

The tricky part is to set up the initial WebView sizing correctly to avoid flicks of the rest of your content as embed codes expand.
The other potential issue is to accurately detect when the rich media inside the WebView changed its sizes.

> Please make API calls with &ssl=1 to avoid Iframely's default protocol-less `//` embed codes. The protocol of your WebView is likely `file://`.

## Suggested component

Here's a working component that you can copy and expand as required:

You can see that Iframely's HTML embed code provides initial media sizing. The resizes triggers go via window messaging.

> The gist requires React Native 0.57. Before the 0.57 release, window messaging [wasn't reliable](https://facebook.github.io/react-native/blog/2018/08/27/wkwebview).
> If you need to support earlier versions, you may use [this lib](https://github.com/iou90/react-native-autoheight-webview) for messages instead.

## Recommended API query-string and settings

First of all, make sure you turn SSL on in your [API settings](/settings/about) or via `&ssl=1` parameter. It avoids our protocol-less `//…` embed codes, which may translate into `file://` in your WebView and fail.

The above approach for React Native component will work with any HTML codes returned by Iframely otherwise. You may use any [query-string](/docs/parameters) or API options.

However, we recommend using APIs with at least `&omit_script=1`, or even with `&iframe=1`, so that you get Iframely-hosted iFrames for all script-based embeds such as Twitter, Instagram, Facebook etc.
You can also achieve the same with your API settings.

Omitting scripts will kick in our "predictive-height" mechanism, and there will be minimal layout shift and friction while rich media renders.

Additionally, with Iframely iFrames, there will be more reliable detection that content inside an iFrame changes its size as iFrames will raise such messages.

