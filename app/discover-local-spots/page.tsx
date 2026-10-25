import type { Metadata } from "next"
import { MarketingLanding } from "@/components/marketing-landing"

export const metadata: Metadata = { title: "Discover Hidden Gems and Local Spots", description: "Explore food trucks, local businesses, skate spots, events, and hidden gems through StreetSpot's live-map experience." }

export default function DiscoverLocalSpotsPage() {
  return <MarketingLanding title="Find the places worth knowing." intro="Your next favorite spot might be a food truck, a small business, a skate spot, a neighborhood event, or a hidden gem you have not found yet. StreetSpot brings local discovery into one map-focused experience." sectionTitle="Explore beyond the usual stops" paragraphs={["Discover participating vendors and businesses, explore event and community listings, and use available tools for saving spots or finding your way back to places that matter to you. Listings and features depend on current availability and the information shared by each place.", "StreetSpot is designed to connect people with real places and the people behind them. Check listing details before making a trip, and share useful local discoveries with your community."]} cta="Start exploring" />
}
