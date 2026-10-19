# Stripe Checkout Session integration

This checklist covers the separate, test-only Checkout Session endpoint. The existing Payment Link checkout route and webhook are unchanged.

## Values to Replace

The endpoint intentionally refuses non-test secret keys. Do not use live credentials or live Price IDs while testing.

**Files containing placeholders / required configuration:**
- [app/api/billing/checkout-session/route.ts](app/api/billing/checkout-session/route.ts)
- [.env.example](.env.example)

| Field | Current Value | What to Set |
|---|---|---|
| `STRIPE_SECRET_KEY` | environment variable | A Stripe **test-mode** secret key beginning with `sk_test_`; configure it in the local environment or Vercel Preview, not in source code |
| `STRIPE_PRICE_VENDOR_BRONZE` | unset | Test-mode recurring Price ID for the Bronze vendor plan |
| `STRIPE_PRICE_VENDOR_SILVER` | unset | Test-mode recurring Price ID for the Silver vendor plan |
| `STRIPE_PRICE_VENDOR_GOLD` | unset | Test-mode recurring Price ID for the Gold vendor plan |
| `STRIPE_PRICE_THEME_STREET_STYLE` | unset | Test-mode one-time Price ID for Street Style |
| `STRIPE_PRICE_THEME_CREATOR` | unset | Test-mode recurring Price ID for Creator Themes |
| `STRIPE_PRICE_THEME_BRAND_STUDIO` | unset | Test-mode recurring Price ID for Brand Studio |
| `NEXT_PUBLIC_SITE_URL` | defaults to `https://streetspotapp.com` | Set only if testing against a different approved deployment URL |

Get Price IDs from the Stripe sandbox/test-mode product catalog: https://dashboard.stripe.com/test/products. Use IDs beginning with `price_`, not Product IDs beginning with `prod_` and not Payment Link URLs.

## Configured Parameters

**File:** [app/api/billing/checkout-session/route.ts](app/api/billing/checkout-session/route.ts)

| Parameter | Value |
|---|---|
| `ui_mode` | `hosted_page` |
| `billing_address_collection` | `required` |
| `phone_number_collection[enabled]` | `false` |
| `automatic_tax[enabled]` | `false` |
| `allow_promotion_codes` | `false` |
| `submit_type` | `auto` |
| `integration_identifier` | `hosted_mobile_app_0001` |
| `origin_context` | `mobile_app` |
| `payment_method_collection` | `always`, subscriptions only |
| `mode` | `subscription` for vendor plans and Creator/Brand Studio; `payment` for the one-time Street Style pack |
| `success_url` | `/success?session_id={CHECKOUT_SESSION_ID}` on the configured site URL |
| `cancel_url` | Returns to the plan page with `checkout=cancelled` |

## Setup and next steps

1. In Stripe Sandbox/Test mode, create test products and prices for the six plans above. The recurring plans must use recurring prices; Street Style must use a one-time price.
2. Add the test secret key and six test Price IDs to local environment variables or Vercel Preview environment variables. Never commit secret values or expose them with a `NEXT_PUBLIC_` prefix.
3. Sign in to StreetSpot, then POST JSON such as `{"plan":"street_style"}` to `/api/billing/checkout-session`. The endpoint requires the user's existing StreetSpot authentication. It returns a Stripe-hosted test Checkout URL; open that URL and use Stripe's test card `4242 4242 4242 4242`, any future expiry, and any three-digit CVC.
4. For subscriptions, test `bronze`, `silver`, `gold`, `creator`, and `brand_studio` with matching recurring test Price IDs. For one-time payment, test `street_style`.
5. The existing webhook recognizes vendor and theme session metadata. Ensure the Stripe **test-mode** webhook destination uses the matching test signing secret before expecting entitlements to update. A successful redirect alone is not proof of entitlement fulfillment.
6. Event-hosting purchases are intentionally excluded from this new Session endpoint because the existing webhook's Checkout Session metadata mapping does not yet fulfill event-hosting sessions. Keep using the existing event-hosting Payment Links until that path is separately extended and tested.
7. Before production use, implement an explicitly reviewed production-mode path; this endpoint currently rejects live secret keys by design.

## How it works

Authenticated StreetSpot users send a plan ID. The server selects a fixed allow-listed mode and Price ID environment variable, creates a hosted Checkout Session through Stripe's API, and returns the hosted URL. The secret key stays server-side. No client-supplied price, amount, mode, metadata, or redirect URL is trusted.

## Resources

- Stripe testing: https://docs.stripe.com/testing
- Stripe API keys: https://docs.stripe.com/keys
- Stripe Checkout Sessions: https://docs.stripe.com/api/checkout/sessions
- Stripe support: https://support.stripe.com
- Stripe MCP documentation: https://docs.stripe.com/mcp
