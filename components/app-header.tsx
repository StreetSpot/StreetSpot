"use client"

import Link from "next/link"
import { MapPin, ArrowLeft, Zap } from "lucide-react"

interface AppHeaderProps {
  mode: "landing" | "founder" | "finder"
  onBack?: () => void
}

export function AppHeader({ mode, onBack }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:px-6">
      <div className="flex items-center gap-3">
        {mode !== "landing" && onBack && (
          <button
            onClick={onBack}
            className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <MapPin className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <span className="text-lg font-semibold tracking-tight text-foreground">
              StreetSpot
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/domain"
          className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-xs font-semibold text-orange-400 transition hover:bg-orange-500/20"
          title="Cloudflare Tools & Domain Hub"
        >
          <Zap className="h-3 w-3" />
          <span className="hidden sm:inline">streetspotapp.com</span>
          <span className="sm:hidden">Domain</span>
        </Link>
        {mode !== "landing" && (
          <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
            {mode === "founder" ? "Founder" : "Finder"}
          </span>
        )}
      </div>
    </header>
  )
}
