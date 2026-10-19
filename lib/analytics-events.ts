import { track } from "@vercel/analytics"

type AnalyticsValue = string | number | boolean
export type AnalyticsProperties = Record<string, AnalyticsValue>

declare global {
  interface Window {
    gtag?: (command: string, eventName: string, properties?: AnalyticsProperties) => void
  }
}

/** Sends only allowlisted, non-identifying conversion events. Analytics must never block the user flow. */
export function trackConversion(name: string, properties: AnalyticsProperties = {}) {
  try { track(name, properties) } catch { /* Optional Vercel analytics must never block a user action. */ }
  if (typeof window === "undefined") return
  if (typeof window.gtag === "function") window.gtag("event", name, properties)
  try {
    void fetch("/api/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventName: name, properties }),
      keepalive: true,
    }).catch(() => { /* First-party analytics failures never block the user flow. */ })
  } catch { /* Ignore telemetry failures. */ }
}
