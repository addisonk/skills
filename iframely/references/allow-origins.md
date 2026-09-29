---
title: "Keep your Iframely API keys secure"
description: "Control origins that have access to your Iframely account, activate CORS and CSP"
source: https://iframely.com/docs/allow-origins
---

# Keep your API key secure

Iframely authorizes API access using API key tokens. You can create multiple keys and disable/pause them at any time. It is your responsibility to keep your API keys secure.

Iframely has different factor authorization mechanisms depending on how you use your API keys. There's a full API key value, that is meant for server-server communication (also known as "private" key). There is also an API key hash value that you can use in client-facing applications (also known as a "public" key).

Manage your API keys and their restrictions [in your dashboard](/settings/keys). If your key is client-facing, or for [iFrames](/docs/iframes) and thumbnail images, you can restrict referring domain origins.

## Private server access

A private API key (`&api_key` parameter) is meant to make API calls from your server to our servers via [Iframely API](/docs/iframely-api) or [oEmbed API](/docs/oembed-api) endpoints. That is assumed to be a private communication, though the onus is on you to keep the API key safe. If the breach does occur, we recommend generating a new key to replace it right away.

If your not sure about your server API key privacy, you may also set and send us an extra secret HTTP header to authorize API calls. In your key details, enter a HTTP header name and allowed value of your choosing. Iframely will check headers in API calls with your `api_key` and raise `403` response if header is incorrect or not present.

## Public client access

When you make API calls from a client-facing JavaScript, you want to secure your API key.

For this purpose, instead of the private `api_key` parameter that is intended for the server-server calls only, use the client `key`. It should be the MD5 hash value of your actual API key. You can find it on your [keys page](/settings/keys):

  

Unless you use [Content IDs](/docs/ids), we also include that client `key` parameter as the `src` attribute of [Iframely iFrames](/docs/iframes).

This way, no end-user will see your private API key. Only a public client hash value may be exposed to users and can be sure it is used in the client context only. It will allow you to control traffic with that key, allowing only certain referring origins.

If you use [Custom CDN](/docs/cdn), please make sure you configure the `origin` header to be passed through to Iframely.

## Configure allowed origins

> We advise against reconfiguring production API keys as it is likely to cause disruptions. Instead, we recommend adding a new restricted API key. This way, you can test before launching and retire the old key when it is no longer in use.

  

- Select the key from the list to edit it and find the "Activate origin check. Allow these domains only" checkbox.
- In the text area below the checkbox, list the domain names of your sites, one per line.
- You can use a wildcard for subdomains such as`*.yourdomain.com`. Beware though, wildcard will allow only the subdomains. Make sure to include your root domain separately if you need it.
- `www.yourdomain.com` and `yourdomain.com` are two different domains in terms of security. Include `www.` if required.

> Your changes may take up to an hour to propagate through our CDN. Any errors in security headers will stay in the cache for that hour. Make sure you know what you're doing.

Beware of nested browsing context. When our iFrame is in your own iFrame on host A, and you load them both onto your site B, then both A and B domains need to be white-listed.

If the "Activate origin check" checkbox is off, all domains are allowed.

## Technically speaking: CORS and CSP

This is what happens when you activate your domain allowlist:

- `frame-ancestors` HTTP header for Content-Security-Policy is added to Iframely-hosted iFrames. Internet browsers display such iFrames only on the allowed domains and show an error elsewhere.

- Iframely API endpoints start checking the `origin` HTTP header. If the origin isn't on your list, API call is rejected with the error `403` and no cross-origin resource sharing is allowed.

- If an `origin` isn't present at all in a client call, we can also raise error `403`. Please turn the "Require an origin" option on.

> However, Iframely will keep allowing your API calls without an origin when you send your full private API key as `api_key` parameter. We assume it is a server-side API call.

You may skip the restriction for iFrames and thumbnail images and leave it only for data API endpoints.

