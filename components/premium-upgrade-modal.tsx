"use client"

import { X, Check, Crown, Zap, ExternalLink } from "lucide-react"
import { PREMIER_TIERS, type PremierTier } from "@/lib/premier-store"

interface PremiumUpgradeModalProps {
  open: boolean
  onClose: () => void
  currentTier?: PremierTier
}

export function PremiumUpgradeModal({
  open,
  onClose,
  currentTier = "none",
}: PremiumUpgradeModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-border bg-card shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card/95 px-5 py-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            <h2 className="text-base font-semibold text-foreground">
              Upgrade Premier Pin
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <p className="text-sm text-muted-foreground">
            Choose a plan. All plans include a 7-day free trial. Cancel anytime.
          </p>

          {PREMIER_TIERS.map((tier) => {
            const isCurrent = currentTier === tier.id
            return (
              <div
                key={tier.id}
                className={`rounded-xl border p-4 ${
                  isCurrent
                    ? "border-primary bg-primary/5"
                    : "border-border bg-secondary/30"
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${tier.color}`}
                    >
                      <Crown className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        {tier.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {tier.trial}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-foreground">
                      {tier.price}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {tier.period}
                    </span>
                  </div>
                </div>

                <ul className="mb-4 space-y-1.5">
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-xs text-foreground/80"
                    >
                      <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <div className="flex h-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-medium text-primary">
                    Current Plan
                  </div>
                ) : (
                  <a
                    href={tier.stripeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r ${tier.color} text-sm font-semibold text-white shadow transition hover:brightness-110`}
                  >
                    <Zap className="h-4 w-4" />
                    Start 7-Day Free Trial
                    <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                  </a>
                )}
              </div>
            )
          })}

          <p className="text-center text-[11px] text-muted-foreground">
            Secure checkout powered by Stripe · STREETSPOT
          </p>
        </div>
      </div>
    </div>
  )
}
