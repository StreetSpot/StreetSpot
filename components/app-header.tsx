"use client"

import { MapPin, ArrowLeft, CalendarDays } from "lucide-react"
import Link from "next/link"

interface AppHeaderProps {
  mode: "landing" | "founder" | "finder"
  onBack?: () => void
}

function BrandMark({ size = "md" }: { size?: "sm" | "md" }) {
  const dimension = size === "sm" ? "h-6 w-6 rounded-md" : "h-9 w-9 rounded-xl"
  return (
    <span className={`brand-mark relative inline-flex shrink-0 items-center justify-center ${dimension}`} aria-hidden="true">
      <MapPin className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} strokeWidth={2.8} />
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
        <Link href="/" className="flex min-w-0 items-center gap-2.5 rounded-sm" aria-label="StreetSpot home">
          <BrandMark />
          <span className="min-w-0">
            <span className="brand-wordmark block truncate text-lg font-black leading-none text-foreground md:text-xl">StreetSpot</span>
            <span className="mt-1 block truncate text-[9px] font-extrabold uppercase tracking-[.14em] text-muted-foreground sm:text-[10px]">
              LOCAL DISCOVERY • LIVE MAP
            </span>
          </span>
        </Link>
      </div>
      <nav aria-label="Quick actions" className="flex shrink-0 items-center gap-2 pl-2"><Link href="/host/invitations" className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[#D8A5FF]/50 bg-[#111116] px-3 py-2 text-xs font-extrabold text-white shadow-sm transition hover:border-[#B6FF38] hover:text-[#B6FF38] sm:gap-2 sm:px-4 sm:text-sm"><CalendarDays className="h-4 w-4 text-[#D8A5FF]" /><span className="hidden sm:inline">Host a Private Event</span><span className="sm:hidden">Host Event</span></Link>
        {mode !== "landing" && (
          <span className="hidden rounded-full border border-[#258052]/25 bg-[#eaf5ed] px-2.5 py-1 text-[10px] font-bold text-[#258052] sm:inline-flex sm:text-xs">
            {mode === "founder" ? "Vendor Mode" : "Finder Mode"}
          </span>
        )}
      </nav>
    </header>
  )
}
