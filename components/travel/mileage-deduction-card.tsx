"use client"

import { Car } from "lucide-react"
import { useTravelTotals } from "@/lib/travel-store"

const IRS_RATE_2026 = 0.67

export function MileageDeductionCard() {
  const totals = useTravelTotals()
  const deduction = totals.mileage * IRS_RATE_2026

  return (
    <div className="mb-4 rounded-xl border border-border bg-card p-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <Car className="h-4 w-4" />
        IRS Mileage Deduction
      </h3>

      <div className="mb-3">
        <p className="text-3xl font-bold text-foreground">
          ${deduction.toFixed(2)}
        </p>
        <p className="text-xs text-muted-foreground">
          {totals.mileage.toFixed(1)} miles × ${IRS_RATE_2026}/mile
        </p>
      </div>

      <div className="rounded-lg bg-secondary px-3 py-2 text-xs">
        <p className="text-muted-foreground">
          2026 IRS standard mileage rate. Keep your travel logs for tax records.
        </p>
      </div>
    </div>
  )
}
