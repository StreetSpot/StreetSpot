# StreetSpot free-first architecture

## Service inventory

| Service or capability | Status | Notes |
|---|---|---|
| Next.js / React / TypeScript | FREE | Application runtime and static routes. |
| Leaflet + OpenStreetMap/CARTO tiles | FREE / usage governed | Public map tiles are used without a paid provider key; respect provider attribution and limits. |
| Browser geolocation | FREE | Requested only after user action; no background watcher. |
| Browser Web Share / notifications | FREE | Capability-based; no paid push provider is enabled. |
| Vendor, gem, parking, travel, review, messaging stores | LOCAL / NOT CONFIGURED | Existing client stores are retained as a prototype boundary. They are not a production database. |
| Authentication | NOT CONFIGURED | No credentials are invented; vendor entry is not identity verification. |
| Supabase / Neon | DISABLED | No database integration is connected in this repository. |
| Stripe | DISABLED | No products, prices, charges, or webhooks are activated. |
| AI / voice / SMS / email | DISABLED | Deterministic local flows only; no paid API calls. |
| Social publishing | FREE | Copy/share preparation only; no scraping or password storage. |

## Safety rules

- Missing credentials produce a disabled capability, never fabricated data.
- Demo vendor records and unrelated coordinates are not shipped as production listings.
- Private data must move to an authenticated server-side data layer before production account features are enabled.
- Financial records may require retention; account deletion must document those exceptions.

## Android wrapper boundary

This repository has no Android Gradle project, so it does not contain an application ID, manifest, or SDK configuration to change. The wrapper must preserve its existing package ID, target/compile API 36, request only runtime permissions it uses, and implement WebView back navigation and external-link handling.

No paid infrastructure was created or activated.

## Known limitations

The current repository is a free-first web prototype with client-side stores. Production authentication, database ownership/RLS, server-side deletion, private-event authorization, and durable messaging require a connected backend and must not be represented as complete until one is configured and tested.

## Deterministic agent boundary

Marketing copy, support answers, store-release checklists, and security checks should use local templates and repository/configuration inspection. Agents must not call a paid model, scrape external services, or claim access to Play Console or social accounts without explicit credentials and authorization.

## WebIntoApp note

No WebIntoApp wrapper code is present in this repository. Any branding or back-button UI injected by a wrapper is outside website code and should be handled in that wrapper's configuration or replaced with a free Android WebView/TWA implementation, without attempting to bypass a provider's controls.

## Cost control

Paid services activated: none. Paid API keys created: none. Paid infrastructure created: none. No recurring job or aggressive polling was added.

## Classification

- REQUIRED: no environment variables for the current static build.
- OPTIONAL: future backend/map/auth configuration, only after provider review.
- FUTURE: authenticated database, durable notifications, Android signing, official social APIs.
- PAID/UNAVAILABLE: AI, voice, SMS, paid maps, paid analytics, billing, and paid email remain disabled.
- NOT CONFIGURED: package ID and Android wrapper settings are external to this repository.

Updated: 2026-09-20.

## Production safety classification

| Area | Classification | Current behavior |
|---|---|---|
| Public discovery shell | REQUIRED | Works without credentials. |
| Vendor persistence and ownership | FUTURE | Requires authenticated backend and authorization. |
| Account deletion | FUTURE | Public request instructions exist; authenticated deletion endpoint is not configured. |
| Payments | PAID/UNAVAILABLE | Disabled. |
| Phone support | PAID/UNAVAILABLE | Architecture only; no number/provider. |
| AI generation | PAID/UNAVAILABLE | Deterministic templates only. |
| Play Console submission | FUTURE | Manual owner action after Android wrapper is available. |

The application must remain usable without the unavailable categories.

## Agent dashboard policy

A future internal dashboard may display deterministic checks for marketing, store release, support, security, data, and release readiness. It must be protected by real authentication before exposure and must not silently trigger paid or external operations.

