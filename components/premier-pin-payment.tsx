"use client"

import { useCallback, useEffect, useState } from "react"
import { Crown, Check, Sparkles, TrendingUp, Shield } from "lucide-react"
import { PREMIER_TIERS, type PremierTier } from "@/lib/premier-store"
import { PremiumUpgradeModal } from "./premium-upgrade-modal"

export function PremierPinPayment() {
  const [tier, setTier] = useState<PremierTier>("none")
  const [modalOpen, setModalOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [pastDue, setPastDue] = useState(false)

  const refreshTier = useCallback(async () => {
    try {
      const response = await fetch("/api/entitlements", { cache: "no-store" })
      if (!response.ok) {
        setTier("none")
        setPastDue(false)
        return
      }
      const payload = await response.json() as { activeFeatures?: string[]; pastDueFeatures?: string[] }
      const features = new Set(Array.isArray(payload.activeFeatures) ? payload.activeFeatures : [])
      setPastDue(Array.isArray(payload.pastDueFeatures) && payload.pastDueFeatures.some(feature => ["vendor_bronze", "vendor_silver", "vendor_gold"].includes(feature)))
      const activeTier = (["gold", "silver", "bronze"] as const).find(value => features.has("vendor_" + value))
      setTier(activeTier ?? "none")
    } catch {
      setTier("none")
      setPastDue(false)
    } finally {
      setLoaded(true)
    }
  }, [])

  /* eslint-disable react-hooks/set-state-in-effect -- fetch server-verified billing status on mount. */
  useEffect(() => {
    void refreshTier()
    const onFocus = () => { void refreshTier() }
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [refreshTier])
  /* eslint-enable react-hooks/set-state-in-effect */

  const currentTierData = PREMIER_TIERS.find(item => item.id === tier)
  const isActive = tier !== "none"

  return (
    <>
      <div className={`mb-6 overflow-hidden rounded-xl border ${isActive ? "border-amber-500/30 bg-gradient-to-b from-amber-500/[0.05] to-card" : "border-border bg-card"}`}>
        <div className={`flex items-center justify-between px-5 py-4 ${isActive ? "border-b border-amber-500/15" : ""}`}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 ring-1 ring-amber-500/20">
              <Crown className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-foreground">Vendor Subscription</h4>
                {loaded && isActive && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary"><Check className="mr-1 inline h-2.5 w-2.5" />{currentTierData?.name} active</span>}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {!loaded ? "Checking your server-verified subscription…" : isActive && pastDue ? "Payment is past due. Live access continues only through the current paid period." : isActive ? "Your paid visibility benefits are verified by StreetSpot." : "An active paid plan is required to publish a vendor listing live."}
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 pt-4">
          {!loaded ? (
            <p className="text-sm text-muted-foreground">Checking subscription status…</p>
          ) : isActive ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 rounded-lg bg-amber-500/[0.06] px-3.5 py-3 ring-1 ring-amber-500/10">
                <Sparkles className="h-4 w-4 shrink-0 text-amber-500" />
                <p className="text-xs leading-relaxed text-foreground/80">
                  {pastDue ? "Your payment is past due. Live access remains during the current paid period; contact support to update billing before it ends." : `Your ${currentTierData?.name} subscription is active. Map priority and premium pin styling are based on server-confirmed billing.`}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[{ icon: TrendingUp, label: "Priority" }, { icon: Sparkles, label: "Glow Pin" }, { icon: Crown, label: "Badge" }].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 rounded-lg bg-secondary px-2 py-3 text-center">
                    <Icon className="h-4 w-4 text-amber-500" />
                    <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
              <a href="mailto:support@streetspotapp.com?subject=StreetSpot%20subscription%20change" className="text-center text-xs text-muted-foreground underline hover:text-foreground">Contact support to change or cancel your subscription</a>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-sm leading-relaxed text-muted-foreground">Choose a recurring Bronze, Silver, or Gold plan. StreetSpot activates paid benefits only after Stripe confirms payment.</p>
              <div className="flex flex-col gap-2.5">
                {[{ icon: TrendingUp, title: "Better Placement", desc: "Priority map visibility" }, { icon: Sparkles, title: "Visual Glow", desc: "Premium pin styling" }, { icon: Shield, title: "Verified Billing", desc: "Live access tied to your subscription" }].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-center gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amber-500/10"><Icon className="h-3.5 w-3.5 text-amber-500" /></div>
                    <div><p className="text-xs font-medium text-foreground">{title}</p><p className="text-[11px] text-muted-foreground">{desc}</p></div>
                  </div>
                ))}
              </div>
              <button onClick={() => setModalOpen(true)} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition hover:brightness-110">
                <Crown className="h-4 w-4" /> View Paid Plans
              </button>
            </div>
          )}
        </div>
      </div>
      <PremiumUpgradeModal open={modalOpen} onClose={() => setModalOpen(false)} currentTier={tier} />
    </>
  )
}
