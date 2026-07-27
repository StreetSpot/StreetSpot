"use client"

import { useState } from "react"
import { Crown, Check, Sparkles, TrendingUp, Shield } from "lucide-react"
import { usePremier, premierStore, PREMIER_TIERS } from "@/lib/premier-store"
import { PremiumUpgradeModal } from "./premium-upgrade-modal"

export function PremierPinPayment() {
  const { tier } = usePremier()
  const [modalOpen, setModalOpen] = useState(false)

  const currentTierData = PREMIER_TIERS.find((t) => t.id === tier)
  const isActive = tier !== "none"

  return (
    <>
      <div
        className={`mb-6 overflow-hidden rounded-xl border ${
          isActive
            ? "border-amber-500/30 bg-gradient-to-b from-amber-500/[0.05] to-card"
            : "border-border bg-card"
        }`}
      >
        <div
          className={`flex items-center justify-between px-5 py-4 ${
            isActive ? "border-b border-amber-500/15" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 ${
                isActive
                  ? "bg-amber-500/15 ring-amber-500/30"
                  : "bg-amber-500/10 ring-amber-500/20"
              }`}
            >
              <Crown className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-foreground">
                  Premier Pin
                </h4>
                {isActive ? (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 ring-1 ring-emerald-500/20">
                    <Check className="h-2.5 w-2.5" />
                    {currentTierData?.name}
                  </span>
                ) : (
                  <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-500">
                    Upgrade
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {isActive
                  ? `${currentTierData?.name} plan active`
                  : "Get priority visibility on the map"}
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 pt-4">
          {isActive ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 rounded-lg bg-amber-500/[0.06] px-3.5 py-3 ring-1 ring-amber-500/10">
                <Sparkles className="h-4 w-4 shrink-0 text-amber-500" />
                <p className="text-xs leading-relaxed text-foreground/80">
                  Your pin now has enhanced placement and visual effects based
                  on your {currentTierData?.name} tier.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: TrendingUp, label: "Priority" },
                  { icon: Sparkles, label: "Glow Pin" },
                  { icon: Crown, label: "Badge" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-1.5 rounded-lg bg-secondary px-2 py-3 text-center"
                  >
                    <Icon className="h-4 w-4 text-amber-500" />
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setModalOpen(true)}
                className="mt-1 flex h-10 w-full items-center justify-center rounded-lg border border-border bg-secondary text-sm font-medium text-foreground transition hover:bg-muted"
              >
                Change Plan
              </button>
              <button
                onClick={() => premierStore.setTier("none")}
                className="text-center text-xs text-muted-foreground hover:text-foreground"
              >
                Deactivate
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Upgrade for better map placement. Choose Bronze, Silver, or Gold
                — all include a 7-day free trial.
              </p>
              <div className="flex flex-col gap-2.5">
                {[
                  {
                    icon: TrendingUp,
                    title: "Better Placement",
                    desc: "Appear higher on the map",
                  },
                  {
                    icon: Sparkles,
                    title: "Visual Glow",
                    desc: "Stand out from standard pins",
                  },
                  {
                    icon: Shield,
                    title: "Featured Badge",
                    desc: "Build trust with customers",
                  },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-center gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amber-500/10">
                      <Icon className="h-3.5 w-3.5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">
                        {title}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setModalOpen(true)}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition hover:brightness-110"
              >
                <Crown className="h-4 w-4" />
                View Plans & Start Trial
              </button>
            </div>
          )}
        </div>
      </div>

      <PremiumUpgradeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        currentTier={tier}
      />
    </>
  )
}
