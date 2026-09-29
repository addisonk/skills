---
title: "Iframely embeds for Medium Insert Plugin"
description: "How-to guide to Medium Insert Plugin embeds"
source: https://iframely.com/docs/medium
---

# Configure Iframely for MediumEditor

You can use beautiful [MediumEditor](https://github.com/yabwe/medium-editor) with Iframely embeds via [Medium Insert Plugin](https://github.com/orthes/medium-editor-insert-plugin) by Pavel Linkesch and contributors.
Iframely team is the contributor on the project and we maintain the integration.

See [editor's demo here](http://orthes.github.io/medium-editor-insert-plugin).
It uses Iframely's public demo API endpoint that you need to change for production use.

## Configure Iframely API endpoint

To connect Medium Insert Plugin to Iframely, simply change the default endpoint to the one with your API key:

```js
<script>
  $(function () {
    $('.editable').mediumInsert({
      editor: editor,
      addons: {
        embeds: {
          oembedProxy: 'https://iframe.ly/api/oembed?api_key={your key here}'
        }
      }
    });
  });
</script>
```

You can add `&iframe=1` and other [optional query-string parameters](/docs/parameters) in `oembedProxy` endpoint.

Other plugin usage examples can be found in [project's GitHub](https://github.com/orthes/medium-editor-insert-plugin/blob/master/examples/index.html) repository.

