"use client"

import { MapPin, ArrowLeft } from "lucide-react"

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
          <span className="text-lg font-semibold tracking-tight text-foreground">
            StreetSpot
          </span>
        </div>
      </div>
      {mode !== "landing" && (
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
            {mode === "founder" ? "Founder Mode" : "Finder Mode"}
          </span>
        </div>
      )}
    </header>
  )
}
