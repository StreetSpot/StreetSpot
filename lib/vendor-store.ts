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

let vendors: Vendor[] = [
  {
    id: "demo-1",
    name: "Taco Royale",
    description: "Authentic street tacos & burritos. Fresh salsas daily.",
    lat: 40.7128,
    lng: -74.006,
    closingTime: "23:00",
    isLive: true,
    isPremium: true,
    createdAt: Date.now() - 3600000,
  },
  {
    id: "demo-2",
    name: "Boba Bliss",
    description: "Premium bubble tea & fruit smoothies.",
    lat: 40.7148,
    lng: -74.002,
    closingTime: "22:00",
    isLive: true,
    isPremium: false,
    createdAt: Date.now() - 7200000,
  },
  {
    id: "demo-3",
    name: "Seoul Grill",
    description: "Korean BBQ skewers & kimchi fries.",
    lat: 40.711,
    lng: -74.009,
    closingTime: "21:30",
    isLive: true,
    isPremium: false,
    createdAt: Date.now() - 1800000,
  },
]

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
