# StreetSpot private-event purchase and conversion test plan

Date: 2026-10-19
Scope: private-event packages and analytics; no live payment was initiated.

## Events instrumented
- `event_package_selected`: package card clicked; property `tier` only.
- `event_checkout_started`: signed-in host proceeds to Stripe; property `tier` only.
- `event_package_available`: a package returned by the authenticated purchases endpoint after webhook-backed recording; property `tier` only.
- `invitation_style_selected`: style choice clicked; property `style` only.
- `private_event_created`: private event API returns success; properties `tier`, `guest_count`, and `invitation_style` only.
- `private_invitation_opened`: guest invitation token successfully resolves to an event; property `style` only.

Vercel Analytics is wired to receive the events. GA4 will receive the same events only when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is configured to a real GA4 measurement ID. No measurement ID was found in the current Vercel project variables, so GA4 collection is not yet active.

## Safe checks
- Public host-studio route should return HTTP 200 without redirecting to the operations-agent login.
- Unauthenticated purchase-list request must be rejected.
- Event creation without a valid auth token and verified unused purchase must not create an event.
- Stripe webhook must reject missing or invalid signatures.
- Valid signed test-mode `checkout.session.completed` must create exactly one unused purchase, even if the same event is delivered twice.
- Guest limits must be enforced server-side for 1, 50, and 200 guest packages.
- Guest invitation token must resolve only the selected invite, expire after 30 days, and not expose private venue coordinates through public listing APIs.

## Payment-test limitation
The connected Stripe account surfaced to the integration is live-mode only, and the existing private-event checkout links are live Stripe Payment Links. Do not click through or submit a card as part of this test. A true positive payment test requires a Stripe test-mode Payment Link and test webhook secret configured in a non-production environment, or a dedicated test Stripe account. Live purchases/refunds are not a substitute for a test-mode E2E test.

## Remaining validation
- Confirm Stripe payment-link IDs match the webhook's tier mapping.
- Confirm Vercel production webhook is configured to deliver the supported event types and that Supabase's private webhook configuration secret matches `STREETSPOT_STRIPE_SYNC_SECRET`.
- Run a positive signed test event in test mode, verify one purchase row, replay it to prove idempotency, then create a test private event and verify guest access and expiry.
- Verify custom events appear in Vercel Analytics after a real user flow; verify GA4 only after configuring the actual measurement ID.
