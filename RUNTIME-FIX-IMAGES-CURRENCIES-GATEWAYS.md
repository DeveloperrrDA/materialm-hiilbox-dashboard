# Runtime fixes: campaign images, currencies, gateways

- Campaign image normalization now supports image_url, featured_image_url, featured_image, thumbnail, image, JSON-encoded images, object-form images, and relative WordPress upload URLs.
- next/image allows cdn.hiilbox.com, cms.hiilbox.com, hiilbox.com, and www.hiilbox.com.
- Checkout currency normalization now accepts nested/array/object currency payloads and code aliases (`code`, `currency_code`, `currency`, `iso_code`). Supported checkout currencies remain USD, ETB, KES, SLSH, SOS.
- Optional server-only GROWFUND_RATE_<CODE> fallbacks can supply a rate if an older backend response omits a configured currency. Do not invent rates: 1 USD = X local currency.
- Checkout gateway discovery now calls the route actually registered by the plugin: /wp-json/gfcm/v1/checkout-gateways. Protected order payment still uses /wp-json/growfund-currency-manager/v1/orders/{id}/pay.
