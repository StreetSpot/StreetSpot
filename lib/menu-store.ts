import { useSyncExternalStore } from "react"

export interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  category?: string
  available: boolean
}

const STORAGE_KEY = "streetspot_menu_items"

function loadItems(): MenuItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveItems(items: MenuItem[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

let items: MenuItem[] = []
let listeners: Array<() => void> = []
let initialized = false

function ensureInit() {
  if (!initialized && typeof window !== "undefined") {
    items = loadItems()
    initialized = true
  }
}

function emitChange() {
  for (const listener of listeners) listener()
}

export const menuStore = {
  subscribe(listener: () => void) {
    listeners = [...listeners, listener]
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  },
  getSnapshot(): MenuItem[] {
    ensureInit()
    return items
  },
  addItem(item: Omit<MenuItem, "id">) {
    ensureInit()
    const newItem: MenuItem = {
      ...item,
      id: `menu-${Date.now()}`,
    }
    items = [...items, newItem]
    saveItems(items)
    emitChange()
    return newItem
  },
  updateItem(id: string, updates: Partial<MenuItem>) {
    ensureInit()
    items = items.map((i) => (i.id === id ? { ...i, ...updates } : i))
    saveItems(items)
    emitChange()
  },
  removeItem(id: string) {
    ensureInit()
    items = items.filter((i) => i.id !== id)
    saveItems(items)
    emitChange()
  },
  toggleAvailable(id: string) {
    ensureInit()
    items = items.map((i) =>
      i.id === id ? { ...i, available: !i.available } : i
    )
    saveItems(items)
    emitChange()
  },
}

export function useMenuItems() {
  return useSyncExternalStore(
    menuStore.subscribe,
    menuStore.getSnapshot,
    () => []
  )
}
