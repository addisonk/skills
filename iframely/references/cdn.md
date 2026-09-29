---
title: "Bring your own CDN"
description: "Get Iframely iFrames via your own CDN"
source: https://iframely.com/docs/cdn
---

# Bring your own CDN

You can have Iframely [iFrame helpers](/docs/iframes) served via your own content delivery network. Say, Amazon CloudFront, Cloudflare or others. Enterprise plan requires a custom CDN provided. We will reach out if that becomes an issue.

To have it configured, point your CDN distribution to our servers and give the address of your distribution to our support team. We will verify your setup and add your CDN to your account options.

After that, Iframely will start returning embed codes with your own CDN proxy that fetches white-labeled iFrames from our cloud and delivers it to your users.

If you [&omit_script](/docs/omit-script) and add [embed.js](/docs/embedjs) to your pages yourself, please load it off your custom CDN as well.

> You may also opt to self-host embed.js script. It is available [on GitHub](https://github.com/itteco/embedjs) and NPM.

## For any CDN provider

Basically, you need to map to the root of our domain, and let Iframely orchestrate your CDN's cache. The general requirements for any CDN are these:

- Point your distribution to `iframe.ly` domain.
- Forward us the `host` header so we recognize your CDN name.
- Cache based on the origin headers - we'll ochestrate TTL and `vary`.
- Match the HTTP/HTTPs protocol or choose HTTPs-only.
- Forward all the query-string parameters.

Select HTTP headers needs to be forwarded to origin to enable certain Iframely features:

- Forward `Accept` header so we can deliver [WebP](https://developers.google.com/speed/webp/faq) images and other progressive features.
- Forward `Origin` or `Referer` if you configure that as the action scope for a [user consents](/docs/consents#custom-cdn) button or if you activate any [API origin restrictions](/docs/allow-origins).
- Forward `Sec-CH-Prefers-Color-Scheme` client header if you want [auto dark/light themes](/docs/parameters#theme) for supported rich media publishers.

## Configure Amazon CloudFront

Create a new CloudFront distribution. For it, configure the following general settings that are required by Iframely:

- Delivery method: `web`.
- Origin domain name: `iframe.ly`.
- Origin path: leave empty.
- Forward headers: `whitelist`, add header `CloudFront-Forwarded-Proto`. Otherwise, we won't be able to tell if a request comes via SSL or not. Also add `host`, `origin` and `referer`.
- Object caching: `use origin cache headers`.
- Forward Query Strings: `yes`.
- All the other fields can be left with default values.

You may create custom CNAME subdomain from your main domain that points to CloudFront distribution if you like, but don't forget to get a custom SSL certificate from Amazon in that case as well.

## Configure Cloudflare

You can either create a subdomain for your existing Cloudflare site, or register a custom root-level domain and add it to Cloudflare separately.

- In DNS, create subdomain as the `CNAME` record and point it to `iframe.ly`. You can safely use `CNAME Flattening` setting to make DNS resolution a bit faster for your users.
- In Caching, make sure the following settings are applied:
  - `Browser Cache TTL: Respect Existing Headers` - Minimum cache TTL will depend on your Cloudflare plan.
- In Rules/Page Rules, create a rule for `yourcdn.yourdomain.com/*` (use your own domain) and add these two settings:
  - `Cache Level: Cache Everything` - it makes Cloudflare cache everything, including text/html resources too.
  - `SSL level: Full` - Iframely needs to know that requests come over SSL.

> Iframely needs all query string parameters. If you need other Cache Control values elsewhere on your domain, then you will not be able to set CDN as subdomain.
> You will have to register a separate domain for your custom CDN with Iframely, as our iFrames don't work without query strings.

- Don't forget to activate SSL in Crypto section if you need HTTPs connections.

## Contact us to finalize

Once you've configured your CDN, [send us](mailto:support@iframely.com) your CDN domain name. We will verify that everything is right and configure it as domain name for your Iframely iFrames.

> If you use User Consents feature, you may also need to allow `referer` and `origin` headers, depending on your configuration. [Read here](/docs/consents#technical-configuration). The `origin` header may also be required for your [API key security configuration](/docs/allow-origins).

