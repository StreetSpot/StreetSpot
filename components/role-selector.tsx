"use client"

import { Store, Search, ArrowRight, MapPin, Zap, Users } from "lucide-react"

interface RoleSelectorProps {
  onSelect: (role: "founder" | "finder") => void
}

export function RoleSelector({ onSelect }: RoleSelectorProps) {
  return (
    <div className="flex min-h-[calc(100dvh-57px)] flex-col items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-2xl">
        {/* Hero section */}
        <div className="mb-12 text-center">
          <div className="mb-6 flex items-center justify-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <MapPin className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <h1 className="mb-3 text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Discover Street Vendors in Real Time
          </h1>
          <p className="mx-auto max-w-md text-pretty text-base leading-relaxed text-muted-foreground">
            Whether you sell or search, StreetSpot puts you on the map.
            Choose your role to get started.
          </p>
        </div>

        {/* Stats bar */}
        <div className="mb-10 flex items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span>Real-time GPS</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span>Live Vendors</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span>Auto Pin</span>
          </div>
        </div>

        {/* Role cards */}
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
                {"I'm a Founder"}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Go live, pin your spot, and let customers find you in real time.
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
                {"I'm a Finder"}
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Explore the live map and discover vendors near you right now.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
              <span>Open Map</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>
        </div>

        {/* Footer */}
        <p className="mt-10 text-center text-xs text-muted-foreground">
          No account needed. Start using StreetSpot instantly.
        </p>
      </div>
    </div>
  )
}
