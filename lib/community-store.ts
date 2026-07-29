import { useSyncExternalStore } from "react"

export type SpotType =
  | "skate"
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
  createdAt: number
}

const STORAGE_KEY = "streetspot_community_spots"

function loadSpots(): CommunitySpot[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
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
  addSpot(spot: Omit<CommunitySpot, "id" | "createdAt" | "isActive">) {
    ensureInit()
    const newSpot: CommunitySpot = {
      ...spot,
      id: `spot-${Date.now()}`,
      isActive: true,
      createdAt: Date.now(),
    }
    spots = [newSpot, ...spots]
    saveSpots(spots)
    emitChange()
    return newSpot
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
}

export function useCommunitySpots() {
  return useSyncExternalStore(
    communityStore.subscribe,
    communityStore.getSnapshot,
    () => []
  )
}

export const SPOT_TYPE_LABELS: Record<SpotType, string> = {
  skate: "Skate Spot",
  community: "Community Spot",
  yard_sale: "Yard Sale",
  party: "Party / Gathering",
  charity: "Charity Drive",
  graduation: "Graduation",
  other: "Other Event",
}
