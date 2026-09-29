---
title: "How to use Iframely embeds with React"
description: "Make React work with Twitter, Instagram, Facebook embeds and the like"
source: https://iframely.com/docs/react
---

# Add Iframely to React

> **Known issue**
>
> [React](https://facebook.github.io/react/) sets HTML via `innerHTML`.
> Per HTML5 [specification](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML), any `&lt;script&gt;` tag is ignored.
> It means that rich media from publishers like Twitter, Instagram, Facebook and TikTok will not work out-of-the-box. It requires a [hosted iFrame](/docs/iframes).

Please read details about `innerHTML` issue and our suggested general solution for it in our [&omit_script=true](/docs/omit-script) guide.
This guide will provide React-specific instructions only.

The issue affects any scripted third-party [rich media](/docs/embeds) such as Twitter, Instagram, Facebook, TikTok, Imgur and GitHub Gists, and Iframely interactives - [summary cards](/docs/cards) and [lazy-loaded](/docs/lazy-load) players.

Because we still need to listen to the control events posted by iFrames, we provide our [embed.js](/docs/embedjs) script.
It is a single script that to make an exception for and add to the page yourself.

## The approach

Assuming you get your HTML codes from us via [API calls](/docs/oembed-api):

- The fix involves putting all rich media that requires it into a [hosted iFrame](/docs/iframes).
- For this, add [&omit_script=1](/docs/omit-script) parameter to your API requests.
- The parameter will make sure that your HTML codes link only to iFrames, native or Iframely-hosted.
- [Add our embed.js](/docs/omit-script#load-when-required) as a single third-party script for correct iFrame sizing.
- Use `dangerouslySetInnerHTML` to properly render rich media HTML content within your React application. Otherwise, the HTML markup will not display properly.
- Run Iframely's loader for each element if needed.

### Fetching HTML code

Fetching of HTML code can be done in multiple ways. See our general recommendation for server-side API calls to [oEmbed](/docs/oembed-api) or [Iframely API](/docs/iframely-api) and serving the HTML from your cache.

If you absolutely need to make API calls from the client, please send requests to the CDN shield `iframely.net/api/…`, or via [your own CDN](/docs/cdn) distribution.

There is also an option to create HTML templates and skip API calls altogether. If the layout shift is not a concern, please read this approach [embed.js](/docs/embedjs#html-templates-for-your-urls) documentation. You' need to run Iframely's loader for each of your elements; see next.

### Add embed.js script

When you [&omit_script=1](/docs/omit-script), Iframely omits our own embed.js too. You'll need to [add embed.js script](/docs/omit-script#load-when-required) to your page yourself.

It is required to adjust the sizes of the iFrames correctly and to handle other [events](/docs/embedjs#card-events).

### `dangerouslySetInnerHTML`

`dangerouslySetInnerHTML` is required to render this HTML content within a React application correctly, or else any markup embedded in that string will not display.

Naming means making sure you trust the source. `dangerouslySetInnerHTML` is safe when you use it with &omit_script because there will be no third-party scripts (and they are not executed by React anyway).

### Run iFrame loader

You might need to run Iframely's loader for lazy-loaded content explicitly. It depends on whether `window.iframely` is available before or after your iFrames are loaded. Because it is asynchronous, execute it every time you add an element to be safe:

```js
window.iframely && window.iframely.load();
```

If you implement a class, trigger Iframely loader either in `componentDidMount`, or `componentDidUpdate`, depending on your lifecycle.

> From React: "Do note that `componentDidMount` will however not be called on component updates".

## Example component

```javascript
import React, { useEffect, useState } from 'src/data/docs/react';

const KEY = 'MD5_HASH_OF_YOUR_API_KEY';

export default function Iframely(props) {
	const [error, setError] = useState(null);
	const [isLoaded, setIsLoaded] = useState(false);
	const [html, setHtml] = useState({
		__html: '<div />'
	});

	useEffect(() => {
		if (props && props.url) {
			fetch(
				`https://iframely.net/api/iframely?url=${encodeURIComponent(props.url)}&key=${KEY}&iframe=1&omit_script=1`
			)
				.then((res) => res.json())
				.then(
					(res) => {
						setIsLoaded(true);
						if (res.html) {
							setHtml({ __html: res.html });
						} else if (res.error) {
							setError({ code: res.error, message: res.message });
						}
					},
					(error) => {
						setIsLoaded(true);
						setError(error);
					}
				);
		} else {
			setError({ code: 400, message: 'Provide url attribute for the element' });
		}
	}, []);

	useEffect(() => {
		// Make sure you load Iframely embed.js script yourself
		window.iframely && window.iframely.load();
	});

	if (error) {
		return (
			<div>
				Error: {error.code} - {error.message}
			</div>
		);
	} else if (!isLoaded) {
		return <div>Loading…</div>;
	} else {
		return <div dangerouslySetInnerHTML={html} />;
	}
}
```

