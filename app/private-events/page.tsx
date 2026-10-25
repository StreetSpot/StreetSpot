import type { Metadata } from "next"
import { MarketingLanding } from "@/components/marketing-landing"

export const metadata: Metadata = {
  title: "Private Event Invitations and Hosting | StreetSpot",
  description: "Create personalized wedding, birthday, graduation and other celebration invitations with StreetSpot's private event hosting options.",
  alternates: { canonical: "https://streetspotapp.com/private-events" },
  openGraph: {
    title: "Private Event Invitations and Hosting | StreetSpot",
    description: "Explore personalized invitations and hosted private event options for celebrations with StreetSpot.",
    url: "https://streetspotapp.com/private-events",
    type: "website",
  },
}

export default function PrivateEventsPage() {
  return (
    <MarketingLanding
      title="Make your celebration personal with private event invitations."
      intro="Planning a birthday, graduation, wedding celebration or another special gathering? StreetSpot offers invitation and hosted-event options designed to help you create a personalized invitation and share event information with the people you invite."
      sectionTitle="Choose an invitation or hosted-event option"
      paragraphs={[
        "The StreetSpot Host Studio offers different options, including custom invitations and hosted events. Available features can include personalized event details, guest invitation links and guest-only access to private venue information, depending on the plan and verification flow.",
        "Keep private event details private. Share invitation links only with intended guests, and review the current plan details and checkout information before purchasing.",
      ]}
      bullets={[
        "Personalize invitations for birthdays, graduations, weddings and other occasions.",
        "Review available options for an invitation or a hosted event page.",
        "Use guest-only invitation links and private venue details where supported.",
        "Manage event creation through the StreetSpot Host Studio.",
      ]}
      note="Pricing and guest limits depend on the option selected and may change. Private event details, guest lists and invitation-token URLs are not public search content."
      cta="Explore StreetSpot"
    />
  )
}
