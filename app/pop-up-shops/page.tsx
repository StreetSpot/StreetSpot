import type { Metadata } from "next"
import { MarketingLanding } from "@/components/marketing-landing"

export const metadata: Metadata = {
  title: "Discover Pop-Up Shops and Local Businesses",
  description: "Find local pop-up retailers, neighborhood businesses, markets, and small-business discoveries with StreetSpot.",
  alternates: { canonical: "https://streetspotapp.com/pop-up-shops" },
  openGraph: { url: "https://streetspotapp.com/pop-up-shops" },
}

export default function PopUpShopsPage() {
  return <MarketingLanding title="Local business deserves to be found." intro="Some of the best local finds don't have a permanent storefront. StreetSpot helps people explore pop-up retailers, market tables, neighborhood businesses, and other places worth discovering." sectionTitle="Make discovery more local" paragraphs={["Explore places on a map, learn about participating businesses, and connect with local sellers where messaging and listing details are available. For vendors, accurate listing information helps potential customers understand what you offer and where to find you.", "StreetSpot includes a broad mix of local discovery use cases, from mobile food vendors and pop-up retail to flea-market tables and neighborhood gems. Availability depends on the listing and the features currently enabled."]} cta="Explore local spots" />
}
