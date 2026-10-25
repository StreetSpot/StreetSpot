import type { Metadata } from "next"
import { MarketingLanding } from "@/components/marketing-landing"

export const metadata: Metadata = {
  title: "Find Food Trucks and Mobile Vendors | StreetSpot",
  description: "Explore food trucks, mobile vendors, pop-up businesses and local discoveries on StreetSpot. Check listing details before you head out.",
  alternates: { canonical: "https://streetspotapp.com/food-trucks" },
  openGraph: {
    title: "Find Food Trucks and Mobile Vendors | StreetSpot",
    description: "Discover food trucks, mobile vendors and pop-up businesses through StreetSpot's local discovery experience.",
    url: "https://streetspotapp.com/food-trucks",
    type: "website",
  },
}

export default function FoodTrucksPage() {
  return (
    <MarketingLanding
      title="Find food trucks and mobile vendors around your community."
      intro="Food trucks and mobile vendors can move between locations, events and pop-ups. StreetSpot brings local discovery into a map-focused experience so people can explore participating vendors, check listing details and find businesses worth visiting."
      sectionTitle="A more useful way to discover local vendors"
      paragraphs={[
        "Explore participating food trucks, carts, pop-up businesses and other local spots. Listings, live status and location details depend on what each business has published and which features are enabled.",
        "If you run a food truck or mobile business, StreetSpot provides vendor listing options designed to help people discover your business and check the information you share. Keep your location, hours and updates accurate.",
      ]}
      bullets={[
        "Explore local discovery listings and available location information.",
        "Find participating food trucks, pop-up shops and mobile vendors.",
        "Check current listing details before travelling to a location.",
        "Vendors can review listing and visibility options before choosing a plan.",
      ]}
      note="StreetSpot does not guarantee that a particular truck is open, that a listing is available in every area, or that a vendor will receive sales or customers. Confirm details with the business when needed."
      cta="Explore local spots"
    />
  )
}
