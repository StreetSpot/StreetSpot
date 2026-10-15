# StreetSpot release status

Updated: 2026-10-15

## Repository facts

- Web app: Next.js 16, React 19, TypeScript; package manager lockfile: pnpm.
- Canonical public site: https://streetspotapp.com
- Support: https://streetspotapp.com/support and support@streetspotapp.com.
- Public policy routes: `/privacy`, `/terms`, `/delete-account`, `/support`.
- Browser-only feature stores are not a durable, authenticated database.
- The vendor dashboard's Start Preview action is local to that browser; public vendor listings come from the backend API, which now distinguishes an unavailable service from a successful empty result.
- The vendor-name form is not account authentication or ownership verification.
- Google Sign-In is not implemented in this repository. No Google OAuth callback or credentials are configured.
- Stripe-hosted plan links exist, but no payment webhook or server-side subscription verification is implemented. A return to `/success` does not activate a plan. The website no longer advertises a free trial; verify each Stripe Payment Link has trials disabled in the Stripe Dashboard before launch.
- Security audit on 2026-10-15: production dependencies report no known vulnerabilities after upgrading Next.js and applying transitive overrides. The full audit still reports one high-severity, development-tool-only `braces@3.0.3` advisory through `eslint-config-next` -> `fast-glob` -> `micromatch`; the registry reports no patched version. Recheck the upstream advisory before release.
- The local claim catalog and browser claim requests do not establish verified ownership. The Supabase claim API requires a configured backend; ownership approval remains disabled until its database transaction is implemented.
- Automated account deletion is disabled until the backend data-ownership map and deletion policy are configured; the public page provides a support contact and a confirmation-gated control that clears only StreetSpot-prefixed local/session storage in the current browser.
- beehiiv is not connected; there is no newsletter signup or campaign API in this repository.
- Agent coordination is local and deterministic; it has no Play Console, ad, analytics, social, email, or production account access.

## Android / Play Store

No Android Gradle project, Android manifest source, or native TWA source exists in this repository. The intended release path is **PWABuilder / Trusted Web Activity (Bubblewrap)**, not WebIntoApp. Confirmed Play Console identity from the latest account review: package `com.plainjane.streetspot`; active production version code `30400` (3.4); inactive version code `30500` (3.5). Any replacement must use a version code greater than `30500` (planned `30600`, version name `3.6`) and the existing Play upload key. The current `assetlinks.json` package and fingerprint match the reported Play App Signing certificate; this is intentionally different from the upload-key certificate used to sign the uploaded AAB.

### Existing Android artifacts inspected 2026-10-15

- The local backup ZIPs and extracted WebIntoApp wrapper contain signing keystores and plaintext credential/certification records; the readme also contains a WebIntoApp app key. `.gitignore` now excludes these local artifacts from accidental commits; the files remain on disk and were not modified. Do not upload or publish those archives. If the WebIntoApp account is still in use, rotate its exposed app key in that account and do not treat it as an Android signing password.
- `app-release.aab` is structurally valid and targets API 36, but it is **not a usable StreetSpot release**. Its manifest is package `com.hardinbros.streetspot`, version name `3.0`, version code `30000`; its embedded web page title is `WebIntoApp.com` and contains no StreetSpot site/domain.
- The saved `StreetSpot 1.1`, `1.2`, `2.0`, and `2.1` archives contain AABs using package `com.plainjane.streetspot`, also embedding a `WebIntoApp.com` page. Their package ID does not match the root 3.0 AAB.
- The root 3.0 AAB has version code `30000`, which is lower than the confirmed Play Console version codes `30400` and `30500`; it cannot be used as the next update.
- The root AAB certificate fingerprint is `45:70:C8:C3:38:DF:B0:A5:8D:5B:0D:3E:B2:66:E2:48:65:32:CC:3B:CF:57:05:99:72:42:8C:2E:4A:8B:D5:27`; this is the reported upload-key fingerprint, not the Play App Signing fingerprint used by `assetlinks.json`.
- Live-domain check on 2026-10-15: `https://streetspotapp.com/` returns HTTP 403 with Cloudflare's `cf-mitigated: challenge` header, while `https://www.streetspotapp.com/` returns HTTP 200 but serves a stale cached page (Vercel `Age` about 7.3 days). PWABuilder cannot be treated as ready until the apex challenge is corrected or the production host is deliberately standardized and verified.
- Vercel's latest production deployment is in `ERROR` state: the build fails at `app/layout.tsx` because `@vercel/analytics/next` is imported but missing from that deployment's dependencies. The custom domains still serve the previous successful deployment. Do not claim current local fixes are live.

### PWABuilder release configuration

- Builder: https://www.pwabuilder.com/; package type: Android / Google Play (Trusted Web Activity).
- Host: `https://streetspotapp.com` once the Cloudflare challenge is removed and the current deployment is verified. Do not use WebIntoApp.
- Package ID: `com.plainjane.streetspot`.
- App version: `3.6`; version code: `30600` (must remain higher than every previously used code).
- Signing: choose the existing upload key (`Use mine`); verify the keystore certificate fingerprint against the Play Console upload certificate before building. Never publish or overwrite the keystore. The Play App Signing fingerprint, not the upload-key fingerprint, belongs in `assetlinks.json`.
- After building, inspect the AAB package ID, version name/code, launch host/start URL, target SDK, permissions, and upload certificate; install/test the generated APK before uploading the AAB. Confirm `/.well-known/assetlinks.json` is publicly accessible on the exact launch host.

Before a store release, verify the package, version code, signing, permissions, geolocation delegation, back navigation, external links, and data-safety declarations. Use the policy URLs above in the store listing.

## Deployment and external services

The Vercel project is `agent-integrations-update-1` (project ID `prj_ciWAbIteaitQQkDS6Hlg9awjxiKg`). Both `streetspotapp.com` and `www.streetspotapp.com` are attached and verified in Vercel. The apex host is intercepted by a Cloudflare challenge for non-browser requests; the `www` host responds but is serving stale cached content. The latest Vercel production build failed, so current local changes are not live. Resolve the Cloudflare challenge and restore a successful production deployment before PWABuilder packaging.

Supabase server routes prefer the server-only `SUPABASE_URL`, fall back to `NEXT_PUBLIC_SUPABASE_URL` for compatibility, and require the server-only `SUPABASE_SERVICE_ROLE_KEY`. No deployment credentials are configured by this repository. Do not set the service-role key with a `NEXT_PUBLIC_` prefix.

No beehiiv credentials or publication ID are configured. Configure them only in server-side deployment settings after a publication is available; newsletter signup and campaign operations are not active in this build.

## Local validation

Run `pnpm run typecheck`, `pnpm run lint`, `pnpm run build`, and `git diff --check` after dependencies are installed. Android device tests, Play Console checks, Cloudflare settings, Supabase authorization, and Stripe checkout verification require their respective external projects/accounts.
