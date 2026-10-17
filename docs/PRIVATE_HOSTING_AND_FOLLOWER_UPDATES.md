# Private hosting, invitations, and vendor updates

## Current UI
- `/host/invitations`: invitation designer for weddings, graduations, birthdays, and other private events; supports personalized names, event details, guest email lists, three themes, local drafts, and invitation-text copying.
- `/vendor-studio`: social profile links and a vendor update composer for location changes, specialty/menu updates, deals, event appearances, and status updates. Drafts are local and sharing uses the device share sheet.
- App icons now point to the existing `brand-icon-192.png`, `brand-icon-512.png`, and `brand-apple-icon.png` artwork instead of the older generic icon files.

## Security and live-service status
These pages are design-stage interfaces, not a claim that invitations, pins, or notifications are live. Drafts stay on the current device. They do not send invitations, publish map pins, auto-post to social platforms, or deliver push notifications.

The SQL migration defines the durable data model for private events, hashed invitation tokens, verified entitlements, claimed-vendor social profiles, favorites, ratings/reviews, vendor updates, and in-app notifications. Private tables deny direct browser-role access and enable RLS. The migration must be applied and the API layer tested against an active backend before private invitations or follower alerts are enabled. Private map coordinates must only be returned by a server route after checking the authenticated user is the host or the invitee's verified account email matches an unrevoked, unexpired invitation. Never include private events in the public map endpoint.

Vendor notifications must be generated only when the listing is claimed, its owner is verified, Stripe entitlement is active, and the vendor is live. Social auto-posting needs separately authorized provider integrations and user-granted scopes. Browser share is not automatic social posting.

## Agents
The current registry is a local task-routing scaffold, not an autonomous AI workforce. Always-on operation requires an AI model/provider, durable job queue, scheduled worker, logs, retries, and explicitly connected services. Keep production actions gated until these exist.
