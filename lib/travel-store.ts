import { useSyncExternalStore } from "react"

export interface TravelLog {
  id: string
  startAddress: string
  destination: string
  mileage: number
  fuel: number
  parking: number
  tolls: number
  notes?: string
  tripDate: string
  createdAt: number
}

const STORAGE_KEY = "streetspot_travel_logs"

function loadLogs(): TravelLog[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLogs(logs: TravelLog[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs))
}

let logs: TravelLog[] = []
let listeners: Array<() => void> = []
let initialized = false

function ensureInit() {
  if (!initialized && typeof window !== "undefined") {
    logs = loadLogs()
    initialized = true
  }
}

function emitChange() {
  for (const listener of listeners) listener()
}

export const travelStore = {
  subscribe(listener: () => void) {
    listeners = [...listeners, listener]
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  },
  getSnapshot(): TravelLog[] {
    ensureInit()
    return logs
  },
  addLog(log: Omit<TravelLog, "id" | "createdAt">) {
    ensureInit()
    const newLog: TravelLog = {
      ...log,
      id: `travel-${Date.now()}`,
      createdAt: Date.now(),
    }
    logs = [newLog, ...logs]
    saveLogs(logs)
    emitChange()
    return newLog
  },
  updateLog(id: string, updates: Partial<TravelLog>) {
    ensureInit()
    logs = logs.map((l) => (l.id === id ? { ...l, ...updates } : l))
    saveLogs(logs)
    emitChange()
  },
  removeLog(id: string) {
    ensureInit()
    logs = logs.filter((l) => l.id !== id)
    saveLogs(logs)
    emitChange()
  },
  getTotals() {
    ensureInit()
    return logs.reduce(
      (acc, log) => ({
        mileage: acc.mileage + (log.mileage || 0),
        fuel: acc.fuel + (log.fuel || 0),
        parking: acc.parking + (log.parking || 0),
        tolls: acc.tolls + (log.tolls || 0),
      }),
      { mileage: 0, fuel: 0, parking: 0, tolls: 0 }
    )
  },
}

export function useTravelLogs() {
  return useSyncExternalStore(
    travelStore.subscribe,
    travelStore.getSnapshot,
    () => []
  )
}

export function useTravelTotals() {
  const logs = useTravelLogs()
  return logs.reduce(
    (acc, log) => ({
      mileage: acc.mileage + (log.mileage || 0),
      fuel: acc.fuel + (log.fuel || 0),
      parking: acc.parking + (log.parking || 0),
      tolls: acc.tolls + (log.tolls || 0),
    }),
    { mileage: 0, fuel: 0, parking: 0, tolls: 0 }
  )
}
