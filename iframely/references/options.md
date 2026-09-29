---
title: "Embed Options - per-use embed code customization"
description: "Let your users customize individual rich media embeds for their posts, right in the text editor"
source: https://iframely.com/docs/options
---

# URL options form in your editor

Designed for text editors and CMS, Iframely per-use URL options let your authors fine-tune individual rich media, choosing from specific micro variants each publisher supports for their embed codes.

Iframely declares available micro customization options as additional, provider- and content-specific query-string parameters for each URL you give us.

You can preview the options available for your URLs in our [Check URLs](/try) tool. The media customization form is right below an embed code:

Options come in a simple JSON structure. Use it to generate an HTML form and give it to your authors and editors. When your user selects an option, please send it to Iframely as the query-string parameter.

> Alternatively, you may simply point your authors to [this guide](/docs/cherry-pick) and let them cherry-pick embed for each URLs and use options without the need of full options editor.

## Options JSON format

Options declaration should be intuitive and easy to read. Here's the simplest JSON declaration of text caption option for individual Instagram's posts:

```json
{
	"options": {
		"_showcaption": {
			"value": true,
			"label": "Show author's text caption"
		}
	}
}
```

Essentially, we declare available query-string parameters for API calls. You can repeat your API calls with those options as parameters that are unique for each provider and URL:

```
iframe.ly/api/oembed?url={URL}&_showcaption=false
```

- Available query parameters come as the keys in the `options` object.
- Each parameter is an object. It includes a current `value` and a `label` to describe that option to the end-user.
- Type of `value`, as well as other attributes, describe the form UI element for that option.
- For example, a boolean `value` translates into a simple checkbox.

Parameters that are specific to given rich media will start with `_` underscore prefix.

Iframely may add some of its interactive options based on all URL data. We do not underscore such options as they match our [API parameters](/docs/parameters). For example, [&media=0](/docs/parameters#media=0) parameter for a [media card](/docs/cards#media-cards).

Options JSON may also have a reserved `query` key. It echoes any API parameters that you send to us. It is to help your app detect default option values and the ones that your user selected:

<pre><code class="language-json">"query": ["_theme", "_playlist","_artwork"]</code></pre>

## Parameter input types

### Checkbox

Ex. Twitter:

```json
_hide_thread: {
	value: true,
	label: "Hide parent Tweet"
}
```

### Text input

Ex. YouTube:

```json
_start: {
	value: "7",
	label: "Start from",
	placeholder: "ex.: 11, 1m10s"
}
```

### Radio group / selectbox

Ex. Soundcloud:

```JSON
_height: {
	value: "400",
	label: "Adjust height",
	values: {
		"300": "300px",
		"400": "400px",
		"600": "600px"
	}
}
```

### Range input

Ex. Google Maps:

```JSON
_zoom: {
	value: 17,
	label: "Zoom",
	range: {
		max: 21,
		min: 3
	}
}
```

These're all the option types you may get. See below for hints on the options form UI.

### Example & test

Here's an example of full options object with most of these types (CodePen):

```json
options: {
	_theme: {
		value: "dark",
		values: {
			auto: "Default",
			dark: "Dark",
			light: "Light"
		},
		label: "Theme color"
	},
	_click_to_load: {
		value: true,
		label: "Use click-to-load"
	},
	_height: {
		value: "600",
		label: "Adjust height",
		placeholder: "ex.: 600, in px",
	},
	query: ["_height", "_theme"]
}
```

Can you tell what's a checkbox, what's a radiogroup and what's a text input? Which options are not default?

[Check yourself](/try?url=http%3A%2F%2Fcodepen.io%2Fdudleystorey%2Fpen%2FHrFBx?_theme=dark&_height=600).

## The options flow

Iframely assumes the following workflow.

- You get available parameters JSON from us in two ways: a) as part of an API response and b) as an event message from [iFrames](/docs/iframes) itself.
- If options JSON is available, you generate a form UI for your URL using declared parameters and give that form to your users to fine-tune their rich media.
- When a user chooses an option, you need to listen for or request a new options JSON. Selecting parameters may affect further customization options. Then, re-render the form with updated options.
- We recommend keeping parameters selected by your users. We suggest storing them as data- attributes of the URL element in your CMS for future use.
- To retrieve an updated embed code, or when you need to refresh URL's cache, repeat API calls to Iframely with the user-selected options as API query-string parameters.

This flow doesn't require the use of [Hosted iFrames](/docs/iframes) and will work just as well if you opt for native embed codes from the publisher (retrieve options only via API requests in that case).

However, suppose you choose to use our iFrames as a WYSIWYG preview. In that case, you can append the query string to iFrame's src and get an updated preview right away (and your CMS can, later on, retrieve the actual optimized embed codes for that URL and parameters, hosted iFrames or native).

## Rendering options form

