"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Check, MapPin } from "lucide-react"
import { useClaimableVendors, claimStore } from "@/lib/claim-store"

interface ClaimableVendorsListProps {
  /** Name of the logged-in vendor / business claiming the spot */
  claimerName?: string
}

export function ClaimableVendorsList({ claimerName }: ClaimableVendorsListProps) {
  const router = useRouter()
  const vendors = useClaimableVendors()
  const [query, setQuery] = useState("")
  const [justClaimed, setJustClaimed] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const filtered = query.trim()
    ? claimStore.search(query)
    : vendors

  const unclaimed = filtered.filter((v) => !v.claimed && v.claimStatus !== "PENDING_VERIFICATION")
  const claimed = filtered.filter((v) => v.claimStatus === "CLAIMED")

  async function handleClaim(id: string) {
    if (busyId) return
    const who = claimerName?.trim() || "Vendor"
    setBusyId(id)
    setErrorMessage(null)
    try {
      const response = await fetch("/api/vendor/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId: id, note: "Claim request submitted by " + who }),
      })
      const result = await response.json().catch(() => ({})) as { ok?: boolean; code?: string }
      if (response.status === 401) {
        router.push("/account?next=" + encodeURIComponent("/vendor-studio"))
        return
      }
      if (!response.ok) {
        const messages: Record<string, string> = {
          VENDOR_ALREADY_CLAIMED: "This listing already has an owner.",
          CLAIM_PENDING_REVIEW: "A claim for this listing is already under review.",
          CLAIM_ALREADY_EXISTS: "Your claim is already on file.",
          VENDOR_NOT_FOUND: "This candidate is no longer available. Refresh the list.",
        }
        setErrorMessage(messages[result.code ?? ""] ?? "StreetSpot could not submit this claim. Try again.")
        await claimStore.refreshFromServer()
        return
      }
      claimStore.claim(id, who)
      await claimStore.refreshFromServer()
      setJustClaimed(id)
      setTimeout(() => setJustClaimed(null), 2500)
    } catch {
      setErrorMessage("StreetSpot could not reach the claim service. No ownership was changed.")
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="mb-6 rounded-xl border border-border bg-card p-5">
      <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Claim Your Spot
      </h3>
      <p className="mb-4 text-xs text-muted-foreground">
        Request a review for an existing listing. Claims are sent to StreetSpot for verification; ownership is not transferred until staff approves the request.
      </p>

      {errorMessage && <p role="alert" className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">{errorMessage}</p>}

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
              : "There are no unreviewed listings in this local catalog."}
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
                  onClick={() => void handleClaim(v.id)}
                  disabled={busyId !== null}
                  className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
                >
                  {justClaimed === v.id ? (
                    <span className="flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" />
                      Request recorded
                    </span>
                  ) : busyId === v.id ? (
                    "Submitting…"
                  ) : (
                    "Request review"
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {filtered.some((v) => v.claimStatus === "PENDING_VERIFICATION") && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium text-amber-400">Pending verification</p>
          {filtered.filter((v) => v.claimStatus === "PENDING_VERIFICATION").map((vendor) => (
            <p key={vendor.id} className="text-sm text-muted-foreground">{vendor.name} · Awaiting StreetSpot verification</p>
          ))}
        </div>
      )}

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
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[#f06435]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">{v.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    Verified owner
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
