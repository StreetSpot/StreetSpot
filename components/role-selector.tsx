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
  Star,
  CalendarDays,
  Footprints,
  Truck,
  Compass,
} from "lucide-react"

interface RoleSelectorProps {
  onSelect: (role: "founder" | "finder") => void
}

const features = [
  { icon: Truck, title: "Food trucks & vendors", detail: "Find who's serving nearby" },
  { icon: CalendarDays, title: "Events & pop-ups", detail: "See what's happening around town" },
  { icon: Footprints, title: "Skate spots & gems", detail: "Pin the places worth knowing" },
  { icon: MessageCircle, title: "Real conversations", detail: "Message businesses directly" },
  { icon: Star, title: "Ratings & reviews", detail: "Help the community find the good stuff" },
  { icon: Compass, title: "Local discovery", detail: "Explore without needing an account" },
]

export function RoleSelector({ onSelect }: RoleSelectorProps) {
  return (
    <div className="hustle-landing">
      <section className="mx-auto flex min-h-[calc(100dvh-65px)] w-full max-w-6xl flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
          <div className="text-center lg:text-left">
            <div className="mb-6 flex justify-center lg:justify-start">
              <span className="hustle-stamp"><Zap className="h-3.5 w-3.5" /> Real-time local discovery</span>
            </div>
            <h1 className="hustle-title mx-auto mb-5 max-w-3xl text-5xl text-foreground sm:text-6xl md:text-7xl lg:mx-0 lg:text-[5.2rem]">
              <span className="block">$treet<span className="text-[#B6FF38]">$</span>pot</span>
              <span className="hustle-outline mt-2 block text-4xl sm:text-5xl md:text-6xl lg:text-[4.2rem]">Bu!lt 4 Da Hu$tle</span>
            </h1>
            <p className="mb-3 text-base font-black uppercase tracking-[.11em] text-[#B6FF38] sm:text-lg">
              BU!LT 4 DA HU$TLE. BU!LT 4 DA $TREET$.
            </p>
            <p className="mx-auto mb-8 max-w-xl text-pretty text-base leading-relaxed text-[#c4c1cd] sm:text-lg lg:mx-0">
              Find the food truck, the pop-up, the skate spot, the neighborhood event, and the local business you didn&apos;t know you were missing. The streets are full of stories. Put them on the map.
            </p>

            <div className="mb-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <button
                onClick={() => onSelect("finder")}
                className="hustle-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm uppercase tracking-wide transition"
              >
                <Search className="h-4 w-4" /> Explore the map <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => onSelect("founder")}
                className="hustle-secondary inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-extrabold uppercase tracking-wide transition"
              >
                <Store className="h-4 w-4" /> I run a business
              </button>
            </div>

            <p className="mb-7 text-xs font-bold uppercase tracking-[.16em] text-[#b2afbb]">
              REAL SPOTS. <span className="text-[#D8A5FF]">REAL PEOPLE.</span> REAL HUSTLE.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-xs font-semibold text-muted-foreground lg:justify-start">
              <span className="inline-flex items-center gap-2"><Zap className="h-4 w-4 text-[#B6FF38]" /> GPS when you choose</span>
              <span className="inline-flex items-center gap-2"><Gem className="h-4 w-4 text-[#D8A5FF]" /> Pin local gems</span>
              <span className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-[#D6A34D]" /> Community powered</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="pointer-events-none absolute -inset-5 rounded-[2rem] border border-[#D8A5FF]/15" />
            <div className="hustle-card relative overflow-hidden rounded-2xl p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="brand-kicker">Street-level signal</p>
                  <h2 className="mt-1 text-xl font-black tracking-tight text-foreground sm:text-2xl">Your city. Your people.</h2>
                </div>
                <div className="brand-mark flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"><MapPin className="h-6 w-6" /></div>
              </div>

              <div className="relative mb-5 overflow-hidden rounded-xl border border-[#393642] bg-[#111116] p-4 sm:p-5">
                <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(rgba(216,165,255,.13) 1px, transparent 1px), linear-gradient(90deg, rgba(216,165,255,.13) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
                <svg viewBox="0 0 360 210" role="img" aria-label="Stylized city map with bright pins marking local spots" className="relative h-auto w-full">
                  <g fill="none" stroke="#494551" strokeWidth="12" strokeLinecap="round">
                    <path d="M-10 42 L105 72 L176 28 L255 66 L370 38" />
                    <path d="M15 225 L64 143 L135 165 L205 120 L272 151 L350 100" />
                    <path d="M60 -10 L92 65 L74 127 L117 220" />
                    <path d="M215 -10 L201 52 L230 95 L215 150 L242 220" />
                    <path d="M-10 111 L70 104 L139 113 L195 83 L270 101 L370 83" />
                  </g>
                  <g fill="none" stroke="#292832" strokeWidth="4" strokeLinecap="round">
                    <path d="M-10 42 L105 72 L176 28 L255 66 L370 38" />
                    <path d="M15 225 L64 143 L135 165 L205 120 L272 151 L350 100" />
                    <path d="M60 -10 L92 65 L74 127 L117 220" />
                    <path d="M215 -10 L201 52 L230 95 L215 150 L242 220" />
                    <path d="M-10 111 L70 104 L139 113 L195 83 L270 101 L370 83" />
                  </g>
                  <g>
                    <circle cx="105" cy="72" r="17" fill="#B6FF38" opacity=".13" /><circle cx="105" cy="72" r="7" fill="#B6FF38" />
                    <circle cx="230" cy="95" r="20" fill="#D8A5FF" opacity=".16" /><circle cx="230" cy="95" r="8" fill="#D8A5FF" />
                    <circle cx="135" cy="165" r="18" fill="#D6A34D" opacity=".14" /><circle cx="135" cy="165" r="7" fill="#D6A34D" />
                    <circle cx="272" cy="151" r="15" fill="#B6FF38" opacity=".13" /><circle cx="272" cy="151" r="6" fill="#B6FF38" />
                  </g>
                  <g fontFamily="monospace" fontSize="9" fontWeight="bold" letterSpacing="1.5">
                    <text x="120" y="60" fill="#B6FF38">FOOD TRUCK</text>
                    <text x="244" y="84" fill="#D8A5FF">LIVE EVENT</text>
                    <text x="148" y="184" fill="#D6A34D">HIDDEN GEM</text>
                  </g>
                </svg>
                <div className="relative mt-2 flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-[.13em] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#B6FF38]" /> Vendors</span>
                  <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#D8A5FF]" /> Events</span>
                  <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#D6A34D]" /> Gems</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {features.map(({ icon: Icon, title, detail }) => (
                  <div key={title} className="flex min-w-0 items-start gap-3 rounded-xl border border-[#393642] bg-[#111116]/70 p-3">
                    <span className="hustle-feature-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"><Icon className="h-4 w-4" /></span>
                    <span className="min-w-0">
                      <span className="block text-xs font-extrabold leading-snug text-foreground sm:text-sm">{title}</span>
                      <span className="mt-1 block text-[10px] leading-snug text-muted-foreground sm:text-[11px]">{detail}</span>
                    </span>
                  </div>
                ))}
              </div>
              <div className="hustle-divider my-5" />
              <p className="text-center text-[10px] font-bold uppercase tracking-[.18em] text-muted-foreground">
                Built for the block. Ready for the whole community.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
