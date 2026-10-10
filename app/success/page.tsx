"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Crown, CheckCircle2, Sparkles, MapPin, Shield } from "lucide-react"
import { vendorStore } from "@/lib/vendor-store"

export default function SuccessPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)
  const [activated, setActivated] = useState(false)

  useEffect(() => {
    // Find the vendor by stored session ID first, then fall back to any session vendor
    const storedId =
      typeof window !== "undefined"
        ? sessionStorage.getItem("streetspot_vendor_id")
        : null

    const allVendors = vendorStore.getSnapshot()

    if (storedId) {
      const match = allVendors.find((v) => v.id === storedId)
      if (match) {
        vendorStore.updateVendor(storedId, { isPremium: true })
        setActivated(true)
      }
    }

    // Also upgrade any other live session vendors (multi-device scenario)
    const sessionVendors = allVendors.filter(
      (v) => v.id.startsWith("vendor-") && v.isLive && !v.isPremium
    )
    for (const v of sessionVendors) {
      vendorStore.updateVendor(v.id, { isPremium: true })
    }

    if (sessionVendors.length > 0 || storedId) {
      setActivated(true)
    }

    // Persist gold state for dashboard pickup
    if (typeof window !== "undefined") {
      sessionStorage.setItem("streetspot_gold_active", "true")
    }
  }, [])

  useEffect(() => {
    if (countdown <= 0) {
      router.push("/?gold=activated")
      return
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown, router])

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto w-full max-w-md text-center">
        {/* Gold glow ring */}
        <div className="relative mb-8 flex justify-center">
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full bg-amber-500/10 ring-2 ring-amber-500/40"
            style={{ animation: "pin-pulse-gold 2s ease-in-out infinite" }}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600">
              <Crown className="h-8 w-8 text-background" />
            </div>
          </div>
          <div
            className="absolute -right-1 -top-1 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-background"
            style={{ animation: "toast-enter .5s ease-out" }}
          >
            <CheckCircle2 className="h-5 w-5 text-background" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="mb-2 text-balance text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          {activated ? "Gold Status Activated" : "Payment Received"}
        </h1>
        <p className="mb-8 text-pretty text-sm leading-relaxed text-muted-foreground">
          {activated
            ? "Your map pin now has a pulsing gold glow and top-of-map placement for all Finders."
            : "Your Gold upgrade is confirmed. Go live from the dashboard to see your premium pin."}
        </p>

        {/* Feature confirmation cards */}
        <div className="mb-8 flex flex-col gap-2.5">
          {[
            {
              icon: Crown,
              label: "Top-of-Map Placement",
              desc: "Your pin now appears above all standard vendors",
            },
            {
              icon: Sparkles,
              label: "Pulsing Gold Glow",
              desc: "A premium glow effect makes your pin stand out",
            },
            {
              icon: MapPin,
              label: "Featured Vendor Badge",
              desc: "Gold badge visible in list view and map popups",
            },
          ].map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] px-4 py-3 text-left"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15">
                <Icon className="h-4 w-4 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-emerald-400" />
            </div>
          ))}
        </div>

        {/* Redirect notice */}
        <div className="rounded-xl border border-border bg-card px-5 py-4">
          <p className="text-sm text-muted-foreground">
            Returning to your dashboard in{" "}
            <span className="font-mono font-bold text-foreground">
              {countdown}s
            </span>
          </p>
          <button
            onClick={() => router.push("/?gold=activated")}
            className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Go to Dashboard Now
          </button>
        </div>

        {/* Statement descriptor + trust badge */}
        <div className="mt-6 flex flex-col items-center gap-2">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
            <Shield className="h-3 w-3" />
            <span>Secured by Stripe</span>
          </div>
          <p className="text-[10px] text-muted-foreground/50">
            StreetSpot Gold &middot; $0.99 USD/week &middot; Statement: STREETSPOT &middot; Cancel anytime
          </p>
          <p className="text-[10px] text-muted-foreground/40">
            Manning, SC 29102
          </p>
        </div>
      </div>
    </div>
  )
}
