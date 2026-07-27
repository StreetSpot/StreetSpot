"use client"

import { DollarSign } from "lucide-react"
import { useTravelTotals } from "@/lib/travel-store"

interface NetEarningsCardProps {
  grossRevenue?: number
}

export function NetEarningsCard({ grossRevenue = 0 }: NetEarningsCardProps) {
  const totals = useTravelTotals()
  const expenses = totals.fuel + totals.parking + totals.tolls
  const net = grossRevenue - expenses

  return (
    <div className="mb-4 rounded-xl border border-border bg-card p-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <DollarSign className="h-4 w-4" />
        Net Take-Home
      </h3>

      <div className="mb-4">
        <p className="text-3xl font-bold text-foreground">
          ${net.toFixed(2)}
        </p>
        <p className="text-xs text-muted-foreground">
          Gross − Fuel − Parking − Tolls
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-secondary px-3 py-2">
          <p className="text-muted-foreground">Gross</p>
          <p className="font-medium text-foreground">
            ${grossRevenue.toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg bg-secondary px-3 py-2">
          <p className="text-muted-foreground">Expenses</p>
          <p className="font-medium text-foreground">${expenses.toFixed(2)}</p>
        </div>
        <div className="rounded-lg bg-secondary px-3 py-2">
          <p className="text-muted-foreground">Fuel</p>
          <p className="font-medium text-foreground">
            ${totals.fuel.toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg bg-secondary px-3 py-2">
          <p className="text-muted-foreground">Parking + Tolls</p>
          <p className="font-medium text-foreground">
            ${(totals.parking + totals.tolls).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  )
}
