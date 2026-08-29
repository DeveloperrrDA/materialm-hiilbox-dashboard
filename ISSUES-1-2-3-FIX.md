# Headless checkout fixes: success flow, accounting, multi-currency

- Keeps confirmed payments in Next.js instead of following WooCommerce's legacy thank-you redirect.
- Adds checkout currency selection for configured USD, ETB, KES, SLSH and SOS currencies.
- Fetches supported currencies/rates through a server-side authenticated checkout proxy.
- Sends the donor-entered currency and local amount to the server.
- Converts local donation and tip to USD only on the server, using GrowFund's configured rate.
- WooCommerce receives USD line totals while the original values/rate are persisted as order metadata.
