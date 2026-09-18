import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = { title: "Terms of Service", description: "StreetSpot terms of service." }

export default function TermsPage() {
  return <main className="mx-auto min-h-dvh max-w-3xl px-6 py-12 text-foreground"><Link href="/" className="text-primary">← StreetSpot</Link><h1 className="mt-10 text-4xl font-bold">Terms of Service</h1><p className="mt-2 text-sm text-muted-foreground">Effective March 4, 2026</p><div className="mt-8 space-y-6 leading-7 text-muted-foreground"><p>StreetSpot helps people discover local businesses, vendors, events, and community places. Use the service lawfully and provide accurate information.</p><h2 className="text-xl font-semibold text-foreground">User content</h2><p>You are responsible for listings, reviews, messages, photos, and event details you submit. Do not post misleading, unlawful, harmful, or private information.</p><h2 className="text-xl font-semibold text-foreground">Availability and safety</h2><p>Locations and hours can change. Confirm details with the business and use navigation safely. StreetSpot does not guarantee availability, safety, or accuracy of user-submitted information.</p><h2 className="text-xl font-semibold text-foreground">Contact</h2><p>Questions about these terms can be sent to support@streetspot.app.</p></div></main>
}
