export const config = {
  wordpressUrl:
    process.env.NEXT_PUBLIC_WORDPRESS_URL ||
    "https://cms.hiilbox.com",

  apiBaseUrl:
    process.env.NEXT_PUBLIC_WORDPRESS_API_URL ||
    "https://cms.hiilbox.com/wp-json/growfund-currency-manager/v1",
};