---
title: "How to use Iframely embeds with Angular"
description: "Make Angular.js work with Twitter, Instagram, Facebook embeds and the like"
source: https://iframely.com/docs/angular
---

# Add Iframely to Angular

Angular has a common known issue of most JavaScript frameworks. The framework won't execute any `<script>`s in the HTML that you add to page.
You need to have a special handler for each of such needed scripts.

This said, Angular cannot support any JavaScript-based embeds out-of-the-box.
It means you need a workaround fix publishers such as Twitter, Facebook, Instagram, Imgur, GitHub Gists, Iframely own [cards](/docs/cards) and [lazy-loaded](/docs/lazy-load) iFrames, and many more.

iFrame-based rich media such as YouTube videos are generally fine without any extra precautions.

## The solution

To simplify the JavaScript handlers in HTML embed codes for you, we suggest the following approach.

- Configure Iframely (in [app settings](/settings/about)) to always wrap 3rd party JavaScript into an [iFrame](/docs/iframes).
- The config option name is "My engine won't run 3rd party scripts after adding HTML".
- With this on, you'll get Iframely [embed.js](/docs/embedjs) script in your HTML codes instead of publisher's scripts. So it will be the only script you'll need to deal with.
- You can omit our embed.js from HTML codes or keep it. But you'll need to load embed.js to your page on your own anyway, because Angular won't execute any inline scripts.
- Once you add HTML for rich media embed code to your page, you also call `iframely.load()` to trigger Iframely unfurling logic explicitly.

You can make exception in your settings to get code from specific publishers as-is, without Iframely wrappers. Please make such exception in case you feel like dealing with some of publisher's scripts on your own.

> Iframely's own summary cards and lazy-loaded iFrames go with our script anyway.
> Please add our embed.js to your page on your own and call `iframely.load();` in any case to make those features work for you.

## Example integration code

In your code, you'd need the following.

- Get HTML embed code from Iframely API fetched in either of API endpoints (this step is omitted in this guide).
- Inject this HTML code into Component variable for template processor.
- Create a pipe for HTML sanitizer and make it available for component usage.
- Make sure to trigger `iframely.load()` each time your component updates the embedded HTML.

### Component

```js
/** iframely-embed.component.ts */
import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { Input, Output } from '@angular/core';
import { samples } from './samples';

// Importing Iframely's embed.js as library.
import { iframely } from '@iframely/embed.js';
// It is also available on GitHub at https://github.com/itteco/embedjs,
// Or you can load it off our CDN.

@Component({
  selector: 'header-menu-iframely-embed',
  template: `<div>
    <p bind-innerHTML="htmlCode | safeHtml"></p>
  </div>`,
})
export class IframelyEmbedComponent implements OnInit {
  /** Get html via JSON API calls to /api/oembed or /api/iframely. */
  htmlCode = '< … >';

  constructor() {
    /** Trigger on data load from source in case html has embed.js. */
    iframely.load();
  }

  ngOnInit() {}
}
```

### Template

Let's insert HTML from an array of samples and tell sanitizer to omit this HTML checkups.

```html
<div>
	<p bind-innerHTML="htmlCode | safeHtml"></p>
</div>
```

### HTML sanitizer @Pipe example

We need to disable HTLM sanitizer to allow arbitrary 3rd party HTML code. Iframely will have our required CSS inline, though you can reduce the number of CSS by using [&omit_css](/docs/omit-css).

```javascript
// safe.pipe.ts
import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
    name: 'safeHtml'
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitized: DomSanitizer) {}
  transform(value) {
    return this.sanitized.bypassSecurityTrustHtml(value);
  }
}
```

Pipe has be registered with templating system to be recognized. For example, use it project-wide.

```javascript
// header-menu.module.ts
import { SafeHtmlPipe } from './safe.pipe';

// …

@NgModule({
  declarations: [
    // …
    SafeHtmlPipe
  ]
})
```

The example above will also allow `<script>` tags without being sanitized. Though they won't be executed, you might still have security concerns. If that bothers you, you may simply ask Iframely to [omit-script](/docs/omit-script) (embed.js and any 3rd party ones) and then block any script in your sanitize (but please allow inline CSS as we'll still need it).

### Package embed.js

If you import Embed.js, it should be included and installed via project dependencies:

```json
"name": "iframely.angular",
"dependencies": {
  "@iframely/embed.js": "^1.3.1",
  …
}
```

You can also [get it on GitHub](https://github.com/itteco/embedjs) and included it to your page as `<script>` (once), either off your server or off Iframely CDN.

In any case, please trigger `iframely.load()` to make sure Iframely unfurling process begins after your add a rich media to your page.

Please feel free to grab demo project on [Stackblitz](https://stackblitz.com/edit/angular-iframely-integration).

