"use client"

import { useState } from "react"
import { MapPin, Trash2, Navigation, BadgeCheck } from "lucide-react"
import {
  useCommunitySpots,
  communityStore,
  SPOT_TYPE_LABELS,
  isClaimableGemType,
  type SpotType,
} from "@/lib/community-store"

interface SpotsListProps {
  filterType?: SpotType
}

export function SpotsList({ filterType }: SpotsListProps) {
  const spots = useCommunitySpots()
  const [claimName, setClaimName] = useState("")
  const [claimingId, setClaimingId] = useState<string | null>(null)

  const visible = filterType
    ? spots.filter((s) => s.type === filterType)
    : spots

  if (spots.length === 0) {
    return (
      <div className="mb-6 rounded-xl border border-dashed border-border bg-card/50 p-6 text-center">
        <MapPin className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
        <h3 className="mb-1 text-sm font-semibold text-foreground">
          No gems yet
        </h3>
        <p className="text-xs text-muted-foreground">
          Be first — pin a food truck, skate park, market, or event at your
          location above.
        </p>
      </div>
    )
  }

  if (visible.length === 0) {
    return (
      <div className="mb-6 rounded-xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">
          No gems match this filter. Try &quot;All&quot; or pin a new one.
        </p>
      </div>
    )
  }

  function handleClaim(id: string) {
    if (!claimName.trim()) return
    communityStore.claimSpot(id, claimName.trim())
    setClaimingId(null)
    setClaimName("")
  }

  return (
    <div className="mb-6 rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <MapPin className="h-4 w-4" />
        Discovered gems ({visible.length})
      </h3>

      <div className="flex flex-col gap-3">
        {visible.map((spot) => (
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
                  {spot.claimed && isClaimableGemType(spot.type) && (
                    <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-400">
                      <BadgeCheck className="h-3 w-3" />
                      Claimed
                    </span>
                  )}
                  {isClaimableGemType(spot.type) && !spot.claimed && (
                    <span className="ml-1.5 text-[10px] font-semibold text-amber-400">
                      Unclaimed
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {SPOT_TYPE_LABELS[spot.type]}
                  {spot.eventDate ? ` · ${spot.eventDate}` : ""} · spotted by{" "}
                  {spot.createdBy}
                  {spot.claimedBy ? ` · claimed by ${spot.claimedBy}` : ""}
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
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <Navigation className="h-3 w-3" />
                Navigate
              </a>
              {isClaimableGemType(spot.type) && !spot.claimed && (
                <button
                  onClick={() =>
                    setClaimingId(claimingId === spot.id ? null : spot.id)
                  }
                  className="text-xs font-medium text-amber-400 hover:underline"
                >
                  Claim this spot
                </button>
              )}
            </div>
            {claimingId === spot.id && (
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={claimName}
                  onChange={(e) => setClaimName(e.target.value)}
                  placeholder="Your business / owner name"
                  className="h-9 flex-1 rounded-lg border border-border bg-input px-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <button
                  onClick={() => handleClaim(spot.id)}
                  className="rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground"
                >
                  Claim
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
