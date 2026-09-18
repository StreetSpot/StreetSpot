import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = { title: "Support", description: "Get help with StreetSpot." }

export default function SupportPage() {
  return <main className="mx-auto min-h-dvh max-w-3xl px-6 py-12 text-foreground"><Link href="/" className="text-primary">← StreetSpot</Link><h1 className="mt-10 text-4xl font-bold">StreetSpot support</h1><p className="mt-6 leading-7 text-muted-foreground">Need help with discovery, a vendor listing, an event, messaging, location access, or account deletion?</p><a className="mt-6 inline-flex rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground" href="mailto:support@streetspot.app">Email support</a><h2 className="mt-10 text-xl font-semibold">Safety and privacy</h2><p className="mt-3 leading-7 text-muted-foreground">Review our <Link href="/privacy" className="text-primary underline">Privacy Policy</Link> and <Link href="/terms" className="text-primary underline">Terms of Service</Link>. StreetSpot uses browser location only after permission and does not run background GPS tracking.</p></main>
}
