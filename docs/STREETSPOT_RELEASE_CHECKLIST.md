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

No Android Gradle project, Android manifest source, or native TWA source exists in this repository. The intended release path is **PWABuilder / Trusted Web Activity (Bubblewrap)**, not WebIntoApp. User-provided Play Console history confirms active production version code `30400` (3.4), inactive uploaded version `30500` (3.5), and last open-testing release `30200` (3.2). The user confirms `30500` was never released; it remains the highest previously uploaded code and must not be reused. The validated local TWA bundle uses package `com.plainjane.streetspot`, version `3.6`, version code `30603`, target SDK 36, and launches `https://www.streetspotapp.com/`. Its signer fingerprint matches the previously identified upload-key fingerprint. Confirm the current Play Console package and upload certificate before upload. Older WebIntoApp archives contain unrelated wrappers and must not be used.

### Existing Android artifacts inspected 2026-10-15

- Play Console version history confirmed by the user on 2026-10-15: `30200` (3.2) was the last released open-testing bundle; `30400` (3.4) is the last published production release; `30500` (3.5) is inactive and was never released. Do not reuse `30500`. The local candidate bundle `StreetSpot-3.6-30603-production.aab` validates with package `com.plainjane.streetspot`, version `3.6` / code `30603`, target SDK 36, and launch URL `https://www.streetspotapp.com/`. Bundletool validation passed. Its signing certificate SHA-256 matches the previously identified upload-key fingerprint; verify it against Play Console before upload.
- The PWA manifest declares 192×192 and 512×512 icons. The corresponding PNG files were found to be 1024×1024; they have now been resized to their declared dimensions, with originals preserved outside the repository at `C:\Users\calli\StreetSpot-Asset-Backup-20261015`.
- The local backup ZIPs and extracted WebIntoApp wrapper contain signing keystores and plaintext credential/certification records; the readme also contains a WebIntoApp app key. `.gitignore` now excludes these local artifacts from accidental commits; the files remain on disk and were not modified. Do not upload or publish those archives. If the WebIntoApp account is still in use, rotate its exposed app key in that account and do not treat it as an Android signing password.
- `app-release.aab` is structurally valid and targets API 36, but it is **not a usable StreetSpot release**. Its manifest is package `com.hardinbros.streetspot`, version name `3.0`, version code `30000`; its embedded web page title is `WebIntoApp.com` and contains no StreetSpot site/domain.
- The saved `StreetSpot 1.1`, `1.2`, `2.0`, and `2.1` archives contain AABs using package `com.plainjane.streetspot`, also embedding a `WebIntoApp.com` page. Their package ID does not match the root 3.0 AAB.
- The root 3.0 AAB has version code `30000`, lower than the historically observed Play Console codes `30400` and `30500`; it cannot be used as the next update. The exact Play package ID and highest-used code must be rechecked in Play Console before generating the replacement.
- The root AAB certificate fingerprint is `45:70:C8:C3:38:DF:B0:A5:8D:5B:0D:3E:B2:66:E2:48:65:32:CC:3B:CF:57:05:99:72:42:8C:2E:4A:8B:D5:27`; this is the reported upload-key fingerprint, not the Play App Signing fingerprint used by `assetlinks.json`.
- Live-domain check on 2026-10-15: `https://streetspotapp.com/`, `/manifest.json`, and `/.well-known/assetlinks.json` return HTTP 403 with Cloudflare's challenge page to automated fetches. `https://www.streetspotapp.com/`, its manifest, icons, and asset-links file return HTTP 200 and now serve the current Vercel deployment. The `www` host is a viable temporary test host, but the manifest ID and canonical URLs still point to the apex; do not silently switch the final app host without resolving that mismatch.
- The latest Vercel production deployment `dpl_5WME73ysUHtj8zo5bdjeupHVKGkB` is `READY` from branch `streetspot-pwabuilder-prep` at commit `5c29d56b9d573b455a8ef2cf4dec8f239c10e089`; it is aliased to both custom domains. The previous `main` deployment `dpl_3i5itZEFjxZmadNZzTYpaxjKCXeP` failed due to a missing `@vercel/analytics/next` dependency. The branch deployment removes that import/component; current fixes are live on the custom `www` host, while Cloudflare still challenges the apex for automated fetches.

### PWABuilder release configuration

- Builder: https://www.pwabuilder.com/; package type: Android / Google Play (Trusted Web Activity).
- Host: the validated candidate launches `https://www.streetspotapp.com/`; its `webManifestUrl` and full scope also use `www`. The live `www` assetlinks file returns HTTP 200 and matches package `com.plainjane.streetspot` plus the Play App Signing fingerprint. The web manifest `id` and canonical metadata still point to the apex, where automated checks receive a Cloudflare challenge. Align the canonical host deliberately before a future rebuild; do not use WebIntoApp.
- Package ID in the validated candidate: `com.plainjane.streetspot`; confirm it matches the app selected in Play Console before upload.
- Candidate app version `3.6`, version code `30603`. Confirm Play Console has no higher uploaded version code before upload.
- Signing: choose the existing upload key (`Use mine`); verify the keystore certificate fingerprint against the Play Console upload certificate before building. Never publish or overwrite the keystore. The Play App Signing fingerprint, not the upload-key fingerprint, belongs in `assetlinks.json`.
- After building, inspect the AAB package ID, version name/code, launch host/start URL, target SDK, permissions, and upload certificate; install/test the generated APK before uploading the AAB. Confirm `/.well-known/assetlinks.json` is publicly accessible on the exact launch host.

Before a store release, verify the package, version code, signing, permissions, geolocation delegation, back navigation, external links, and data-safety declarations. Use the policy URLs above in the store listing.

## Deployment and external services

The Vercel project is `agent-integrations-update-1` (project ID `prj_ciWAbIteaitQQkDS6Hlg9awjxiKg`). Both `streetspotapp.com` and `www.streetspotapp.com` are attached in Vercel. The latest deployment is READY and serves the current app on `www`; automated requests to the apex receive a Cloudflare challenge. The validated TWA candidate uses `www` for its launch URL, manifest URL, and full scope, and the live `www` assetlinks endpoint returns HTTP 200 with package `com.plainjane.streetspot` and the Play App Signing fingerprint. The PWA manifest ID and canonical metadata still reference the apex, so standardize that relationship before a future rebuild. Before uploading the candidate, confirm in Play Console that `com.plainjane.streetspot` is the selected app, version code `30603` has not already been used or superseded, and the upload certificate matches the Play Console upload certificate.

Supabase server routes prefer the server-only `SUPABASE_URL`, fall back to `NEXT_PUBLIC_SUPABASE_URL` for compatibility, and require the server-only `SUPABASE_SERVICE_ROLE_KEY`. No deployment credentials are configured by this repository. Do not set the service-role key with a `NEXT_PUBLIC_` prefix.

No beehiiv credentials or publication ID are configured. Configure them only in server-side deployment settings after a publication is available; newsletter signup and campaign operations are not active in this build.

## Local validation

Run `pnpm run typecheck`, `pnpm run lint`, `pnpm run build`, and `git diff --check` after dependencies are installed. Android device tests, Play Console checks, Cloudflare settings, Supabase authorization, and Stripe checkout verification require their respective external projects/accounts.
