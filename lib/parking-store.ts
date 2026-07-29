import { useSyncExternalStore } from "react"

export interface ParkingSpot {
  lat: number
  lng: number
  label?: string
  savedAt: number
}

const STORAGE_KEY = "streetspot_parking"

function loadParking(): ParkingSpot | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveParking(spot: ParkingSpot | null) {
  if (typeof window === "undefined") return
  if (spot) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(spot))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

let parking: ParkingSpot | null = null
let listeners: Array<() => void> = []
let initialized = false

function ensureInit() {
  if (!initialized && typeof window !== "undefined") {
    parking = loadParking()
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
  getSnapshot(): ParkingSpot | null {
    ensureInit()
    return parking
  },
  save(spot: Omit<ParkingSpot, "savedAt">) {
    ensureInit()
    parking = { ...spot, savedAt: Date.now() }
    saveParking(parking)
    emitChange()
  },
  clear() {
    ensureInit()
    parking = null
    saveParking(null)
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
