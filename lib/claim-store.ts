import { useEffect, useSyncExternalStore } from "react"
import {
  SEEDED_CLAIMABLE_VENDORS,
  type ClaimableVendor,
} from "./claimable-vendors"

const STORAGE_KEY = "streetspot_claimable_vendors"

function loadClaims(): ClaimableVendor[] {
  if (typeof window === "undefined") return SEEDED_CLAIMABLE_VENDORS.map((v): ClaimableVendor => ({ ...v, claimed: false }))
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed: ClaimableVendor[] = JSON.parse(raw)
      const existingIds = new Set(parsed.map((p) => p.id))
      const missing = SEEDED_CLAIMABLE_VENDORS.filter((s) => !existingIds.has(s.id)).map((s) => ({ ...s, claimed: false }))
      return [...parsed.map((vendor) => {
        const claimStatus = vendor.claimStatus ?? (vendor.claimed ? "PENDING_VERIFICATION" : "UNCLAIMED")
        return { ...vendor, claimStatus, claimed: claimStatus === "CLAIMED" }
      }), ...missing]
    }
  } catch {}
  return SEEDED_CLAIMABLE_VENDORS.map((v) => ({ ...v, claimed: false }))
}

function saveClaims(items: ClaimableVendor[]) {
  if (typeof window === "undefined") return
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch {}
}

let vendors: ClaimableVendor[] = []
let listeners: Array<() => void> = []
let initialized = false

function ensureInit() {
  if (!initialized && typeof window !== "undefined") {
    vendors = loadClaims()
    initialized = true
  }
}
function emitChange() { for (const listener of listeners) listener() }

export const claimStore = {
  subscribe(listener: () => void) {
    listeners = [...listeners, listener]
    return () => { listeners = listeners.filter((l) => l !== listener) }
  },
  getSnapshot(): ClaimableVendor[] { ensureInit(); return vendors },
  async refreshFromServer() {
    ensureInit()
    try {
      const response = await fetch("/api/vendor-candidates", { cache: "no-store" })
      if (!response.ok) return
      const payload = await response.json() as { vendors?: ClaimableVendor[] }
      if (!Array.isArray(payload.vendors)) return
      const previous = new Map(vendors.map((vendor) => [vendor.id, vendor]))
      vendors = payload.vendors.map((remote) => {
        const local = previous.get(remote.id)
        const pending = remote.claimStatus === "PENDING_VERIFICATION"
        return {
          ...remote,
          claimed: remote.claimStatus !== "UNCLAIMED",
          claimedBy: pending ? local?.claimedBy : undefined,
          claimedAt: pending ? local?.claimedAt : undefined,
        }
      })
      saveClaims(vendors)
      emitChange()
    } catch {
      // Keep the seed list available if the remote catalog is temporarily offline.
    }
  },
  claim(id: string, claimedBy: string) {
    ensureInit()
    vendors = vendors.map((v) => v.id === id && !v.claimed && v.claimStatus !== "PENDING_VERIFICATION"
      ? { ...v, claimed: false, claimStatus: "PENDING_VERIFICATION", claimedBy, claimedAt: Date.now() }
      : v)
    saveClaims(vendors)
    emitChange()
  },
  unclaim(id: string) {
    ensureInit()
    vendors = vendors.map((v) => v.id === id && v.claimStatus === "CLAIMED"
      ? { ...v, claimed: false, claimStatus: "UNCLAIMED", claimedBy: undefined, claimedAt: undefined }
      : v)
    saveClaims(vendors)
    emitChange()
  },
  getUnclaimed() {
    ensureInit()
    return vendors.filter((v) => !v.claimed && v.claimStatus !== "PENDING_VERIFICATION")
  },
  getClaimed() {
    ensureInit()
    return vendors.filter((v) => v.claimStatus === "CLAIMED")
  },
  search(query: string, filters?: { city?: string; state?: string; country?: string }) {
    ensureInit()
    const q = query.toLowerCase().trim()
    return vendors.filter((v) => {
      if (filters?.city && v.city?.toLowerCase() !== filters.city.toLowerCase()) return false
      if (filters?.state && v.state?.toLowerCase() !== filters.state.toLowerCase()) return false
      if (filters?.country && v.country?.toLowerCase() !== filters.country.toLowerCase()) return false
      if (!q) return true
      return v.name.toLowerCase().includes(q) || (v.cuisine && v.cuisine.toLowerCase().includes(q)) || (v.area && v.area.toLowerCase().includes(q)) || (v.city && v.city.toLowerCase().includes(q))
    })
  },
}

export function useClaimableVendors() {
  const snapshot = useSyncExternalStore(
    claimStore.subscribe,
    claimStore.getSnapshot,
    () => SEEDED_CLAIMABLE_VENDORS.map((v): ClaimableVendor => ({ ...v, claimed: false })),
  )
  useEffect(() => { void claimStore.refreshFromServer() }, [])
  return snapshot
}
