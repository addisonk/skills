---
title: "Iframely embeds for Shadow DOM and Web Components"
description: "Necessary tweaks to make third-party rich media to work in Shadow DOM."
source: https://iframely.com/docs/shadow-dom
---

# Use Iframely embeds inside Web Components

When you place Iframely card and other rich media embed codes into your Shadow DOM, there may be issues. Global JavaScript selectors do not apply to Shadow DOM and we cannot find what we are looking for.

The known issues cover the resize events for rich media such as Twitter, Facebook, Instagram and TikTok. You may also experience issues that link clicks in Iframely's own [summary cards](/docs/cards) do not work.

It is because Iframely's platform [embed.js](/docs/embedjs) script relies on the event messages from iFrames to parent, and we need to be able to match those messages back to an iFrame. If we cannot find an iFrame, the event handlers do not get called.

Please apply one of the following JavaScript fixes to help Iframely with that search:

- You can mark your web component with CSS classname `"iframely-shadow"`. We'll find iFrames there on our own. If needed, we'll search recursively with the same class name.

- You can also change the name of that classname. Please set the `shadow` property in `iframely.extendOptions({...})` method or the `&shadow=` query-string parameter if you load your embed.js script from [your own CDN](/docs/cdn).

- Lastly, you may even override the entire function `iframely.findIframe(...)` to match your specifics. The original function is [here](https://github.com/itteco/embedjs/blob/25bbadb7a76dcb4208926399050e3f8dedf8a2e7/src/messaging.js#L87-L93). It is called the following way.

```js
iframely.findIframe({
	contentWindow: e.source,
	src: message.context,
	domains: message.domains
});
```

