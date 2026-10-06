# StreetSpot architecture and integration status

## Existing application

StreetSpot is a Next.js App Router web app using React, TypeScript, Leaflet, and browser-side stores. Its public routes include discovery, support, privacy, terms, deletion instructions, and a payment-return page. There is no Android project in this repository.

Vendor, community spot, favorites, messaging, review, parking, travel, and premium state are currently stored in browser memory or local storage. They are not multi-user durable records. Supabase server API helpers exist for claims, messages, and deletion, but no Supabase URL/service-role credential or database schema is supplied here. Those APIs are unavailable until correctly configured.

## Location and listing integrity

Map markers use only listing coordinates that pass geographic range checks. A listing or event with real coordinates is used to initialize the map; otherwise a user may explicitly choose the locate control. With neither, the map remains neutral and requests no location permission automatically. Spot creation and vendor go-live request location only after the user initiates those actions.

Community-created listings and claim requests remain browser-local. A claim request is marked `PENDING_VERIFICATION`; it does not transfer ownership. The authenticated Supabase claim endpoint can record pending claims and administrative rejections. Approval is deliberately disabled until the database can perform an atomic claim-and-ownership transaction. Do not describe an unreviewed listing as verified or seed invented businesses or coordinates.

## Main Agent and specialists

`lib/agents/index.ts` contains an in-process task coordinator, shared agent registry, scoped specialist IDs, and in-memory job tracking. Specialists cover Play Store readiness, Console/compliance preflight, Marketing/Growth, Advertising, Media/Content, Store Management, Support, Analytics/Data, and beehiiv newsletter preparation.

This is deterministic application architecture only. It makes no model/API calls, external account requests, campaign launches, spend, publishing, or production writes. Jobs reject secret-like input and block production-sensitive tasks because no trusted authorization service or external executor exists. Since no application route exposes the coordinator and no specialist has external access, it must not be presented as a connected autonomous agent service or as evidence that an external operation occurred.

## External integrations

- Canonical public domain: https://streetspotapp.com.
- Support: https://streetspotapp.com/support; support@streetspotapp.com.
- Supabase: credentials/schema/RLS are not configured in this repository. Account deletion stays disabled until a complete data-ownership map and deletion policy exist; the public route provides support instructions only.
- Google OAuth: no Google Sign-In flow or OAuth callback is implemented.
- Stripe: existing hosted checkout links remain, but there is no webhook or verified subscription state. The site cannot activate a paid tier from a return URL.
- beehiiv: no publication credentials, signup endpoint, or campaign connection exists. Never expose its API key to the browser.
- Cloudflare: no API credentials or DNS settings are stored here. Domain routing, TLS, and email routing must be verified in Cloudflare Dashboard.
- Google Play and Android: package ID, signing, target SDK, Digital Asset Links, and Play Console declarations are outside this repository.

## Security and cost boundaries

No secrets belong in source control or browser bundles. Keep Supabase service-role and future beehiiv credentials in server-only deployment settings. External publishing, account deletion, ad spend, payment activation, and other production-sensitive operations require real authorization and verified provider responses. No new paid service or infrastructure is enabled by this repository.
