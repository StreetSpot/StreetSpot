# StreetSpot release checklist

## Current state
- Version: 0.1.0 (repository package version)
- Framework: Next.js 16.1.6, React 19.2.4
- Target SDK: Not configured in this web repository. Android wrapper must set compileSdk/targetSdk 36 and preserve the registered package ID.
- Package ID: Not present in this repository; determine it from the existing Android/WebIntoApp project before registration.

## Public compliance URLs
- Privacy: `/privacy`
- Terms: `/terms`
- Account/data deletion: `/delete-account`
- Support: `/support`

## Verified in this repository
- Production build completes.
- Static privacy, terms, deletion, support, sitemap, and PWA manifest routes are present.
- Browser geolocation has no unrelated hard-coded fallback.
- No background location watcher is used.
- Analytics dependency/runtime was removed to keep the app free-first.
- Security response headers are configured in `next.config.mjs`.

## Manual Android/Play actions
- Configure the existing Android wrapper for API 36 and verify edge-to-edge/back behavior on Android 16.
- Confirm the existing application ID in the Android project; do not change it.
- Add 512px Play icon, screenshots, store listing, Data Safety answers, content rating, and support contact in Play Console.
- Register the package before the September 30, 2026 deadline.
- Test authentication, geolocation, external navigation, uploads, keyboard, and back navigation in the final WebView/TWA build.

## Known limitations
- This repository currently contains a client-side vendor demo store, not a connected production database/auth implementation.
- Account deletion is a public request flow until an authenticated backend deletion action is connected.
- Map/provider credentials and Android wrapper configuration are external to this repository.
- No paid services, billing, phone provider, push provider, or AI provider was activated.
