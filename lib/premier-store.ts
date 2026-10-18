import { useSyncExternalStore } from "react"

export type PremierTier = "none" | "bronze" | "silver" | "gold"

export interface PremierState {
  tier: PremierTier
  activatedAt: number | null
}

const STORAGE_KEY = "streetspot_premier_status"

const TIER_ORDER: Record<PremierTier, number> = {
  none: 0,
  bronze: 1,
  silver: 2,
  gold: 3,
}

export const PREMIER_TIERS = [
  {
    id: "bronze" as const,
    name: "Bronze",
    price: "$9.99",
    period: "/mo",
    stripeUrl: "https://buy.stripe.com/7sYdRb77I9hCdzSf281VK07",
    features: [
      "Bronze badge on pin",
      "Priority listing boost",
      "Basic analytics",
    ],
    color: "from-amber-700 to-amber-600",
    ring: "ring-amber-700/40",
    bg: "bg-amber-700/15",
  },
  {
    id: "silver" as const,
    name: "Silver",
    price: "$24.99",
    period: "/mo",
    stripeUrl: "https://buy.stripe.com/bJe7sNcs28dy3ZibPW1VK08",
    features: [
      "Silver badge + glow",
      "Higher map placement",
      "Menu highlight",
      "Customer favorites boost",
    ],
    color: "from-slate-400 to-slate-300",
    ring: "ring-slate-400/40",
    bg: "bg-slate-400/15",
  },
  {
    id: "gold" as const,
    name: "Gold",
    price: "$49.99",
    period: "/mo",
    stripeUrl: "https://buy.stripe.com/14A8wR77IdxScvObPW1VK09",
    features: [
      "Pulsing gold pin",
      "Top-of-map placement",
      "Featured vendor badge",
      "Priority in search",
      "Full analytics suite",
    ],
    color: "from-amber-500 to-amber-400",
    ring: "ring-amber-500/40",
    bg: "bg-amber-500/15",
  },
]

function loadState(): PremierState {
  // A browser-stored tier is not proof of a paid Stripe subscription.
  // Clear legacy local activation and remain inactive until server verification exists.
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
  }
  return { tier: "none", activatedAt: null }
}

let state: PremierState = { tier: "none", activatedAt: null }
let listeners: Array<() => void> = []
let initialized = false

function ensureInit() {
  if (!initialized && typeof window !== "undefined") {
    state = loadState()
    initialized = true
  }
}

function emitChange() {
  for (const listener of listeners) listener()
}

export const premierStore = {
  subscribe(listener: () => void) {
    listeners = [...listeners, listener]
    return () => {
      listeners = listeners.filter((l) => l !== listener)
    }
  },
  getSnapshot(): PremierState {
    ensureInit()
    return state
  },
  setTier(tier: PremierTier) {
    ensureInit()
    if (tier !== "none") return
    state = { tier: "none", activatedAt: null }
    if (typeof window !== "undefined") {
      try { localStorage.removeItem(STORAGE_KEY) } catch {}
    }
    emitChange()
  },
  setVerifiedTier(tier: PremierTier) {
    ensureInit()
    // This is only a display snapshot from the authenticated server endpoint.
    // Server-side RPC checks remain the authority for publishing and paid features.
    state = { tier, activatedAt: tier === "none" ? null : Date.now() }
    emitChange()
  },
  isAtLeast(tier: PremierTier) {
    ensureInit()
    return TIER_ORDER[state.tier] >= TIER_ORDER[tier]
  },
}

export function usePremier() {
  return useSyncExternalStore(
    premierStore.subscribe,
    premierStore.getSnapshot,
    () => ({ tier: "none" as const, activatedAt: null })
  )
}
