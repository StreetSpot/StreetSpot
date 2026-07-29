import { useSyncExternalStore } from "react"

export type BookingStatus = "pending" | "accepted" | "declined" | "completed" | "cancelled"

export interface Booking {
  id: string
  vendorId: string
  vendorName: string
  customerName: string
  customerContact?: string
  eventDate: string
  eventTime?: string
  location: string
  notes?: string
  status: BookingStatus
  createdAt: number
}

const STORAGE_KEY = "streetspot_bookings"

function loadBookings(): Booking[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveBookings(bookings: Booking[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings))
}

let bookings: Booking[] = []
let listeners: Array<() => void> = []
let initialized = false

function ensureInit() {
  if (!initialized && typeof window !== "undefined") {
    bookings = loadBookings()
    initialized = true
  }
}

function emitChange() {
  for (const listener of listeners) listener()
}

export const bookingStore = {
  subscribe(listener: () => void) {
    listeners = [...listeners, listener]
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  },
  getSnapshot(): Booking[] {
    ensureInit()
    return bookings
  },
  addBooking(booking: Omit<Booking, "id" | "createdAt" | "status">) {
    ensureInit()
    const newBooking: Booking = {
      ...booking,
      id: `booking-${Date.now()}`,
      status: "pending",
      createdAt: Date.now(),
    }
    bookings = [newBooking, ...bookings]
    saveBookings(bookings)
    emitChange()
    return newBooking
  },
  updateStatus(id: string, status: BookingStatus) {
    ensureInit()
    bookings = bookings.map((b) => (b.id === id ? { ...b, status } : b))
    saveBookings(bookings)
    emitChange()
  },
  removeBooking(id: string) {
    ensureInit()
    bookings = bookings.filter((b) => b.id !== id)
    saveBookings(bookings)
    emitChange()
  },
}

export function useBookings() {
  return useSyncExternalStore(
    bookingStore.subscribe,
    bookingStore.getSnapshot,
    () => []
  )
}
