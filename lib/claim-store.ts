import { useSyncExternalStore } from "react"
import {
  SEEDED_CLAIMABLE_VENDORS,
  type ClaimableVendor,
} from "./claimable-vendors"

const STORAGE_KEY = "streetspot_claimable_vendors"

function loadClaims(): ClaimableVendor[] {
  if (typeof window === "undefined") {
    return SEEDED_CLAIMABLE_VENDORS.map((v) => ({ ...v, claimed: false }))
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed: ClaimableVendor[] = JSON.parse(raw)
      const existingIds = new Set(parsed.map((p) => p.id))
      const missing = SEEDED_CLAIMABLE_VENDORS.filter(
        (s) => !existingIds.has(s.id)
      ).map((s) => ({ ...s, claimed: false }))
      return [...parsed, ...missing]
    }
  } catch {}
  return SEEDED_CLAIMABLE_VENDORS.map((v) => ({ ...v, claimed: false }))
}

function saveClaims(vendors: ClaimableVendor[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vendors))
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

function emitChange() {
  for (const listener of listeners) listener()
}

export const claimStore = {
  subscribe(listener: () => void) {
    listeners = [...listeners, listener]
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  },
  getSnapshot(): ClaimableVendor[] {
    ensureInit()
    return vendors
  },
  claim(id: string, claimedBy: string) {
    ensureInit()
    vendors = vendors.map((v) =>
      v.id === id && !v.claimed
        ? { ...v, claimed: true, claimedBy, claimedAt: Date.now() }
        : v
    )
    saveClaims(vendors)
    emitChange()
  },
  unclaim(id: string) {
    ensureInit()
    vendors = vendors.map((v) =>
      v.id === id
        ? { ...v, claimed: false, claimedBy: undefined, claimedAt: undefined }
        : v
    )
    saveClaims(vendors)
    emitChange()
  },
  getUnclaimed() {
    ensureInit()
    return vendors.filter((v) => !v.claimed)
  },
  getClaimed() {
    ensureInit()
    return vendors.filter((v) => v.claimed)
  },
  /**
   * Client-side search. Ready to swap for a remote API later
   * (e.g. Supabase full-text search by name + city + country).
   */
  search(query: string, filters?: { city?: string; state?: string; country?: string }) {
    ensureInit()
    const q = query.toLowerCase().trim()
    return vendors.filter((v) => {
      if (filters?.city && v.city?.toLowerCase() !== filters.city.toLowerCase()) return false
      if (filters?.state && v.state?.toLowerCase() !== filters.state.toLowerCase()) return false
      if (filters?.country && v.country?.toLowerCase() !== filters.country.toLowerCase()) return false
      if (!q) return true
      return (
        v.name.toLowerCase().includes(q) ||
        (v.cuisine && v.cuisine.toLowerCase().includes(q)) ||
        (v.area && v.area.toLowerCase().includes(q)) ||
        (v.city && v.city.toLowerCase().includes(q))
      )
    })
  },
}

export function useClaimableVendors() {
  return useSyncExternalStore(
    claimStore.subscribe,
    claimStore.getSnapshot,
    () => SEEDED_CLAIMABLE_VENDORS.map((v) => ({ ...v, claimed: false }))
  )
}
