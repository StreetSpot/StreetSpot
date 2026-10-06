import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = { title: "Delete Account", description: "Request deletion of your StreetSpot account and data.", alternates: { canonical: "https://streetspotapp.com/delete-account" }, openGraph: { url: "https://streetspotapp.com/delete-account" } }

export default function DeleteAccountPage() {
  return <main className="mx-auto min-h-dvh max-w-3xl px-6 py-12 text-foreground"><Link href="/" className="text-primary">← StreetSpot</Link><h1 className="mt-10 text-4xl font-bold">Delete your account or data</h1><p className="mt-6 leading-7 text-muted-foreground">To request help with account or data deletion, email <a className="text-primary underline" href="mailto:support@streetspotapp.com?subject=StreetSpot%20account%20or%20data%20deletion">support@streetspotapp.com</a>. Include the account email or browser information needed to identify the relevant data, and do not include passwords or payment details.</p><p className="mt-4 leading-7 text-muted-foreground">StreetSpot does not currently provide account sign-in or a connected account database in this website. Some feature data exists only in the browser&apos;s local storage; clear that browser storage to remove it from this device. This page provides a support contact and does not claim that an automated deletion has occurred.</p></main>
}
