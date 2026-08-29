# Single campaign image fix

The campaign detail page now renders the normalized `campaign.image_url` directly with a native `<img>` element.

Why: campaign cards already prove that the normalized URL is valid. The remaining difference was the server-rendered `next/image` path on `/campaign/[id]`, which can behave differently for remote CMS/CDN assets. This removes that extra proxy/optimization layer while retaining responsive cover styling.

No checkout, payment, currency, or campaign API logic was changed.
