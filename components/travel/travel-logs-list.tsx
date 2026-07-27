"use client"

import { Trash2 } from "lucide-react"
import { useTravelLogs, travelStore } from "@/lib/travel-store"

export function TravelLogsList() {
  const logs = useTravelLogs()

  if (logs.length === 0) {
    return (
      <div className="mb-6 rounded-xl border border-border bg-card p-5">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Recent Trips
        </h3>
        <p className="text-sm text-muted-foreground">
          No trips logged yet. Use the form above to add your first trip.
        </p>
      </div>
    )
  }

  return (
    <div className="mb-6 rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Recent Trips ({logs.length})
      </h3>

      <div className="flex flex-col gap-3">
        {logs.slice(0, 10).map((log) => (
          <div
            key={log.id}
            className="flex items-start justify-between gap-3 rounded-lg bg-secondary px-3 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {log.startAddress} → {log.destination}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {log.tripDate} · {log.mileage} mi · $
                {(log.fuel + log.parking + log.tolls).toFixed(2)} expenses
              </p>
              {log.notes && (
                <p className="mt-1 text-xs text-muted-foreground/80">
                  {log.notes}
                </p>
              )}
            </div>
            <button
              onClick={() => travelStore.removeLog(log.id)}
              className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              aria-label="Delete trip"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
