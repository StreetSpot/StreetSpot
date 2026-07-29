import { useSyncExternalStore } from "react"

export interface Review {
  id: string
  vendorId: string
  vendorName: string
  rating: number // 1-5
  comment: string
  authorName: string
  createdAt: number
}

const STORAGE_KEY = "streetspot_reviews"

function loadReviews(): Review[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveReviews(reviews: Review[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews))
}

let reviews: Review[] = []
let listeners: Array<() => void> = []
let initialized = false

function ensureInit() {
  if (!initialized && typeof window !== "undefined") {
    reviews = loadReviews()
    initialized = true
  }
}

function emitChange() {
  for (const listener of listeners) listener()
}

export const reviewStore = {
  subscribe(listener: () => void) {
    listeners = [...listeners, listener]
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  },
  getSnapshot(): Review[] {
    ensureInit()
    return reviews
  },
  addReview(review: Omit<Review, "id" | "createdAt">) {
    ensureInit()
    const newReview: Review = {
      ...review,
      id: `review-${Date.now()}`,
      createdAt: Date.now(),
    }
    reviews = [newReview, ...reviews]
    saveReviews(reviews)
    emitChange()
    return newReview
  },
  removeReview(id: string) {
    ensureInit()
    reviews = reviews.filter((r) => r.id !== id)
    saveReviews(reviews)
    emitChange()
  },
  getByVendor(vendorId: string) {
    ensureInit()
    return reviews.filter((r) => r.vendorId === vendorId)
  },
  getAverage(vendorId: string) {
    ensureInit()
    const vendorReviews = reviews.filter((r) => r.vendorId === vendorId)
    if (vendorReviews.length === 0) return 0
    const sum = vendorReviews.reduce((acc, r) => acc + r.rating, 0)
    return sum / vendorReviews.length
  },
}

export function useReviews() {
  return useSyncExternalStore(
    reviewStore.subscribe,
    reviewStore.getSnapshot,
    () => []
  )
}

export function useVendorReviews(vendorId: string) {
  const all = useReviews()
  return all.filter((r) => r.vendorId === vendorId)
}
