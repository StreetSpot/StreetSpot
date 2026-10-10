"use client"

import {
  Store,
  Search,
  ArrowRight,
  MapPin,
  Zap,
  Users,
  Gem,
  MessageCircle,
} from "lucide-react"

interface RoleSelectorProps {
  onSelect: (role: "founder" | "finder") => void
}

export function RoleSelector({ onSelect }: RoleSelectorProps) {
  return (
    <div className="flex min-h-[calc(100dvh-57px)] flex-col items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-10 text-center">
          <div className="mb-6 flex items-center justify-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <MapPin className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="mb-3 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Find street vendors. Pin gems. Go live.
          </h1>
          <p className="mx-auto max-w-md text-pretty text-base leading-relaxed text-muted-foreground">
            Live map for food trucks, carts, markets, skate spots, and more.
            Vendors go live in one tap. Anyone can discover new gems.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span>Real-time GPS</span>
          </div>
          <div className="flex items-center gap-2">
            <Gem className="h-4 w-4 text-primary" />
            <span>Gem discovery</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            <span>Mutual messaging</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span>Claim your spot</span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <button
            onClick={() => onSelect("founder")}
            className="group relative flex flex-col items-start gap-4 rounded-xl border border-border bg-card p-6 text-left transition-all hover:border-primary/50 hover:bg-secondary/50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Store className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="mb-1 text-lg font-semibold text-foreground">
                I&apos;m a Vendor
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Go live, claim your gem, menus, bookings, tax mileage, and
                Premier pins.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
              <span>Open Dashboard</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>

          <button
            onClick={() => onSelect("finder")}
            className="group relative flex flex-col items-start gap-4 rounded-xl border border-border bg-card p-6 text-left transition-all hover:border-primary/50 hover:bg-secondary/50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="mb-1 text-lg font-semibold text-foreground">
                I&apos;m Exploring
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Live map, pin new gems, save parking, track trips, message
                vendors (with consent).
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
              <span>Open Map</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          No account required to explore. Vendors: go live in under a minute.
        </p>
      </div>
    </div>
  )
}
