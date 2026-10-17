# StreetSpot Theme Studio checkout configuration

Theme Studio is available at `/themes`. Products, prices, and live Stripe Payment Links have been created in the StreetSpot Stripe account:

| Offer | Price | Billing | Stripe Payment Link |
|---|---:|---|---|
| Street Style Pack | $4.99 | One-time | https://buy.stripe.com/bJe6oJeAa51m9jCaLS1VK04 |
| Creator Themes | $9.99 | Monthly | https://buy.stripe.com/00wdRb2RsgK4anGbPW1VK05 |
| Brand Studio | $19.99 | Monthly | https://buy.stripe.com/7sY00lajU2TeeDWcU01VK06 |

Vercel environment variables were added for Production, Preview, and Development:
- `NEXT_PUBLIC_STRIPE_THEME_STREET_STYLE_URL`
- `NEXT_PUBLIC_STRIPE_THEME_CREATOR_URL`
- `NEXT_PUBLIC_STRIPE_THEME_BRAND_STUDIO_URL`

The Premier Pin checkout links were also recreated without a free trial, to honor StreetSpot's immediate-paid-tier policy:
- Bronze $9.99/month: https://buy.stripe.com/7sYdRb77I9hCdzSf281VK07
- Silver $24.99/month: https://buy.stripe.com/bJe7sNcs28dy3ZibPW1VK08
- Gold $49.99/month: https://buy.stripe.com/14A8wR77IdxScvObPW1VK09

## Important payment-verification limitation

Checkout can collect payments, but StreetSpot still does not have a verified server-side payment webhook and account entitlement flow wired to these purchases. The app intentionally does not grant paid benefits based on a browser redirect or local state. Do not claim a paid theme or Premier Pin is activated until the backend verifies the Stripe payment/subscription status. The success page instructs customers to keep their receipt and contact support for assistance.