> Spoiler: Iframely also offers `options.js` script with handy render helpers. Skip to next.

### Mapping parameters to input types

Mapping parameters to HTML inputs should be reasonably intuitive and follow HTML naming specs for the attributes. Here're some less apparent considerations:

- We recommend a radio group instead of a select box if there are less than three choice options in suggested `values`.
- You may go as far as to have an "inline" one-line radio group if the labels of the values are short.
- If the current `value` of text input is an integer, you might consider input type `number`.
- Text inputs will also help `placeholder` attribute to hint your users.
- For range sliders, use the `min` and `max` of a `range` object of an option.

### Before you render

Make sure you understand the following caveats.

- Iterate through `options` keys, but don't forget to skip the reserved `query` key.
- Store the initial state of `options` the first time you receive it. This way, you won't need to send us the default values if the user changes the form back to defaults.
- Not only options are unique for each provider. They also depend on URL content itself, as well as on previously selected options.
- Therefore, please change the request's query-string and re-render the form when your user updates any option. A new option may become available, or some older ones become disabled.
- If you use our iFrames for WYSIWYG previews and append the parameters as query-string to its `src`, don't forget to run an API request with the same query-string before publishing the codes to the end-user. This way, you'll get an optimized and production-ready HTML with proper sizing and other attributes.
- As the form is on your side (we only suggest `options`), you control which parameters to use. For example, you might skip all options that do not start with `_` as these are options for Iframely-powered interactives. Say, [card=1](/docs/parameters#card=1) when we return a card.
- Labels internationalization is out-of-scope, at least for now. To translate labels on your end, see the suggestion in the next section.

Not every URL will declare customization options. The `options` will be undefined for such URLs. iFrame event will always be triggered, even with `null` options, if only to clear the previous form.

> We'll be happy to add more customization options if we miss any you need. Ping support.

### An exception to options mapping

Last but not least, there is an edge case:

```json
media: {
	value: "",
	values: {
		"1": "Just the image"
	}
}
```

We ask that you treat all such single `values` as a checkbox, and if it's checked - send the actual value to us. If unchecked - skip that parameter altogether.

## Render a form with options.js

Iframely offers the `options.js` script that takes an `options` object and outputs HTML code that you can contextually add to your text editor. Use it as-is, or customize, or just take a look as the implementation reference.

[See it on GitHub](https://github.com/itteco/embedjs)

### Source options.js

`options.js` is an extension of our [embed.js](/docs/embedjs) script and can be sourced from our CDN as [iframely.net/options.js](https://iframely.net/options.js). Or you can get it [on Github](https://github.com/itteco/embedjs) and adapt/host yourself.

Please add `embed.js` to your page before you load `options.js`.

### Register URL options

If you use [hosted iFrames](/docs/iframes) with [Content IDs](/docs/ids), you can start by listening for a message from them:

```javascript
iframely.on('options', function (widget, options) {
	// register options to the context, perhaps invisible
	// set any context ID - you'll need it next
	// when user clicks for the context edit menu
	// show form, using the next method
});
```

Or simply register options when you get it in an API response in a similar way.

### Build options form

When it's time to build and show the form, call:

```javascript
iframely.buildOptionsForm(id, formContainer, options[, translator]);
```

- `id` - any id, likely unique to URL. Used to remember default options and is echoed back when options change.
- `formContainer` - HTML DOM Element where the script will add form's HTML to.
- `options` - options JSON you received from Iframely, either as iFrame message or API response.
- `translator` - optional translator function that takes a label and returns a new string. You can use built-in `iframely.optionsTranslator('fr')` (with user's language) or create your own. The built-in function, however, requires building `options.js` with additional JSON files with the translation of known labels to your user's language.

### Act on option changes

options.js will add HTML and event listeners for inputs. You'll get notified when user changes options in the following way:

```javascript
iframely.on('options-changed', function (id, formContainer, query) {
	// id and form container are echoed from the build request
	// query contains key: value object with the modified options (excluding the default ones, if user undid the previous choice)
	// keep query string here,
	// update iFrame src for WYSIWYG
	// or request new embed codes by repeating API requests
	// then build the form anew, as the options are conditional and may have changed
});
```

### Customize the script

The default options.js package has predefined HTML templates. You may customize them via CSS on your end, or change the templates in the library and build anew. [Here are the templates](https://github.com/itteco/embedjs/tree/master/src/options/templates).

The included translator function (`iframely.optionsTranslator`) takes the translation strings from JSON mapping for all known options.

To add new languages, add more JSON files to the build.
Here's the [JSON template](https://github.com/itteco/embedjs/tree/master/src/options/lang/labels.LAN.example.js) and example [for French](https://github.com/itteco/embedjs/tree/master/src/options/lang/labels.fr.js) (Pull-request with more translations are welcome).

