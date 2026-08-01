import { useSyncExternalStore } from "react"

/**
 * Gem / spot types.
 * - Skate types: open discovery (anyone can add; no exclusive claim required)
 * - Business/vendor types: anyone can pin as a "gem", but only the real owner can claim it
 */
export type SpotType =
  | "skate_park"
  | "skate_spot"
  | "food_truck"
  | "popup_cart"
  | "vendor"
  | "artisan"
  | "event"
  | "market"
  | "fair"
  | "block_party"
  | "flea_market"
  | "food_vendor"
  | "community"
  | "yard_sale"
  | "party"
  | "charity"
  | "graduation"
  | "other"

export interface CommunitySpot {
  id: string
  name: string
  type: SpotType
  description: string
  lat: number
  lng: number
  createdBy: string
  eventDate?: string
  isActive: boolean
  /** Non-skate gems start unclaimed; only the real owner should claim */
  claimed: boolean
  claimedBy?: string
  claimedAt?: number
  createdAt: number
}

const STORAGE_KEY = "streetspot_community_spots"

/** Skate areas are open gems — no exclusive owner claim required */
export function isSkateType(type: SpotType): boolean {
  return type === "skate_park" || type === "skate_spot"
}

/** Business-style gems anyone can discover, only owner can claim */
export function isClaimableGemType(type: SpotType): boolean {
  return !isSkateType(type)
}

function loadSpots(): CommunitySpot[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CommunitySpot[]
    // Backfill older spots missing claim fields
    return parsed.map((s) => ({
      ...s,
      claimed: s.claimed ?? isSkateType(s.type),
      claimedBy: s.claimedBy,
      claimedAt: s.claimedAt,
    }))
  } catch {
    return []
  }
}

function saveSpots(spots: CommunitySpot[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(spots))
}

let spots: CommunitySpot[] = []
let listeners: Array<() => void> = []
let initialized = false

function ensureInit() {
  if (!initialized && typeof window !== "undefined") {
    spots = loadSpots()
    initialized = true
  }
}

function emitChange() {
  for (const listener of listeners) listener()
}

export const communityStore = {
  subscribe(listener: () => void) {
    listeners = [...listeners, listener]
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  },
  getSnapshot(): CommunitySpot[] {
    ensureInit()
    return spots
  },
  addSpot(
    spot: Omit<
      CommunitySpot,
      "id" | "createdAt" | "isActive" | "claimed" | "claimedBy" | "claimedAt"
    >
  ) {
    ensureInit()
    const skate = isSkateType(spot.type)
    const newSpot: CommunitySpot = {
      ...spot,
      id: `spot-${Date.now()}`,
      isActive: true,
      // Skate gems are open; business gems start unclaimed so the real owner can claim
      claimed: skate,
      createdAt: Date.now(),
    }
    spots = [newSpot, ...spots]
    saveSpots(spots)
    emitChange()
    return newSpot
  },
  /** Only the actual owner of a non-skate gem should claim it */
  claimSpot(id: string, claimedBy: string) {
    ensureInit()
    spots = spots.map((s) => {
      if (s.id !== id) return s
      if (isSkateType(s.type)) return s // skate doesn't need exclusive claim
      if (s.claimed) return s
      return {
        ...s,
        claimed: true,
        claimedBy,
        claimedAt: Date.now(),
      }
    })
    saveSpots(spots)
    emitChange()
  },
  unclaimSpot(id: string) {
    ensureInit()
    spots = spots.map((s) =>
      s.id === id && isClaimableGemType(s.type)
        ? { ...s, claimed: false, claimedBy: undefined, claimedAt: undefined }
        : s
    )
    saveSpots(spots)
    emitChange()
  },
  removeSpot(id: string) {
    ensureInit()
    spots = spots.filter((s) => s.id !== id)
    saveSpots(spots)
    emitChange()
  },
  toggleActive(id: string) {
    ensureInit()
    spots = spots.map((s) =>
      s.id === id ? { ...s, isActive: !s.isActive } : s
    )
    saveSpots(spots)
    emitChange()
  },
  getUnclaimedGems() {
    ensureInit()
    return spots.filter((s) => isClaimableGemType(s.type) && !s.claimed)
  },
}

export function useCommunitySpots() {
  return useSyncExternalStore(
    communityStore.subscribe,
    communityStore.getSnapshot,
    () => []
  )
}

export const SPOT_TYPE_LABELS: Record<SpotType, string> = {
  skate_park: "Skate Park",
  skate_spot: "Skate Spot",
  food_truck: "Food Truck",
  popup_cart: "Pop-up Cart",
  vendor: "Vendor",
  artisan: "Artisan",
  event: "Event",
  market: "Market",
  fair: "Fair",
  block_party: "Block Party",
  flea_market: "Flea Market",
  food_vendor: "Food Vendor",
  community: "Community Spot",
  yard_sale: "Yard Sale",
  party: "Party / Gathering",
  charity: "Charity Drive",
  graduation: "Graduation",
  other: "Other Gem",
}
