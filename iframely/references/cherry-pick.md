---
title: "Customize rich media embeds by adding query-string options"
description: "Fine-tune rich media embeds for each URL – customize captions, threads, and other provider-supported options directly in the embed link."
source: https://iframely.com/docs/cherry-pick
---

# Fine-tune embeds for each URL

Iframely supports various variants for each rich media embeds publisher. We offer per-URL [options editor](/docs/options) to help the authors choose the exact rich media variant they need for their particular post.

It all works with the query-string parameters added to API calls. For example, `_showcaption=true` for an Instagram post, or `_hide_thread=` for Twitter.

However, the options editor has to be integrated into the app by developers. To make it quicker and work out of the box, we also accept the same options if you manually add them as parameters to the query-string of your URL itself.

## Steps

- Bookmark and go to [iframely.com/try](/try);
- Enter your URL and request an embed;
- If rich media's provider supports configuration options, you'll see the form on the left of the preview;
- Choose the options you like for your URL;
- Once ready, hit the "Copy new URL" button;
- The options your cherry-picked will be included in that new URL;
- Go to your app, and post that new URL instead of the original for the exact rich media embed.

  

> At the admin's discretion, your app may disable that possibility in its provider settings.

