import { useSyncExternalStore } from "react"

export interface ParkingSpot {
  id: string
  lat: number
  lng: number
  label?: string
  savedAt: number
}

const STORAGE_KEY = "streetspot_parking_spots"
const LEGACY_KEY = "streetspot_parking"

function loadSpots(): ParkingSpot[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
    // migrate single-spot legacy
    const legacy = localStorage.getItem(LEGACY_KEY)
    if (legacy) {
      const one = JSON.parse(legacy) as { lat: number; lng: number; label?: string; savedAt: number }
      const migrated: ParkingSpot[] = [
        {
          id: `park-${one.savedAt || Date.now()}`,
          lat: one.lat,
          lng: one.lng,
          label: one.label,
          savedAt: one.savedAt || Date.now(),
        },
      ]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated))
      localStorage.removeItem(LEGACY_KEY)
      return migrated
    }
    return []
  } catch {
    return []
  }
}

function saveSpots(spots: ParkingSpot[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(spots))
}

let spots: ParkingSpot[] = []
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

export const parkingStore = {
  subscribe(listener: () => void) {
    listeners = [...listeners, listener]
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  },
  /** Latest spot for backward compat with useParking() single-spot UI */
  getSnapshot(): ParkingSpot | null {
    ensureInit()
    return spots[0] ?? null
  },
  getAll(): ParkingSpot[] {
    ensureInit()
    return spots
  },
  save(spot: Omit<ParkingSpot, "id" | "savedAt">) {
    ensureInit()
    const newSpot: ParkingSpot = {
      ...spot,
      id: `park-${Date.now()}`,
      savedAt: Date.now(),
    }
    // newest first; keep max 5
    spots = [newSpot, ...spots].slice(0, 5)
    saveSpots(spots)
    emitChange()
    return newSpot
  },
  remove(id: string) {
    ensureInit()
    spots = spots.filter((s) => s.id !== id)
    saveSpots(spots)
    emitChange()
  },
  clear() {
    ensureInit()
    spots = []
    saveSpots(spots)
    emitChange()
  },
}

export function useParking() {
  return useSyncExternalStore(
    parkingStore.subscribe,
    parkingStore.getSnapshot,
    () => null
  )
}

export function useParkingSpots() {
  return useSyncExternalStore(
    parkingStore.subscribe,
    () => parkingStore.getAll(),
    () => [] as ParkingSpot[]
  )
}
