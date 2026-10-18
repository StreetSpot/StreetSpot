import type { Metadata } from "next"
import { SeoLandingPage } from "@/components/seo-landing-page"

const title = "Pop-Up Shops, Carts & Flea Market Vendors | StreetSpot"
const description = "StreetSpot gives pop-up retailers, market vendors, carts, and local sellers a place to publish their location and hours for nearby discovery."

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://streetspotapp.com/pop-up-shops" },
  openGraph: { title, description, url: "https://streetspotapp.com/pop-up-shops", siteName: "StreetSpot", type: "website" },
}

export default function PopUpShopsPage() {
  return <SeoLandingPage
    eyebrow="Pop-ups, markets, and carts"
    title="Your pop-up has a spot. Put it where people can find it."
    description="From market tables and pop-up shops to mobile carts and neighborhood sellers, StreetSpot is designed for businesses that don't always operate from one permanent storefront."
    bullets={[
      "Create a StreetSpot account for the business you operate.",
      "Publish a live listing after selecting a monthly Premier plan.",
      "Refresh the location when you move between markets, events, or pop-up spaces.",
      "Give customers a direct place to discover your listing instead of hoping they stumble across it.",
    ]}
    primaryHref="/?mode=vendor"
    primaryLabel="Create your listing"
    secondaryHref="/vendors"
    secondaryLabel="Vendor details"
    note="StreetSpot does not verify inventory or guarantee customer traffic. Keep listing details accurate and follow the rules of each market or venue."
  />
}
