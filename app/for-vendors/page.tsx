import type { Metadata } from "next"
import { MarketingLanding } from "@/components/marketing-landing"

export const metadata: Metadata = { title: "StreetSpot for Vendors and Food Trucks", description: "Help local customers discover your food truck, mobile vendor setup, or pop-up business with StreetSpot's location-based discovery tools." }

export default function ForVendorsPage() {
  return <MarketingLanding title="Help customers find your spot." intro="When your truck, cart, or pop-up moves, customers should have a better way to find you. StreetSpot brings local discovery and location-based updates together so people can explore nearby vendors and connect with the businesses they want to support." sectionTitle="Built around real-world hustle" bullets={["Help customers discover food trucks, mobile vendors, and pop-up businesses.", "Use live location or availability features where enabled for your listing.", "Share updates about specials, events, or relocations when those tools are available to your account.", "Review your listing and available vendor options before claiming or publishing a spot."]} paragraphs={["StreetSpot is a discovery tool, not a promise of sales, customer volume, or income. Keep your location and business details accurate so people know where to find you."]} cta="Explore StreetSpot" />
}
