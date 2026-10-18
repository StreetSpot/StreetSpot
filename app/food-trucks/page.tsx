import type { Metadata } from "next"
import { SeoLandingPage } from "@/components/seo-landing-page"

const title = "Discover Food Trucks Near You | StreetSpot"
const description = "Find local food trucks, pop-up food vendors, and nearby street businesses with StreetSpot. Vendors can publish live locations and hours after account and subscription verification."

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://streetspotapp.com/food-trucks" },
  openGraph: { title, description, url: "https://streetspotapp.com/food-trucks", siteName: "StreetSpot", type: "website" },
}

export default function FoodTrucksPage() {
  return <SeoLandingPage
    eyebrow="Food trucks and street food"
    title="Find the truck. Catch it while it's there."
    description="Food trucks move. StreetSpot is built around local discovery, helping customers look for nearby food trucks and street vendors rather than guessing where a favorite stop parked today."
    bullets={[
      "Explore StreetSpot's live map and look for current local listings.",
      "Use the listing's location and hours as a starting point, then confirm details with the business.",
      "Food truck operators can create an account and publish their own live listing with a paid Premier plan.",
      "Share StreetSpot with friends who want to discover local food and small businesses.",
    ]}
    primaryHref="/"
    primaryLabel="Explore StreetSpot"
    secondaryHref="/vendors"
    secondaryLabel="List your business"
    note="Availability and location depend on vendors keeping their listings updated. StreetSpot does not guarantee that every truck is open or present at a particular time."
  />
}
