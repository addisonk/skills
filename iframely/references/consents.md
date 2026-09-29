---
title: "Iframely user consents for third-party rich media"
description: "Increase privacy by asking users to consent to third party media embeds"
source: https://iframely.com/docs/consents
---

# User consents for third-party rich media

Iframely gives you an option to request user consent before exposing them to third-party rich media embeds. Though we do not see it as required for [GDPR](/gdpr) you might want it to be on the safe side or for its intrinsic privacy value.

If you activate the feature, all rich media will be wrapped into [iFrame](/docs/iframes) hosted on our `iframely.net` domain or [your own CDN](/docs/cdn). If the user previously provided consent, we'll show rich media without delay. Otherwise, the consent form will wait for user input before loading third-party resources.

> We do not set cookies in the process. We rely on users' local storage and handle everything solely in their browser. Chrome 115 and later [partitions local storage](https://privacysandbox.google.com/cookies/storage-partitioning) for iframes. Iframely user consents are now unique for each hosting domain.

## Example of a consent form

## Set up your form

You can activate the consent form in your [settings](/settings/consents) or with the `consent=1` API parameter.
You may also [change the design](/design/consents) of the form in your settings.

### Action buttons

  

The form may have one or two buttons. The scope of the consents for the buttons can be one of the following:

- **Per media** - "Only this media". Users will consent once for that specific rich media embed.

- **Per provider** - "Always for {provider}". Users will scope the entire provider. For example, "YouTube", "Twitter", "Facebook", etc. We will put the provider name instead of the `{provider}` string. Once the user allows any of YouTube videos, all other YouTube videos will also be allowed.

- **Per page** - "Everything on this page". When users allow one media on a page, all other media on that page are also allowed.

- **Per site** - "Allow all media". Once the user allows media on your site, all media is allowed.

"Page" and "site" buttons may require some [technical configuration](#technical-configuration) of your web application.

If you configure the same button for both primary and secondary action, the form will have only one button.

### Texts

  

You can change all text on the consent form to your language or your liking. Please make sure your text fits into the available space. We'll use our default (English) texts if you leave the text fields empty.

Please keep `{provider}` if you want us to include a provider name into the button or anywhere in other texts.

## User settings page link

This is a link inside the widget to your page where you host Iframely [consents settings form](#user-settings-form) as described in the next section. The link to the consents settings form is optional, leave empty to skip it.

To activate the settings link in a widget, add your text and the link to _your_ page that embeds Iframely form.

## User settings form

User may need to undo the granted consents. For this purpose, we host a simple settings form for that purpose.

> Because Chrome 115 and later [partitions local storage](https://privacysandbox.google.com/cookies/storage-partitioning) for iframes per hosting domain, Iframely standalone user settings page will no longer work. You need to embed that form on the same user domain as Iframely media widgets.

- Settings page gives user access to their consents in browser's local storage. Two contexts must match for user to have the access to proper local storage partition: Iframely CDN and your referring origin domain.

- Add a dedicated page in your app to host the settings form. You can link to that page in your own documentation and can also add it [as link to media widgets](#user-settings-page-link).

- The settings form is hosted at `/consents` path of the CDN in use. If you use our default CDN, it [iframely.net/consents](https://iframely.net/consents). Please replace `iframely.net` with your [custom CDN](/docs/cdn) host, if use it.

```html
<div class="iframely-embed">
	<div class="iframely-responsive">
		<iframe
			src="https://iframely.net/consents?color={COLOR}&site={DOMAIN.NAME}"
			scrolling="no"
		></iframe>
	</div>
</div>
<script src="https://iframely.net/embed.js" async></script>
```

- `color` - the hex code of accent colour of actions on the page to match your branding (please, no `#` to keep URL valid);
- `site` - your domain name (we'll add "allow all" control for that domain name);
- `theme` - `dark` or `light`, if you want a specific theme. By default, adjusts to user's browser preferences.

Here is the consents form for our default CDN (iframely.net) and on this website (iframely.com):

## Technical configuration

If you want "Site" or "Page" scope for one of your consent buttons, the widget will need to have access to the `Origin` and `Referer` header.

The corresponding consent button will not show if the request headers are not present. You need to check your site's referrer policy and your CDN settings.

### Referrer-policy

Iframely needs a unique [Referer](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer) header for our iFrames as an identifier of your page. When users allow "all widgets on a page", we check against that as an identifier.

If your website works over HTTPs, it is the default user browser behaviour for cross-origin requests to send only the host value as the `Referer` header. A full path may have undesirable consequences for user security and privacy.

Therefore, `Referer` is the same for all your pages by default, and single consent will apply to your entire website.

To avoid that problem, please change your [Referer-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy):

```yaml
Referrer-Policy: unsafe-url
```

If the risk of a potential leak of private information is a concern, please consider against the use of the "Page" consent scope.

### Custom CDN

If use [your own CDN](/docs/cdn) with Iframely:

- Embed [User settings form](#user-settings-form) off that same CDN as the origins must match.
- If you want "Site" or "Page" consent buttons - allow your CDN to forward `Referer` and `Origin` headers to Iframely.
- Additionally, please ensure that your CDN set up listens and allows the `referer` and `origin` values as the cache-control `vary` field set by Iframely widgets.

