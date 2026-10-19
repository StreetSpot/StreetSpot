"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { CircleHelp, MapPin, RefreshCw, ShieldCheck } from "lucide-react"

const featureLabels: Record<string, string> = {
  vendor_bronze: "StreetSpot Bronze Vendor",
  vendor_silver: "StreetSpot Silver Vendor",
  vendor_gold: "StreetSpot Gold Vendor",
  theme_street_style: "Street Style Pack",
  theme_creator: "Creator Themes",
  theme_brand_studio: "Brand Studio",
  event_hosting_invite: "Private Invitation Hosting",
  event_hosting_hosted: "Hosted Event Package",
  event_hosting_signature: "Signature Event Package",
}

export default function PaymentReturnPage() {
  const [features, setFeatures] = useState<string[]>([])
  const [status, setStatus] = useState<"checking" | "active" | "pending" | "signed-out" | "error">("checking")

  const checkStatus = useCallback(async () => {
    setStatus("checking")
    try {
      let response = await fetch("/api/entitlements", { cache: "no-store" })
      if (response.status === 401) {
        const refreshed = await fetch("/api/auth/refresh", { method: "POST", cache: "no-store" })
        if (refreshed.ok) response = await fetch("/api/entitlements", { cache: "no-store" })
      }
      if (response.status === 401) {
        setStatus("signed-out")
        return
      }
      if (!response.ok) {
        setStatus("error")
        return
      }
      const result = await response.json() as { activeFeatures?: string[] }
      const active = Array.isArray(result.activeFeatures) ? [...result.activeFeatures] : []
      const pendingEventId = window.localStorage.getItem("streetspot_pending_event_id")
      if (pendingEventId) {
        try {
          const purchaseResponse = await fetch(`/api/private-events/${encodeURIComponent(pendingEventId)}/purchase`, { cache: "no-store" })
          if (purchaseResponse.ok) {
            const purchase = await purchaseResponse.json() as { paid?: boolean; purchase?: { tier?: string } | null }
            if (purchase.paid && purchase.purchase?.tier) active.push(`event_hosting_${purchase.purchase.tier}`)
          }
        } catch {
          // The event purchase can be checked again from the host studio.
        }
      }
      const uniqueActive = [...new Set(active)]
      setFeatures(uniqueActive)
      setStatus(uniqueActive.length ? "active" : "pending")
    } catch {
      setStatus("error")
    }
  }, [])

  // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch authoritative payment state on page mount.
  useEffect(() => { void checkStatus() }, [checkStatus])

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-5 py-12 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {status === "active" ? <ShieldCheck className="h-8 w-8" /> : <MapPin className="h-8 w-8" />}
      </div>
      <h1 className="text-2xl font-bold text-foreground">Payment status</h1>
      {status === "checking" && <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">Checking the server-confirmed purchase status…</p>}
      {status === "active" && (
        <div className="mt-3 max-w-md text-sm leading-6 text-foreground">
          <p>Your purchase is confirmed and these features are active:</p>
          <ul className="mt-3 space-y-1">
            {features.map((feature) => <li key={feature} className="font-semibold">{featureLabels[feature] ?? feature}</li>)}
          </ul>
        </div>
      )}
      {status === "pending" && <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">No active purchase has arrived yet. Stripe confirmation can take a moment. This page never activates paid access based on the return URL alone.</p>}
      {status === "signed-out" && <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">Sign in with the same StreetSpot account you used at checkout to view your purchase status.</p>}
      {status === "error" && <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">The purchase status service is temporarily unavailable. Your payment receipt remains the source of truth until the server can verify the event.</p>}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button onClick={() => void checkStatus()} disabled={status === "checking"} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"><RefreshCw className="h-4 w-4" />Check status</button>
        <Link href="/host/invitations" className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground">Finish event setup</Link>
        <Link href="/" className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground">Back to StreetSpot</Link>
        <Link href="/support" className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground"><CircleHelp className="h-4 w-4" />Support</Link>
      </div>
    </main>
  )
}
