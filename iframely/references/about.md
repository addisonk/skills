---
title: "About Iframely robot"
description: "If you see Iframely parsers fetching your URLs, it's because an actual user has shared that URL on one of the apps that use Iframely as their back-end"
source: https://iframely.com/docs/about
---

# About Iframely robot

If you see Iframely parsers fetching your URLs, it's because an actual user has shared that URL on one of the apps that use Iframely as their back-end.
We are not a crawler: we don't follow links and only act on behalf of a human.

Iframely is a software-as-a-service for social app developers and news media publishers.
Our robots respond to links shared socially by end-users with the information we can find about your URL: title, description, thumbnail image, etc.

This data is then used by our customers to build engaging user experiences.
For news & media customers, we power up their content management systems with the ability to curate 3rd party media and embed it inside the news posts.

In other words, Iframely is a distribution and promotion vehicle for your web content. We extend your reach to thousands of news sites, blogs and social apps.

Iframely's robots fetch URLs with the following user agent (version and optional [name extension](/docs/webmasters#target-a-user-agent) may and will change):

```
Iframely/1.3.1 (+https://iframely.com/docs/about)
```

You are probably here because you found us in your access logs and you have questions or are curious. We are here to help and give more information.

## URL unfurling example

Here's an example of how we present your URLs and info that we look for:

  
    
  
  
    
  

## What our parsers see

Our parsers understand Facebook's [Open Graph](http://ogp.me/), [Twitter Cards](https://developer.twitter.com/en/docs/tweets/optimize-with-cards/overview/abouts-cards.html),
[oEmbed](https://oembed.com), Google's structured data and Iframely's own [rich media discovery protocol](/docs/publish).

If you have your website optimized for social sharing already - you're well presented on Iframely too.

To check how Iframely and other apps see your website, visit our debug tool:

[Iframely URL debugger](/debug)

## Minimizing your traffic

Our parsers try and fetch as little of the page as we can to extract meta tags about the content.
In most cases, they will leave the page as soon as they get the `<meta>` portion of it, without waiting or looking into full `<body>`.

If a page's tags refer to an image, video, or audio file, we will fetch that file as well to check its validity.
We use `head` requests or HTTP Range headers to only grab first few bytes of such content, not downloading entire files during validations.

If customer uses our [URL cards](/docs/cards) service to present your URLs' summary to their end-users, we will fetch the thumbnail images and cache it inside our CDN for extended period of time, reducing traffic to your site.

## Refreshing the content

Provided that your URL keeps being active on our network, our parsers may hit any fresh URLs as often as once per hour on the first day, significantly reducing traffic as the content becomes older, to about a once per month.

As per our [GDPR](/gdpr) guidelines and privacy policy, we purge all content's cache off our networks after three months of inactivity.

## Having a problem with Iframely?

Although our parsers are battle-hardened over the years in use, it is entirely possible, as the Internet is constantly evolving, that the robots are doing something they should not.
We are more than happy to add you to or remove from our ignorelist, work with you to improve parsing of your content, discuss alternatives to how we are accessing your site, or just answer any questions you have.
Please contact us at support at iframely.com.

## Allow Iframely robot on your network

If you have bot-protection in place, please add Iframely to your allowlist. Your CDN provider might already recognize us and provide controls to enable Iframely.
If not, or to allow Iframely on your own servers, we suggest two options:

- Allow our public IP addresses as listed. There are two lists available: [IPv4](/ips-v4) and [IPv6](/ips-v6). Please refresh your copy periodically to keep it up-to-date. You can automate to fetch from the linked files.
- If you do reverse DNS lookups, allow our domain. Iframely traffic will come from IPs that resolve to a subdomain of iframely.com.

Again, our user-agent string is `Iframely/1.3.1 (+https://iframely.com/docs/about)` and may be followed by an [app name extension](/docs/webmasters#target-a-user-agent). The user-agent version number may and will change.

You may debug your website on Iframely using our [URL Debugger](/debug) tool.

