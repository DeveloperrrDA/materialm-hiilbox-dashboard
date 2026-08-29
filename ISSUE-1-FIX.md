# Issue 1 — Headless donation success redirect

## Root cause confirmed across frontend + backend

The Next.js checkout handled `redirect_url` before checking whether the payment had already completed. A WooCommerce wallet gateway may return its normal WordPress order-received/thank-you URL even after synchronously marking the order paid. The browser therefore left the headless frontend and entered the legacy WordPress/GrowFund redirect path, where the donor could see “Donation not found”.

## Frontend fix

`app/checkout/page.tsx` now follows a gateway redirect only while `payment_status !== "paid"`. A paid order goes directly to `/donation-success?order=...&key=...`, and the success page securely reloads the WooCommerce order using its order key.

## Backend fixes required with this frontend

Use the accompanying patched backend package from this work session. It:

- makes paid-order -> GrowFund donation synchronization complete before `/orders/{id}/pay` returns;
- resolves both `_growfund_donation_id` and `_growfund_contribution_id`;
- restores `GET /donations/{id}`;
- fixes the incorrect donation route callback names.

## Deployment

Deploy the backend and frontend changes together. Do not deploy only the earlier backend patch and leave the old frontend checkout behavior in production.
