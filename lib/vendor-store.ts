import { useSyncExternalStore } from "react"

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

// Production starts empty until a verified vendor is added by the active data layer.
// This prevents demo businesses or unrelated coordinates from appearing as real listings.
let vendors: Vendor[] = []

let listeners: Array<() => void> = []

function emitChange() {
  for (const listener of listeners) {
    listener()
  }
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
    const now = new Date()
    return vendors.filter((v) => {
      if (!v.isLive) return false
      const [hours, minutes] = v.closingTime.split(":").map(Number)
      const closingDate = new Date()
      closingDate.setHours(hours, minutes, 0, 0)
      // If closing time is earlier than current time and more than 1 hour in the past
      // assume it was for today and has passed
      return now < closingDate
    })
  },
}

export function useVendors() {
  return useSyncExternalStore(vendorStore.subscribe, vendorStore.getSnapshot, vendorStore.getSnapshot)
}

export function useActiveVendors() {
  const allVendors = useVendors()
  const now = new Date()
  return allVendors.filter((v) => {
    if (!v.isLive) return false
    const [hours, minutes] = v.closingTime.split(":").map(Number)
    const closingDate = new Date()
    closingDate.setHours(hours, minutes, 0, 0)
    return now < closingDate
  })
}
