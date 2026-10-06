# StreetSpot release status

Updated: 2026-10-05

## Repository facts

- Web app: Next.js 16, React 19, TypeScript; package manager lockfile: pnpm.
- Canonical public site: https://streetspotapp.com
- Support: https://streetspotapp.com/support and support@streetspotapp.com.
- Public policy routes: `/privacy`, `/terms`, `/delete-account`, `/support`.
- Browser-only feature stores are not a durable, authenticated database.
- The vendor-name form is not account authentication or ownership verification.
- Google Sign-In is not implemented in this repository. No Google OAuth callback or credentials are configured.
- Stripe-hosted plan links exist, but no payment webhook or server-side subscription verification is implemented. A return to `/success` does not activate a plan.
- The local claim catalog and browser claim requests do not establish verified ownership. The Supabase claim API requires a configured backend; ownership approval remains disabled until its database transaction is implemented.
- Automated account deletion is disabled until the backend data-ownership map and deletion policy are configured; the public page provides a support contact and browser-data guidance.
- beehiiv is not connected; there is no newsletter signup or campaign API in this repository.
- Agent coordination is local and deterministic; it has no Play Console, ad, analytics, social, email, or production account access.

## Android / Play Store

No Android Gradle project, package identifier, signing config, Digital Asset Links file, or Play Console integration exists in this repository. This source tree cannot change a separately packaged Android application or verify Play Console declarations.

Before a store release, confirm the Android package and target SDK against the current Play Console requirements, signing, permissions, WebView location behavior, back navigation, external links, and data-safety declarations in the Android project. Use the policy URLs above in the store listing. Do not publish an asset-links file without the actual package ID and release signing fingerprint.

## Deployment and external services

The app can be hosted on Vercel and uses `streetspotapp.com` as its canonical metadata and sitemap host. The deployment and Cloudflare DNS/TLS configuration were not inspected through external accounts. Confirm the custom domain is attached to the existing deployment and that HTTPS resolves before representing the site as live there.

Supabase server routes require `NEXT_PUBLIC_SUPABASE_URL` and the server-only `SUPABASE_SERVICE_ROLE_KEY`. No credentials are present in the repository. Do not set the service-role key with a `NEXT_PUBLIC_` prefix.

No beehiiv credentials or publication ID are configured. Configure them only in server-side deployment settings after a publication is available; newsletter signup and campaign operations are not active in this build.

## Local validation

Run `pnpm lint` and `pnpm build` after dependencies are installed. This repository currently has no test or standalone typecheck script. Android device tests, Play Console checks, Cloudflare settings, Supabase authorization, and Stripe checkout verification require their respective external projects/accounts.