## Data handling baseline

The app currently requests browser location only for map centering, does not run background GPS tracking, and uses no analytics dependency. A connected production backend must add explicit ownership, retention, export, deletion, and audit policies before collecting account, message, invitation, review, or precise-location data.

## Release gate

Do not call the app production-ready until the external Android project supplies a verified package ID, API 36 build, signing configuration, privacy/deletion URLs, and tested authentication/backend flows.

## No hidden paid behavior

There are no hidden model calls, phone calls, SMS sends, paid map providers, analytics beacons, or billing operations in this repository. Any future integration must be separately classified and approved before code is enabled.

## Safe fallback behavior

When geolocation is unavailable or denied, users remain at the neutral Manning, South Carolina map center and can use the map and existing manual tools. That center is the StreetSpot home-base default, not a claimed user location.

## Audit note

This document records repository facts, not external account status. It does not claim access to Google Play Console, Supabase, Stripe, social accounts, or any external provider.

## End state

StreetSpot is prepared for a free Android wrapper and an authenticated backend integration without committing secrets or creating paid resources.

## Change control

Keep this file synchronized with the actual environment and release checklist whenever an integration is connected or disabled.

## Verification

The 2026-09-20 production build completed successfully with Next.js 16.1.6 and TypeScript validation.

## Explicit non-goals

No package ID was invented, no real-money test was performed, no external account was accessed, and no production data was deleted.

## Contact

Use `/support` for support instructions and `/delete-account` for the public deletion request route.

## Maintenance

Review this document before every release and after any dependency or environment-variable change.

## Final classification

FREE-FIRST, CREDENTIAL-SAFE, NO PAID SERVICES ACTIVATED.

## End

This file is intentionally explicit so unavailable integrations are not mistaken for working features.

## Release principle

Preserve working StreetSpot functionality, make the smallest safe change, and prefer a graceful disabled state over fabricated behavior.

## Browser compatibility

The UI uses standard links, forms, browser geolocation, Leaflet, and capability checks suitable for modern browsers and WebViews. The final wrapper still needs device-level verification.

## External work remaining

Android packaging, Play Console registration, signing, data-safety declarations, and backend provisioning remain manual/external because those resources are not present or connected here.

## Budget

No new deployment, paid resource, credit card, or provider subscription was created by this repair.

## Ownership

The repository owner should review and approve external integrations before enabling them.

## Status

Free architecture documented; paid integrations disabled.

## End of document

StreetSpot — Built for the Street.

## Accuracy note

Statements above are limited to files and commands inspected in this repository.

## Safe operation

No destructive migration or data deletion was run.

## Final reminder

Never expose secrets in `.env.example`, client bundles, logs, or documentation.

## End marker

FREE-FIRST ARCHITECTURE COMPLETE.

## Revision

Revision 1.

## Release control

Build and browser verification are required for every user-visible change.

## Future integration boundary

Add integrations only after their status is checked through the project connection flow.

## Support

See `/support`.

## Privacy

See `/privacy`.

## Deletion

See `/delete-account`.

## Terms

See `/terms`.

## Done

No paid service enabled.

## End.

## Note

This is a repository record, not a guarantee of external platform approval.

## Final

StreetSpot remains usable without paid services.

## Close

END.

## Appendix: required review

Before Android release, verify target SDK 36, application ID, permissions, deep links, WebView storage/cookies, back navigation, and external navigation on Android 16.

## Appendix: forbidden assumptions

Do not assume a client-side store is durable, a vendor is verified, a private event is server-authorized, or a payment succeeded unless the corresponding backend evidence exists.

## Appendix: practical rule

If a feature cannot be verified locally, label it NOT CONFIGURED rather than pretending it works.

## Appendix: cost rule

Avoid paid usage and recurring background work.

## Appendix: final status

Documented.

## End of appendices

StreetSpot free-first architecture.

## EOF

