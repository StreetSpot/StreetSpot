import type { Metadata } from "next"
import { SeoLandingPage } from "@/components/seo-landing-page"

const title = "Find Local Events, Markets and Gatherings | StreetSpot"
const description = "Explore local events, markets, pop-ups, yard sales, and community gatherings through StreetSpot's location-based discovery experience."

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://streetspotapp.com/local-events" },
  openGraph: { title, description, url: "https://streetspotapp.com/local-events", siteName: "StreetSpot", type: "website" },
}

export default function LocalEventsPage() {
  return <SeoLandingPage
    eyebrow="Local events and gatherings"
    title="Find what's happening around the corner."
    description="From neighborhood markets and yard sales to pop-ups and community gatherings, StreetSpot helps people explore the places where local life happens. Check event details and location information before you travel."
    bullets={[
      "Explore public event and local activity listings where available.",
      "Discover markets, pop-ups, yard sales, and neighborhood gatherings.",
      "Use accurate location details to plan where to go.",
      "Keep invite-only events inside their intended private invitation flow.",
    ]}
    primaryHref="/"
    primaryLabel="Explore StreetSpot"
    secondaryHref="/private-events"
    secondaryLabel="Explore event hosting"
    note="Event availability, hosting options, and paid features depend on the current listing and account. Review the in-app details before purchasing a hosting option."
  />
}
