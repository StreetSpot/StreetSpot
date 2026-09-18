import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = { title: "Delete Account", description: "Request deletion of your StreetSpot account and data." }

export default function DeleteAccountPage() {
  return <main className="mx-auto min-h-dvh max-w-3xl px-6 py-12 text-foreground"><Link href="/" className="text-primary">← StreetSpot</Link><h1 className="mt-10 text-4xl font-bold">Delete your account</h1><p className="mt-6 leading-7 text-muted-foreground">To request deletion of a StreetSpot account, email <a className="text-primary underline" href="mailto:support@streetspot.app?subject=StreetSpot%20account%20deletion">support@streetspot.app</a> from the account email and include your StreetSpot username. We will confirm ownership before processing the request.</p><p className="mt-4 leading-7 text-muted-foreground">We delete or anonymize account data, favorites, messages, and user-created content associated with the account. Financial or fraud-prevention records may be retained only when legally required, with access restricted and retention limited.</p><p className="mt-4 leading-7 text-muted-foreground">You can also find the in-app action under Settings → Account → Delete Account when signed in.</p></main>
}
