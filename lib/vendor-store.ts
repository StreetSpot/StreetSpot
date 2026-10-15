import { useEffect, useSyncExternalStore } from "react"

export interface Vendor {
  id: string
  name: string
  description: string
  lat: number
  lng: number
  closingTime: string // HH:mm format
  isLive: boolean
  isPremium: boolean
  createdAt: number
}

export function getMinutesRemaining(closingTime: string): number {
  const now = new Date()
  const [hours, minutes] = closingTime.split(":").map(Number)
  const closing = new Date()
  closing.setHours(hours, minutes, 0, 0)
  return Math.max(0, Math.floor((closing.getTime() - now.getTime()) / 60000))
}

// The map reads durable vendor records from the production API. Local writes are
// still supported for the current dashboard UI until authenticated publishing is wired.
let vendors: Vendor[] = []
let listeners: Array<() => void> = []
let loadStarted = false
let vendorLoadStatus: "loading" | "ready" | "unavailable" = "loading"

function emitChange() {
  for (const listener of listeners) listener()
}

async function loadVendors() {
  try {
    const response = await fetch("/api/vendors", { cache: "no-store" })
    if (!response.ok) {
      vendorLoadStatus = "unavailable"
      emitChange()
      return
    }
    const payload = (await response.json()) as { vendors?: Vendor[] }
    if (!Array.isArray(payload.vendors)) {
      vendorLoadStatus = "unavailable"
      emitChange()
      return
    }
    vendors = payload.vendors
    vendorLoadStatus = "ready"
    emitChange()
  } catch {
    // Keep the map usable while making the unavailable backend visible in the UI.
    vendorLoadStatus = "unavailable"
    emitChange()
  }
}

function startVendorLoading() {
  if (loadStarted || typeof window === "undefined") return
  loadStarted = true
  void loadVendors()
}

export const vendorStore = {
  subscribe(listener: () => void) {
    listeners = [...listeners, listener]
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  },
  getSnapshot(): Vendor[] {
    return vendors
  },
  getLoadStatus(): "loading" | "ready" | "unavailable" {
    return vendorLoadStatus
  },
  addVendor(vendor: Vendor) {
    vendors = [...vendors, vendor]
    emitChange()
  },
  updateVendor(id: string, updates: Partial<Vendor>) {
    vendors = vendors.map((v) => (v.id === id ? { ...v, ...updates } : v))
    emitChange()
  },
  removeVendor(id: string) {
    vendors = vendors.filter((v) => v.id !== id)
    emitChange()
  },
  getActiveVendors(): Vendor[] {
    return vendors.filter((v) => v.isLive && getMinutesRemaining(v.closingTime) > 0)
  },
}

export function useVendors() {
  const snapshot = useSyncExternalStore(vendorStore.subscribe, vendorStore.getSnapshot, vendorStore.getSnapshot)
  useEffect(() => {
    startVendorLoading()
    const interval = window.setInterval(() => void loadVendors(), 30000)
    return () => window.clearInterval(interval)
  }, [])
  return snapshot
}

export function useVendorLoadStatus() {
  const status = useSyncExternalStore(
    vendorStore.subscribe,
    vendorStore.getLoadStatus,
    () => "loading" as const
  )
  useEffect(() => {
    startVendorLoading()
  }, [])
  return status
}

export function useActiveVendors() {
  const allVendors = useVendors()
  return allVendors.filter((v) => v.isLive && getMinutesRemaining(v.closingTime) > 0)
}
