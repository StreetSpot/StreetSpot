"use client"

import {
  Store, Search, ArrowRight, MapPin, Truck, CalendarDays, Gem,
  MessageCircle, Star, Navigation, Sparkles, ShieldCheck,
} from "lucide-react"

interface RoleSelectorProps {
  onSelect: (role: "founder" | "finder") => void
}

const categories = [
  { icon: Truck, title: "Food trucks", detail: "Catch your favorites while they're open", tone: "orange" },
  { icon: CalendarDays, title: "Pop-ups & events", detail: "Markets, parties, and things happening now", tone: "blue" },
  { icon: Gem, title: "Local finds", detail: "Skate spots, hidden gems, and neighborhood picks", tone: "green" },
  { icon: MessageCircle, title: "Direct connection", detail: "Talk to local businesses, not an algorithm", tone: "purple" },
]

export function RoleSelector({ onSelect }: RoleSelectorProps) {
  return (
    <div className="market-landing">
      <section className="relative mx-auto w-full max-w-7xl px-4 pb-14 pt-10 sm:px-6 sm:pt-16 lg:px-8 lg:pb-20 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_.98fr] lg:gap-16">
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d7e7d8] bg-white/85 px-3.5 py-2 text-xs font-bold tracking-wide text-[#276b49] shadow-sm">
              <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#28a66a] opacity-30" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#28a66a]" /></span>
              YOUR LOCAL SCENE, ALL IN ONE PLACE
            </div>

            <h1 className="max-w-3xl text-balance text-[2.8rem] font-black leading-[.98] tracking-[-.065em] text-[#17231f] sm:text-6xl lg:text-[5.2rem]">
              Find your next
              <span className="market-headline-accent block">favorite spot.</span>
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-base leading-7 text-[#59645f] sm:text-lg sm:leading-8">
              Food trucks, pop-up shops, neighborhood events, skate spots, and independent businesses. Discover what&apos;s out there, see what&apos;s live, and support the people making your town interesting.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => onSelect("finder")}
                className="market-button-primary inline-flex min-h-14 items-center justify-center gap-2.5 rounded-2xl px-6 py-4 text-sm font-extrabold shadow-lg shadow-[#f06435]/20 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <Search className="h-4 w-4" /> Explore the live map <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => onSelect("founder")}
                className="inline-flex min-h-14 items-center justify-center gap-2.5 rounded-2xl border border-[#d9ddd7] bg-white px-6 py-4 text-sm font-extrabold text-[#17231f] shadow-sm transition hover:border-[#17231f] hover:bg-[#f6f8f4]"
              >
                <Store className="h-4 w-4" /> Get your business seen
              </button>
            </div>

            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-xs font-semibold text-[#59645f]">
              <span className="inline-flex items-center gap-2"><Navigation className="h-4 w-4 text-[#f06435]" /> Location when you choose</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#276b49]" /> Browse without an account</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="market-map-card overflow-hidden rounded-[2rem] border border-white bg-white p-3 shadow-[0_30px_90px_rgba(30,49,39,.13)] sm:p-4">
              <div className="flex items-center justify-between gap-3 px-3 pb-4 pt-2">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#7a857e]">The local radar</p>
                  <h2 className="mt-1 text-xl font-black tracking-tight text-[#17231f] sm:text-2xl">Good things are nearby.</h2>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fff0e8] text-[#f06435]"><MapPin className="h-5 w-5" /></span>
              </div>

              <div className="market-map-art relative overflow-hidden rounded-[1.5rem] border border-[#e1e5dc]">
                <svg viewBox="0 0 460 330" role="img" aria-label="Illustrated neighborhood map showing local vendors, shops, and events" className="block h-auto w-full">
                  <rect width="460" height="330" fill="#edf1e8" />
                  <g fill="#dce7d7">
                    <rect x="18" y="20" width="110" height="58" rx="12" /><rect x="160" y="16" width="94" height="54" rx="12" />
                    <rect x="315" y="22" width="122" height="68" rx="12" /><rect x="18" y="130" width="70" height="85" rx="12" />
                    <rect x="119" y="239" width="100" height="70" rx="12" /><rect x="330" y="235" width="107" height="75" rx="12" />
                    <rect x="275" y="122" width="162" height="78" rx="12" />
                  </g>
                  <g fill="#d1dccb">
                    <rect x="32" y="33" width="24" height="16" rx="3" /><rect x="66" y="33" width="48" height="16" rx="3" />
                    <rect x="174" y="28" width="26" height="13" rx="3" /><rect x="208" y="28" width="31" height="13" rx="3" />
                    <rect x="330" y="36" width="42" height="15" rx="3" /><rect x="380" y="36" width="42" height="15" rx="3" />
                    <rect x="291" y="139" width="40" height="15" rx="3" /><rect x="340" y="139" width="80" height="15" rx="3" />
                  </g>
                  <g fill="none" stroke="#fff" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M-12 105 L105 113 L180 94 L278 106 L472 96" /><path d="M139 -20 L145 92 L132 173 L156 350" />
                    <path d="M285 -10 L276 83 L299 164 L283 340" /><path d="M-15 224 L95 215 L195 230 L282 215 L472 222" />
                    <path d="M55 340 L74 269 L119 205 L176 155 L237 142 L310 167 L380 130 L475 135" />
                  </g>
                  <g fill="none" stroke="#d3dbd0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M-12 105 L105 113 L180 94 L278 106 L472 96" /><path d="M139 -20 L145 92 L132 173 L156 350" />
                    <path d="M285 -10 L276 83 L299 164 L283 340" /><path d="M-15 224 L95 215 L195 230 L282 215 L472 222" />
                    <path d="M55 340 L74 269 L119 205 L176 155 L237 142 L310 167 L380 130 L475 135" />
                  </g>
                  <g fill="#b6d9be" opacity=".9"><circle cx="90" cy="168" r="22" /><circle cx="232" cy="270" r="24" /><circle cx="395" cy="188" r="16" /><circle cx="355" cy="52" r="12" /></g>
                  <g>
                    <path d="M95 155c-13 0-23 10-23 23 0 17 23 34 23 34s23-17 23-34c0-13-10-23-23-23z" fill="#f06435" stroke="#fff" strokeWidth="4" />
                    <circle cx="95" cy="178" r="7" fill="white" />
                    <path d="M304 128c-13 0-23 10-23 23 0 17 23 34 23 34s23-17 23-34c0-13-10-23-23-23z" fill="#285ee8" stroke="#fff" strokeWidth="4" />
                    <circle cx="304" cy="151" r="7" fill="white" />
                    <path d="M368 213c-11 0-20 9-20 20 0 15 20 29 20 29s20-14 20-29c0-11-9-20-20-20z" fill="#258052" stroke="#fff" strokeWidth="4" />
                    <circle cx="368" cy="233" r="6" fill="white" />
                  </g>
                  <g fontFamily="Inter,system-ui,sans-serif" fontSize="11" fontWeight="800">
                    <rect x="20" y="218" width="132" height="30" rx="10" fill="#fff" stroke="#e4e7df" /><text x="32" y="237" fill="#29372f">FOOD TRUCKS</text>
                    <rect x="278" y="76" width="111" height="30" rx="10" fill="#fff" stroke="#e4e7df" /><text x="290" y="95" fill="#29372f">LIVE EVENTS</text>
                    <rect x="278" y="267" width="130" height="30" rx="10" fill="#fff" stroke="#e4e7df" /><text x="290" y="286" fill="#29372f">LOCAL FINDS</text>
                  </g>
                </svg>
                <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full border border-white bg-white/95 px-3 py-2 text-[10px] font-extrabold text-[#276b49] shadow-sm">
                  <Sparkles className="h-3.5 w-3.5" /> Explore your neighborhood
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 px-1 pb-1 pt-4">
                <div className="rounded-xl bg-[#fff0e8] p-3"><Truck className="h-4 w-4 text-[#f06435]" /><p className="mt-2 text-xs font-extrabold text-[#29372f]">Vendors</p><p className="mt-0.5 text-[10px] text-[#7a857e]">Find the truck</p></div>
                <div className="rounded-xl bg-[#edf2ff] p-3"><CalendarDays className="h-4 w-4 text-[#285ee8]" /><p className="mt-2 text-xs font-extrabold text-[#29372f]">Events</p><p className="mt-0.5 text-[10px] text-[#7a857e]">Catch the moment</p></div>
                <div className="rounded-xl bg-[#eaf5ed] p-3"><Gem className="h-4 w-4 text-[#258052]" /><p className="mt-2 text-xs font-extrabold text-[#29372f]">Hidden gems</p><p className="mt-0.5 text-[10px] text-[#7a857e]">Save your finds</p></div>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-3 hidden rounded-2xl border border-[#e8ebe4] bg-white px-4 py-3 shadow-xl sm:block">
              <div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#eaf5ed] text-[#258052]"><Star className="h-4 w-4 fill-current" /></span><span><span className="block text-xs font-extrabold text-[#17231f]">Made for your town</span><span className="mt-0.5 block text-[10px] text-[#7a857e]">Discover. Connect. Come back.</span></span></div>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-[#dce1d8] pt-8 lg:mt-20">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#f06435]">More than a map</p><h2 className="mt-2 text-2xl font-black tracking-tight text-[#17231f] sm:text-3xl">Your community has a pulse.</h2></div>
            <p className="max-w-lg text-sm leading-6 text-[#59645f]">One place to find independent businesses, follow local happenings, and share the places worth knowing about.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map(({ icon: Icon, title, detail, tone }) => (
              <div key={title} className="market-feature-card rounded-2xl border border-[#e1e5dc] bg-white p-5">
                <span className={`market-feature-icon market-tone-${tone} flex h-11 w-11 items-center justify-center rounded-2xl`}><Icon className="h-5 w-5" /></span>
                <h3 className="mt-4 text-sm font-extrabold text-[#17231f]">{title}</h3>
                <p className="mt-1.5 text-xs leading-5 text-[#68736c]">{detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl bg-[#17231f] px-6 py-6 text-center sm:flex-row sm:text-left">
            <div><p className="text-lg font-black text-white">Run a local business?</p><p className="mt-1 text-sm text-[#c7d2ca]">Help nearby customers find you when and where you&apos;re open.</p></div>
            <button onClick={() => onSelect("founder")} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#f06435] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-[#db4f24]"><Store className="h-4 w-4" /> Put my business on the map <ArrowRight className="h-4 w-4" /></button>
          </div>
        </div>
      </section>
    </div>
  )
}
