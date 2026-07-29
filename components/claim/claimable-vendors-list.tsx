"use client"

import { useState } from "react"
import { Search, Check, MapPin } from "lucide-react"
import { useClaimableVendors, claimStore } from "@/lib/claim-store"

interface ClaimableVendorsListProps {
  /** Name of the logged-in vendor / business claiming the spot */
  claimerName?: string
}

export function ClaimableVendorsList({ claimerName }: ClaimableVendorsListProps) {
  const vendors = useClaimableVendors()
  const [query, setQuery] = useState("")
  const [justClaimed, setJustClaimed] = useState<string | null>(null)

  const filtered = query.trim()
    ? claimStore.search(query)
    : vendors

  const unclaimed = filtered.filter((v) => !v.claimed)
  const claimed = filtered.filter((v) => v.claimed)

  function handleClaim(id: string, name: string) {
    const who = claimerName?.trim() || "Vendor"
    claimStore.claim(id, who)
    setJustClaimed(id)
    setTimeout(() => setJustClaimed(null), 2500)
  }

  return (
    <div className="mb-6 rounded-xl border border-border bg-card p-5">
      <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Claim Your Spot
      </h3>
      <p className="mb-4 text-xs text-muted-foreground">
        Search for your business name below. If it’s listed, claim it so the map
        isn’t empty and you own your pin.
      </p>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, cuisine, or area..."
          className="h-10 w-full rounded-lg border border-border bg-input pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Unclaimed */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Available to claim ({unclaimed.length})
        </p>
        {unclaimed.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {query
              ? "No matching unclaimed names. Try a different search."
              : "All seeded names have been claimed."}
          </p>
        ) : (
          <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
            {unclaimed.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between gap-3 rounded-lg bg-secondary px-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {v.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[v.cuisine, v.area].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <button
                  onClick={() => handleClaim(v.id, v.name)}
                  className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  {justClaimed === v.id ? (
                    <span className="flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" />
                      Claimed
                    </span>
                  ) : (
                    "Claim"
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Already claimed (collapsed summary) */}
      {claimed.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Already claimed ({claimed.length})
          </p>
          <div className="flex max-h-40 flex-col gap-1.5 overflow-y-auto">
            {claimed.map((v) => (
              <div
                key={v.id}
                className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2 opacity-70"
              >
                <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">{v.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    Claimed by {v.claimedBy || "Vendor"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
