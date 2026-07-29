import { useSyncExternalStore } from "react"

export interface Favorite {
  id: string
  vendorId: string
  vendorName: string
  description?: string
  addedAt: number
}

const STORAGE_KEY = "streetspot_favorites"

function loadFavorites(): Favorite[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveFavorites(favorites: Favorite[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
}

let favorites: Favorite[] = []
let listeners: Array<() => void> = []
let initialized = false

function ensureInit() {
  if (!initialized && typeof window !== "undefined") {
    favorites = loadFavorites()
    initialized = true
  }
}

function emitChange() {
  for (const listener of listeners) listener()
}

export const favoritesStore = {
  subscribe(listener: () => void) {
    listeners = [...listeners, listener]
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  },
  getSnapshot(): Favorite[] {
    ensureInit()
    return favorites
  },
  add(favorite: Omit<Favorite, "id" | "addedAt">) {
    ensureInit()
    if (favorites.some((f) => f.vendorId === favorite.vendorId)) return
    const newFav: Favorite = {
      ...favorite,
      id: `fav-${Date.now()}`,
      addedAt: Date.now(),
    }
    favorites = [newFav, ...favorites]
    saveFavorites(favorites)
    emitChange()
    return newFav
  },
  remove(vendorId: string) {
    ensureInit()
    favorites = favorites.filter((f) => f.vendorId !== vendorId)
    saveFavorites(favorites)
    emitChange()
  },
  isFavorited(vendorId: string) {
    ensureInit()
    return favorites.some((f) => f.vendorId === vendorId)
  },
  toggle(favorite: Omit<Favorite, "id" | "addedAt">) {
    ensureInit()
    if (favorites.some((f) => f.vendorId === favorite.vendorId)) {
      favorites = favorites.filter((f) => f.vendorId !== favorite.vendorId)
    } else {
      const newFav: Favorite = {
        ...favorite,
        id: `fav-${Date.now()}`,
        addedAt: Date.now(),
      }
      favorites = [newFav, ...favorites]
    }
    saveFavorites(favorites)
    emitChange()
  },
}

export function useFavorites() {
  return useSyncExternalStore(
    favoritesStore.subscribe,
    favoritesStore.getSnapshot,
    () => []
  )
}
