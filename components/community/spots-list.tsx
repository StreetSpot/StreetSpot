"use client"

import { MapPin, Trash2, Navigation } from "lucide-react"
import {
  useCommunitySpots,
  communityStore,
  SPOT_TYPE_LABELS,
} from "@/lib/community-store"

export function SpotsList() {
  const spots = useCommunitySpots()

  if (spots.length === 0) {
    return (
      <div className="mb-6 rounded-xl border border-border bg-card p-5">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <MapPin className="h-4 w-4" />
          Community & Event Spots
        </h3>
        <p className="text-sm text-muted-foreground">
          No spots yet. Create one above to appear on the map.
        </p>
      </div>
    )
  }

  return (
    <div className="mb-6 rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <MapPin className="h-4 w-4" />
        Community & Event Spots ({spots.length})
      </h3>

      <div className="flex flex-col gap-3">
        {spots.map((spot) => (
          <div
            key={spot.id}
            className={`rounded-lg px-3 py-3 ${
              spot.isActive ? "bg-secondary" : "bg-secondary/50 opacity-60"
            }`}
          >
            <div className="mb-1 flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {spot.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {SPOT_TYPE_LABELS[spot.type]}
                  {spot.eventDate ? ` · ${spot.eventDate}` : ""} · by{" "}
                  {spot.createdBy}
                </p>
              </div>
              <button
                onClick={() => communityStore.removeSpot(spot.id)}
                className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            {spot.description && (
              <p className="mb-2 text-xs text-foreground/70">
                {spot.description}
              </p>
            )}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <Navigation className="h-3 w-3" />
              Navigate
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
