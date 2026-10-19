import { track } from "@vercel/analytics"

type AnalyticsValue = string | number | boolean
export type AnalyticsProperties = Record<string, AnalyticsValue>

declare global {
  interface Window {
    gtag?: (command: string, eventName: string, properties?: AnalyticsProperties) => void
  }
}

/** Sends privacy-conscious conversion events to Vercel Analytics and GA4 when configured. */
export function trackConversion(name: string, properties: AnalyticsProperties = {}) {
  try { track(name, properties) } catch { /* Analytics must never block the customer flow. */ }
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", name, properties)
  }
}
