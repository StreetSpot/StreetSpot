import type { Metadata } from "next"
import { SeoLandingPage } from "@/components/seo-landing-page"

const title = "Private Event Invitations & Guest-Only Pins | StreetSpot"
const description = "Create a private StreetSpot event, pay once for a hosting package, and share unique invitation links that reveal venue directions only to invited guests."

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "https://streetspotapp.com/private-events" },
  openGraph: { title, description, url: "https://streetspotapp.com/private-events", siteName: "StreetSpot", type: "website" },
}

export default function PrivateEventsPage() {
  return <SeoLandingPage
    eyebrow="Private celebrations"
    title="Your people. Your moment. Your private pin."
    description="Plan a birthday, graduation, wedding, anniversary, or private party with an invitation page and unique guest links. Venue coordinates are not included in the public StreetSpot map."
    bullets={[
      "Custom Invitation: $4.99 for one invited guest.",
      "Hosted Event: $14.99 for up to 50 invited guests.",
      "Signature Celebration: $29.99 for up to 200 invited guests.",
      "Each guest link is unique, expires after 30 days, and can reveal directions only while it remains valid.",
    ]}
    primaryHref="/host/invitations"
    primaryLabel="Open Private Host Studio"
    secondaryHref="/"
    secondaryLabel="Explore StreetSpot"
    note="Packages are one-time payments. Event details are published only after verified payment and valid event information. Email delivery is not configured yet, so hosts copy and share the generated links themselves."
  />
}
