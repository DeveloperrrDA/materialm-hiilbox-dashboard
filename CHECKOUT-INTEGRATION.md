# Headless WooCommerce checkout

1. `POST /api/checkout/order` creates the order through `POST /wp-json/wc/v3/orders`.
2. `POST /api/checkout/pay` asks Growfund to process that existing order through `/orders/{order_id}/pay` and the registered WooCommerce gateway.
3. The browser never calls Sifalo and never receives WooCommerce/Sifalo credentials.
4. Wallet account input is sent only to the server-side Growfund payment bridge.
5. `/donation-success` reads a filtered order status using the order ID plus WooCommerce order key.

## Required server environment

- `NEXT_PUBLIC_WORDPRESS_URL`
- `NEXT_PUBLIC_WORDPRESS_API_URL`
- `GROWFUND_CLIENT_API_KEY`
- `WOOCOMMERCE_CONSUMER_KEY`
- `WOOCOMMERCE_CONSUMER_SECRET`
- `GROWFUND_DONATION_PRODUCT_ID` (defaults to 661 to match the current Growfund generic donation product)
- `GROWFUND_TIP_PRODUCT_ID` (recommended; if absent, the order proxy uses a fee line for the tip)

WooCommerce consumer credentials and the Growfund API key must remain server-only.

## Verification

`tsc --noEmit` passes. Full `next build` could not complete in the isolated environment because Next.js attempted to download its platform SWC package from npm and outbound DNS was unavailable.
