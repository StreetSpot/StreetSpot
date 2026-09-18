# StreetSpot free architecture

| Service/capability | Status | Notes |
| --- | --- | --- |
| Next.js/React | FREE | Application runtime and static routes. |
| Leaflet/OpenStreetMap-compatible map layer | FREE | Use only a permitted tile provider and respect its usage policy. |
| Browser geolocation | FREE | Permission-gated, foreground-only, no background polling. |
| Vendor store | DISABLED FOR PRODUCTION | Current client-side store is suitable for prototype UI only; it must be replaced by authenticated persistence before production data is collected. |
| Authentication/database | NOT CONFIGURED IN APP | Environment names exist, but no application data access was safely inferred from the active code. |
| Analytics | DISABLED | Removed to avoid paid/third-party usage. |
| AI agents | LOCAL DETERMINISTIC | Use templates, validation, release checklists, and help content; no paid model calls. |
| Social posting | FREE | Use copy/share links and Web Share API; no scraping or fake posting. |
| Voice/SMS | DISABLED | Architecture may be added later, but no billable provider is activated. |
| Payments | DISABLED | No live products, charges, or checkout claims. |
| Push notifications | NOT CONFIGURED | Browser notification capability may be added with explicit permission; no paid provider. |

## Safety rule
Features are only presented as live when the underlying credentialed service and server-side authorization exist. Missing integrations must show a clear unavailable state, never fabricated records or success responses.
