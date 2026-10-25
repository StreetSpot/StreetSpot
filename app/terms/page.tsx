import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms of Service - StreetSpot",
  description: "StreetSpot terms for vendor listings, subscriptions, private event hosting, and customer discovery.",
  alternates: { canonical: "https://streetspotapp.com/terms" },
  openGraph: { url: "https://streetspotapp.com/terms" },
}

const EFFECTIVE_DATE = "October 17, 2026"
const SUPPORT_EMAIL = "support@streetspotapp.com"

export default function TermsPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-3xl px-6 py-12 text-foreground">
      <Link href="/" className="text-primary">Back to StreetSpot</Link>
      <h1 className="mt-10 text-4xl font-bold">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Effective {EFFECTIVE_DATE}</p>
      <div className="mt-8 space-y-6 leading-7 text-muted-foreground">
        <p>StreetSpot helps people discover local vendors, mobile businesses, community spots, and events. By using StreetSpot, you agree to these terms and to the <Link href="/privacy" className="text-primary underline">Privacy Policy</Link>.</p>

        <h2 className="text-xl font-semibold text-foreground">Accounts and ownership</h2>
        <p>You must provide accurate account information and may claim only businesses you own or are authorized to represent. A claim request is not proof of ownership. StreetSpot may ask for evidence, reject an unsupported claim, or remove a listing that appears misleading or unauthorized.</p>

        <h2 className="text-xl font-semibold text-foreground">Vendor listings and location</h2>
        <p>Vendors control when their listing is live. When you publish a live listing, its business name, description, hours, and submitted map coordinates may be visible to the public. Do not publish a private residence or another person's location without authorization. StreetSpot does not track vendor location in the background. You are responsible for updating your location and taking your listing offline when it is no longer accurate.</p>

        <h2 className="text-xl font-semibold text-foreground">Subscriptions and paid features</h2>
        <p>Vendor subscriptions are recurring plans processed through Stripe. Paid map visibility and the ability to publish live are activated only after StreetSpot receives and verifies payment status from Stripe. Access may be suspended when a subscription is canceled, expires, or remains unpaid beyond the current paid period. Do not purchase a second plan to change tiers while a subscription is active. To change or cancel a subscription, contact <a className="text-primary underline" href={"mailto:" + SUPPORT_EMAIL + "?subject=StreetSpot%20subscription%20change"}>{SUPPORT_EMAIL}</a>.</p>

        <h2 className="text-xl font-semibold text-foreground">Private events and invitations</h2>
        <p>Paid event-hosting packages are charged through Stripe. An event cannot be published until payment is confirmed. Hosts are responsible for the accuracy of event details and for inviting only intended guests. Private venue details are shown only after an invited guest verifies the invitation. StreetSpot may revoke access to an event when its payment is refunded, disputed, or otherwise invalidated.</p>

        <h2 className="text-xl font-semibold text-foreground">Payments, refunds, and billing support</h2>
        <p>Stripe collects payment details on its hosted checkout pages. StreetSpot does not store full payment card numbers. Subscription and event-hosting prices, renewal terms, and any applicable taxes are shown at checkout. For billing questions, cancellation requests, or refund requests, contact support. Any refund or cancellation is subject to applicable law and the terms shown at checkout.</p>

        <h2 className="text-xl font-semibold text-foreground">User content and acceptable use</h2>
        <p>You are responsible for listings, reviews, messages, photos, invitations, and event details you submit. Do not post unlawful, fraudulent, threatening, abusive, infringing, or private information without permission. Do not impersonate a business owner, manipulate reviews, scrape the service in a way that harms availability, or attempt to bypass payment, access controls, or verification.</p>

        <h2 className="text-xl font-semibold text-foreground">Availability and safety</h2>
        <p>Locations, hours, prices, events, and vendor availability can change. Confirm details with the business and use navigation safely. StreetSpot does not guarantee the accuracy of user-submitted information, event attendance, sales, business results, or uninterrupted service. StreetSpot may correct, suspend, or remove listings that violate these terms or create safety, fraud, or legal risks.</p>

        <h2 className="text-xl font-semibold text-foreground">Account and data deletion</h2>
        <p>You can clear browser-local data from the <Link href="/delete-account" className="text-primary underline">Delete Account page</Link>. For server-side account or data deletion, contact <a className="text-primary underline" href={"mailto:" + SUPPORT_EMAIL + "?subject=StreetSpot%20account%20or%20data%20deletion"}>{SUPPORT_EMAIL}</a>. Requests may require identity verification. Some transaction, fraud-prevention, and legal records may be retained where required by law.</p>

        <h2 className="text-xl font-semibold text-foreground">Changes and contact</h2>
        <p>We may update these terms as the service changes. Material updates will be reflected by the effective date above. Questions about these terms can be sent to <a className="text-primary underline" href={"mailto:" + SUPPORT_EMAIL}>{SUPPORT_EMAIL}</a>.</p>
      </div>
    </main>
  )
}
