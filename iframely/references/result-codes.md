---
title: "Iframely result codes and error handling"
description: "Here's the error codes you might receive from Iframely"
source: https://iframely.com/docs/result-codes
---

# Result codes, error handling

If all goes well, Iframely responds with HTTP status code `200` and URL data. For problems with the URL or with your account, Iframely returns an error status in `4xx` range and a text message:

```json
{
	"status": "403",
	"error": "Valid api_key is required to access API"
}
```

Depending on your [app's settings](/settings/about), Iframely can also reiterate `status` as the HTTP status code of API response.
By default, Iframely mutes such HTTP errors.
You always get HTTP code `200` instead as an "OK" signal about the API status itself.

> Please handle all `4xx` result codes: these are valid responses and need to be cached.

## Issues with requested URL

### `404`

The destination URL is no longer available at the origin. Provider replied with `404` or `5xx` error, or there was a problem establishing a connection to the destination server.

### `410`

"Gone". Similar to `404`, but for URLs that were previously available but now return HTTP errors. You can remove obsolete URL data from your system now.

### `403` or `401`

For private pages that Iframely could not reach for processing. Or if the robots directive on the page prevents Iframely from parsing it.

### `415`

"Unsupported media types". For example, ISO-2022 encoding or direct links to JavaScript files are not supported.

If we see unrendered server templates, we may raise a `415` code for React or Angular origin servers. You users don't need to see it in URL meta.

### `418`

Originally the code `408`, we changed it not to cause any issues in your reverse proxies. We raise "timeout" code when an origin server takes too long to respond.

By default, Iframely expects origins to finish responding within 10 seconds. Iframely will wait 10 mins before re-trying such timed-out URLs again to give the troubled origin server some time to recover.

### `417`

Any other response with a non-`200` status or other connection issue will get a status `417` raised by Iframely.

In that case, we will also add the `:status` property to the response with actual HTTP/2 status code we received:

```json
{
    "status": 417,
    "error": "Iframely could not fetch the given URL. 503",
    ":status": 503
}
```

If there was a connection issue, the response will include `:error` property instead of `:status`. The property will contain any of the Node.JS TCP, SSL and HTTP or HTTT/2 [error code literals](https://nodejs.org/api/errors.html#nodejs-error-codes). 

```json
{
    "status": 417,
    "error": "Iframely could not fetch the given URL. ECONNREFUSED",
    ":error": "ECONNREFUSED"
}
```

Most frequent errors are `ENOUTFOUND` (of "not found" if raised by us), `ETIMEDOUT`, `ECONNREFUSED`, `ECONNRESET`, `EPROTO`, `EAI_AGAIN`, `EHOSTUNREACH`, `ERR_INVALID_URL`, `ERR_SSL_*`, `ERR_INVALID_HTTP_TOKEN` and more.

## Your account or API settings

### `403`

If the API request cannot be authorized:

- An API key isn't valid.
- An account is not in good standing.
- Your settings do not allow an origin of the API call ([about blocking referrers](/docs/allow-origins)).

### `417` - "expectation failed"

Iframely will also respond `417` when a URL was ignored based on user list or other settings. 

- Returned if you opted to ignore URLs that do not yield [third-party rich media](/docs/embeds) or an Iframely interactive.
- When explicitly block specific publisher domain via your API settings (see below).

As Iframely is constantly evolving, we may need to introduce other additional codes from time to time. Please let us know if you requre any help with interpreting our results.

> In an unlikely event that you received a `5xx` HTTP error, please [let us know](mailto:support@iframely.com) right away to address our server-side problem.

