import type { Metadata } from "next"
import Link from "next/link"
import { DeleteLocalDataButton } from "@/components/delete-local-data-button"

export const metadata: Metadata = {
  title: "Delete Account",
  description: "Request deletion of your $treet$pot account and data.",
  alternates: { canonical: "https://streetspotapp.com/delete-account" },
  openGraph: { url: "https://streetspotapp.com/delete-account" },
}

export default function DeleteAccountPage() {
  return (
    <main className="mx-auto min-h-dvh max-w-3xl px-6 py-12 text-foreground">
      <Link href="/" className="text-primary">
        $treet$pot
      </Link>
      <h1 className="mt-10 text-4xl font-bold">Delete your account or data</h1>
      <p className="mt-6 leading-7 text-muted-foreground">
        To request help with account or data deletion, email{" "}
        <a
          className="text-primary underline"
          href="mailto:support@streetspotapp.com?subject=$treet$pot%20account%20or%20data%20deletion"
        >
          support@streetspotapp.com
        </a>
        . Include the account email or browser information needed to identify the
        relevant data, and do not include passwords or payment details.
      </p>
      <p className="mt-4 leading-7 text-muted-foreground">
        StreetSpot account sign-in and server-side features are enabled. The
        button on this page clears only local browser data. Server-side account
        deletion is handled through support while the automated deletion workflow
        is being completed. We will verify the request and explain any payment,
        fraud-prevention, or legal records that must be retained. This page does
        not claim that server-side deletion has already occurred.
      </p>
      <DeleteLocalDataButton />
    </main>
  )
}
