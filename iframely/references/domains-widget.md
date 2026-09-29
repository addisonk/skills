---
title: "Iframely domains widget - embeddable widget of supported publishers"
description: "Iframely supports over two thousand providers, and you can share some of those providers with your users"
source: https://iframely.com/docs/domains-widget
---

# Domains widget

Iframely supports over two thousand [rich media](/docs/providers) providers. While it is a challenge for us to maintain the full list, we do our best and maintain an embeddable widget of supported publishers, so you can share some of those providers with your users.

Here’s how the widget looks:

Widget is built as a web component so you can program it without cross-domain restrictions. Here's its basic embed code:

```html
<iframely-domains></iframely-domains>
<script type="module" src="https://iframely.net/domains.js"></script>
```

The widget is configurable. You can change the icon styles, page size, as well as choose some tag categories and the first page. Read this complete specification of every widget attribute, or [customize your widget here](/domains-widget) with WYSIWYG editor.

## Attributes

To change the behaviour of domains widget, you can set different attribute values. For example, here's a dark theme with small icons:

```html
<iframely-domains theme="dark" icon-size="small"></iframely-domains>
<script type="module" src="https://iframely.net/domains.js"></script>
```

> Please note that `src` of widget's script can be sourced from your [custom CDN](/docs/cdn).

Below is the list of the attributes with possible values.

### `theme`

**Values**: `auto`, `light`, `dark`<br>
**Default:** `auto`

Sets the widget color mode (dark and light theme). `auto` mode automatically chooses between light and dark modes depending on users' system settings.

### `font-family`

**Values**: `inherit`, `system-ui`, `sans-serif`, `serif`<br>
**Default:** `inherit`

Sets the font. To use your custom font, use default `inherit` value. `system-ui` will use user's default operating system font.

### `icon-size`

**Values**: `small`, `medium`, `large`<br>
**Default:** `medium`

### `icon-style`

**Values**: `fill`, `fill-accent`, `border`, `border-accent`, `plain`<br>
**Default:** `fill-accent`

### `icon-shape`

**Values**: `square`, `round-square`, `squircle`, `circle`<br>
**Default:** `round-square`

### `sort`

**Values**: `rank`, `sitename`, `accent-color`<br>
**Default:** `rank`

Defines the order of the providers in the list. Default is the rank that we take from SimilarWeb, smallest number being the most popular on the Internet. `sitename` will sort the widget alphabetically.

### `tags`

**Values**: comma-separated list of keywords<br>
**Default:** empty

The widget is searchable by keywords and provider names. You may have some of the keyword tags be added as categories in your widget. The categories will show up as the tab navigation.

The navigation will be added only for supported tags. If a tag yields no publishers, it will be omitted.

### `lead-tags`

**Values**: comma-separated list of keywords<br>
**Default:** empty

Similar to `tags` above, `lead-tags` are to choose categories that go onto the front page. Whatever tags you choose will form the landing "lead" list of publishers in your widget.

### `page-size`

**Values**: number<br>
**Default:** `60`

The number of providers per page. The widget is responsive, but pagination always using the same number of providers so you can control it.

Please put the widget on your page and see if you need to adjust the page size so it fits well with no empty spaces.

60 is the default value so it works well in many scenarios, yielding full rows with 2, 3, 4, 5, 6 columns.

## Events

The widget raises a few events so you can change some behaviours.

### `iframely-domains-click`

If you need one, add a handler for when your user clicks on a provider. The event body will come with the provider information.

```js
document.querySelector('iframely-domains').addEventListener('iframely-domains-click', (event) => {
	event.preventDefault();
	// Handle `event.detail` in your code here...
});
```

The provider/domain information will come as event's `detail` property:

```js
// event.detail
{
  sitename: 'Iframely',
  domain: 'iframely.com',
  slug: 'iframely',
  url: 'https://iframely.com'
}
```

### `iframely-domains-load` and `iframely-domains-update`

These are the events when the widget loads its initial size or updates the size.

Because the widget has no height initially, you may experience quite a bit of layout shift. To avoid that, you may reserve the empty space for the list of providers and adjust that space on widget's triggers.

