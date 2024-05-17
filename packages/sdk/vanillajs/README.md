# This is Not A Drill! Client SDKs -- Plain JS

<a href="https://this-is-not-a-drill.com"><img src="./packages/dashboard/public/ThisIsNotADrill_cutout.png" width="250" height="250"></a>

## Purpose

This SDK allows clients to install This Is Not A Drill! (TINAD) User Alerting and Notification Service, on any website.
You can simply add a script tag on any or all pages with your public API code.  An example script tag to display messages
as toasts might be:

```
<script 
  id="tinad-sdk"
  src="https://cdn.jsdelivr.net/npm/@this-is-not-a-drill/vanillajs-sdk@latest/dist/bundle.js"
  tinad-configuration=
'{
  "api": {
    "displayMode": "toast",
    "endpoint": "https://api.this-is-not-a-drill.com",
    "key": "`your_public_api_key`",
    "environments": [
      "Development"
    ],
    "domains": ["your-domain.com"]
  },
  "toast": {
    "position": "top-end",
    "duration": 5000
  },
}'
>
```

Learn about TINAD at [this-is-not-a-drill.com](https://this-is-not-a-drill.com)

Learn how to install the service by visiting the documentation at 
[docs.this-is-not-a-drill.com](https://docs.this-is-not-a-drill.com)

If you're looking for a React SDK, you can find that here:

* [@this-is-not-a-drill/react-core](https://www.npmjs.com/package/@this-is-not-a-drill/react-core)
* [@this-is-not-a-drill/react-ui](https://www.npmjs.com/package/@this-is-not-a-drill/react-ui)

