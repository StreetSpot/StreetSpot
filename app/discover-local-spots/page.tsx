import type { Metadata } from "next"
import { SeoLandingPage } from "@/components/seo-landing-page"

const title = "Discover Hidden Gems and Local Spots | StreetSpot"
const description = "Explore food trucks, pop-up shops, local businesses, skate spots, events, and hidden gems through StreetSpot's location-based discovery experience."

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://streetspotapp.com/discover-local-spots" },
  openGraph: { title, description, url: "https://streetspotapp.com/discover-local-spots", siteName: "StreetSpot", type: "website" },
}

export default function DiscoverLocalSpotsPage() {
  return <SeoLandingPage
    eyebrow="Local discovery"
    title="Find the places worth knowing."
    description="Your next favorite spot might be a food truck, a small business, a skate spot, a neighborhood event, or a hidden gem you haven't found yet. StreetSpot brings local discovery into one map-focused experience."
    bullets={[
      "Explore food trucks, pop-up retailers, and participating local businesses.",
      "Find community activity and events where listings are available.",
      "Use the live-map experience to discover places and check their details.",
      "Help local discovery work better by sharing accurate information about places you know.",
    ]}
    primaryHref="/"
    primaryLabel="Start exploring"
    secondaryHref="/food-trucks"
    secondaryLabel="Discover food trucks"
    note="Listings, live status, and individual features depend on the information shared by each place and the features currently enabled."
  />
}
