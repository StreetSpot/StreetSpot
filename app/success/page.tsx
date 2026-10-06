import Link from "next/link"
import { CircleHelp, MapPin } from "lucide-react"

export default function PaymentReturnPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-5 py-12 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <MapPin className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold text-foreground">Payment return</h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
        StreetSpot cannot verify checkout or activate a paid plan from this page. If you completed a payment and need help, contact support with your receipt.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Back to StreetSpot</Link>
        <Link href="/support" className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground"><CircleHelp className="h-4 w-4" />Support</Link>
      </div>
    </main>
  )
}
