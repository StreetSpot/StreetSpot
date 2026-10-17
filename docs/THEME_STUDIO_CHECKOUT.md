# StreetSpot Theme Studio checkout configuration

Theme Studio is available at `/themes`. Pricing currently displayed in the UI:
- Street Style Pack: $4.99 one-time
- Creator Themes: $9.99/month
- Brand Studio: $19.99/month

Before accepting payment, create the corresponding products/prices and Stripe Payment Links in the StreetSpot Stripe account, then set these Vercel environment variables for Production (and Preview if desired):
- `NEXT_PUBLIC_STRIPE_THEME_STREET_STYLE_URL`
- `NEXT_PUBLIC_STRIPE_THEME_CREATOR_URL`
- `NEXT_PUBLIC_STRIPE_THEME_BRAND_STUDIO_URL`

Each value must be the exact Stripe Payment Link for the matching product and price. The page intentionally disables checkout when a link is absent; do not point these variables at Premier Pin products. Configure renewal/cancellation terms for subscriptions and a one-time price for Street Style Pack in Stripe. Payment confirmation and account entitlements should be verified server-side before unlocking purchased assets; client-side theme selection alone must never grant paid access.
