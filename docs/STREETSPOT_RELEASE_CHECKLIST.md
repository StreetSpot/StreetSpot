# StreetSpot release checklist

Updated: 2026-09-20

## Repository status

- Version: 0.1.0 from `package.json`.
- Framework: Next.js 16.1.6, React 19.2.4, TypeScript.
- Build: `pnpm build` passes after the repair.
- Paid services activated: NONE.
- New paid API keys: NONE.
- Paid infrastructure created: NONE.

## Android / Google Play

- Target SDK: API 36 is required in the external Android wrapper; this web repository cannot set Gradle SDK values.
- Package ID: `app.vercel.v0_street_spot_web_app.twa` (preserved in the web manifest/app-links configuration; verify against the signed wrapper before release).
- API 36 compatibility, edge-to-edge, predictive back, exported activities, signing, screenshots, and store listing remain wrapper/Play Console work.
- Web app assets include `/manifest.json`, `/icon-192.png`, `/icon-512.png`, and `/.well-known/assetlinks.json` (replace the placeholder certificate fingerprint with the signed release SHA-256 fingerprint before publishing).
- Register the existing package before September 30, 2026.
- Request only permissions actually used. The web app uses browser geolocation only after permission and does not run background GPS tracking.

## Public policy URLs

- Privacy: `/privacy`
- Terms: `/terms`
- Account/data deletion: `/delete-account`
- Support: `/support`
- Contact: support instructions are provided through `/support`.

The public deletion route currently provides an ownership-confirmed request flow. An authenticated, server-side delete/anonymize operation is NOT CONFIGURED because this repository has no connected auth/database implementation. Do not claim in-app deletion is complete until that backend exists.

## Data safety facts observed

- Browser location is requested for map centering only after browser permission.
- No background location watcher was found.
- No analytics dependency/runtime is configured.
- The repository contains client-side stores for prototype features; they are not durable account storage.
- No Stripe, AI, SMS, voice, paid email, or paid map service is activated.

## Maps and discovery

- Leaflet loads the free CARTO/OSM tile layer with attribution.
- Geolocation denial resolves safely without crashing.
- Demo New York vendor listings were removed from the production store; vendors now appear only when supplied by the active data layer.
- A connected production dataset is still required before claiming durable vendor discovery.

## Security and performance

- Security response headers include nosniff, HSTS, referrer policy, same-origin framing, permissions policy, and report-only CSP.
- Leaflet map cleanup removes the map on unmount; geolocation uses one-shot `getCurrentPosition` with a timeout and cache age.
- No uncontrolled polling, background job, paid provider, or external analytics was added.
- No Android Gradle project or `ad_popup` / `DownloadImageTask` source exists in this repository, so Glide/AGP changes cannot honestly be applied here.

## Manual remaining actions

1. Inspect the external Android project and preserve its package ID.
2. Set `compileSdk` and `targetSdk` to 36 with a compatible AGP/Gradle combination.
3. Verify WebView back navigation, cookies, geolocation, file uploads, external links, keyboard, safe areas, and Android 16 behavior.
4. Complete Play Console registration, data-safety form, content rating, privacy/deletion/support links, icon, screenshots, and signing.
5. Connect an authenticated database/auth provider before enabling durable account, messaging, private-event, claim, review, or deletion claims.
6. Run authenticated API/authorization tests after that backend is connected.

## Known limitations

This repository is a free-first web prototype with client-side stores and no Android wrapper. Authentication, server-side authorization, RLS, durable messaging, private invitations, and actual account deletion are not configured. No external credentials were invented.

## Release gate

Do not label the Android release Google Play compliant or production-ready until the external wrapper and backend checks above are completed and tested.

## Cost controls

No paid service, subscription, credit card, paid API key, or recurring job was created. No production deployment was intentionally triggered during this repair.

## Verification log

- `pnpm build` — PASS (Next.js 16.1.6; TypeScript and static generation completed).
- Browser verification — REQUIRED after the preview is available; use the project preview and test public routes and neutral map behavior.
