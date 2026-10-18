import type { Metadata } from "next"
import { SeoLandingPage } from "@/components/seo-landing-page"

const title = "Get Your Local Business Seen | StreetSpot"
const description = "Create a StreetSpot account, choose a monthly Premier plan, and publish your street business location and hours so nearby customers can discover it."

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://streetspotapp.com/vendors" },
  openGraph: { title, description, url: "https://streetspotapp.com/vendors", siteName: "StreetSpot", type: "website" },
}

export default function VendorsPage() {
  return <SeoLandingPage
    eyebrow="For local businesses"
    title="Put your hustle on the map."
    description="StreetSpot helps nearby customers discover local vendors, mobile businesses, pop-ups, and community spots. Keep your location and hours current so people can find you while you're open."
    bullets={[
      "Create a verified StreetSpot account instead of relying on a browser-only profile.",
      "Choose a monthly Premier plan before publishing your business live.",
      "Update your location and closing time when your business moves or wraps up for the day.",
      "Build a clear listing customers can find from the StreetSpot discovery experience.",
    ]}
    primaryHref="/?mode=vendor"
    primaryLabel="Create vendor account"
    secondaryHref="/food-trucks"
    secondaryLabel="Explore food truck discovery"
    note="A paid monthly plan is required to publish a vendor listing live. Subscription status is checked on the server; a browser setting cannot grant paid access."
  />
}
