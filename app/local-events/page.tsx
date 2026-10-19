import type { Metadata } from "next"
import { MarketingLanding } from "@/components/marketing-landing"

export const metadata: Metadata = { title: "Find Local Events and Gatherings | StreetSpot", description: "Explore location-based discovery for community events, markets, yard sales, pop-ups, and gatherings on StreetSpot." }

export default function LocalEventsPage() {
  return <MarketingLanding title="Find what's happening around the corner." intro="From neighborhood gatherings and markets to yard sales and pop-up events, StreetSpot brings location-based discovery to the places people meet, shop, and spend time together." sectionTitle="Discover events and local activity" bullets={["Explore public event and local activity listings where available.", "Discover markets, pop-ups, yard sales, and community gatherings.", "Check event details and location information before you travel.", "Use invite-only event features only through their intended private invitation flow."]} paragraphs={[]} note="Hosting options and paid features may vary. Check the current in-app details before creating an event or purchasing a hosting option." />
}
