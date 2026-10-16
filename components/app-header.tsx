"use client"

import { MapPin, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { HustleAudioToggle } from "@/components/hustle-audio-toggle"

interface AppHeaderProps {
  mode: "landing" | "founder" | "finder"
  onBack?: () => void
}

function BrandMark({ size = "md" }: { size?: "sm" | "md" }) {
  const dimension = size === "sm" ? "h-6 w-6 rounded-md" : "h-9 w-9 rounded-xl"
  return (
    <span className={`brand-mark relative inline-flex shrink-0 items-center justify-center ${dimension}`} aria-hidden="true">
      <MapPin className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} strokeWidth={2.8} />
      <span className={`absolute font-black leading-none ${size === "sm" ? "text-[10px]" : "text-xs"}`}>$</span>
    </span>
  )
}

export function AppHeader({ mode, onBack }: AppHeaderProps) {
  return (
    <header className="brand-header sticky top-0 z-[1000] flex items-center justify-between border-b px-4 py-3 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        {mode !== "landing" && onBack && (
          <button
            onClick={onBack}
            className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <Link href="/" className="flex min-w-0 items-center gap-2.5 rounded-sm" aria-label="$treet$pot home">
          <BrandMark />
          <span className="min-w-0">
            <span className="brand-wordmark block truncate text-lg font-black leading-none text-foreground md:text-xl">
              <span className="brand-dollar">$</span>treet<span className="brand-dollar">$</span>pot
            </span>
            <span className="mt-1 block truncate text-[9px] font-extrabold uppercase tracking-[.14em] text-muted-foreground sm:text-[10px]">
              Bu!lt 4 Da Hu$tle
            </span>
          </span>
        </Link>
      </div>
      <div className="flex shrink-0 items-center gap-2 pl-2">
        <HustleAudioToggle />
        {mode !== "landing" && (
          <span className="hidden rounded-full border border-[#D8A5FF]/40 bg-[#D8A5FF]/10 px-2.5 py-1 text-[10px] font-bold text-[#E5C7FF] sm:inline-flex sm:text-xs">
            {mode === "founder" ? "Vendor Mode" : "Finder Mode"}
          </span>
        )}
      </div>
    </header>
  )
}
