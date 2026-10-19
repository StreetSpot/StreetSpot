import Link from "next/link"
import { ArrowRight, MapPin, Smartphone } from "lucide-react"

type SeoLandingPageProps = {
  eyebrow: string
  title: string
  description: string
  bullets: string[]
  primaryHref: string
  primaryLabel: string
  secondaryHref: string
  secondaryLabel: string
  note?: string
}

const playStoreUrl = "https://play.google.com/store/apps/details?id=com.plainjane.streetspot"

export function SeoLandingPage({
  eyebrow, title, description, bullets, primaryHref, primaryLabel, secondaryHref, secondaryLabel, note,
}: SeoLandingPageProps) {
  return (
    <main className="min-h-dvh bg-[#111116] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between border-b border-white/10 pb-5">
          <Link href="/" className="text-lg font-black tracking-tight">$treet$pot</Link>
          <Link href="/" className="text-sm font-semibold text-white/70 hover:text-[#B6FF38]">Explore the map</Link>
        </header>
        <section className="grid gap-10 py-14 lg:grid-cols-[1.2fr_.8fr] lg:items-center lg:py-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#B6FF38]/30 bg-[#B6FF38]/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[.16em] text-[#B6FF38]"><MapPin className="h-3.5 w-3.5"/>{eyebrow}</p>
            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">{title}</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">{description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={primaryHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#B6FF38] px-5 py-3 text-sm font-extrabold text-[#111116] hover:brightness-105">{primaryLabel}<ArrowRight className="h-4 w-4"/></Link>
              <Link href={secondaryHref} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white hover:bg-white/5">{secondaryLabel}</Link>
            </div>
            <a href={playStoreUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white"><Smartphone className="h-4 w-4"/> Get StreetSpot on Google Play</a>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#26222e] via-[#191820] to-black p-6 shadow-2xl sm:p-8">
            <p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#D8A5FF]">Real spots. Real people. Real hustle.</p>
            <ul className="mt-6 space-y-4">
              {bullets.map((bullet) => <li key={bullet} className="flex gap-3 rounded-xl border border-white/10 bg-white/[.03] p-4"><span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#B6FF38]"/><span className="text-sm leading-6 text-white/80">{bullet}</span></li>)}
            </ul>
            {note && <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-5 text-white/45">{note}</p>}
          </div>
        </section>
        <footer className="flex flex-col gap-3 border-t border-white/10 py-6 text-xs text-white/45"><span>BU!LT 4 DA HU$TLE. BU!LT 4 DA $TREET$.</span><nav aria-label="Explore StreetSpot" className="flex flex-wrap gap-x-4 gap-y-2"><Link href="/vendors" className="hover:text-white">For vendors</Link><Link href="/food-trucks" className="hover:text-white">Food trucks</Link><Link href="/pop-up-shops" className="hover:text-white">Pop-up shops</Link><Link href="/private-events" className="hover:text-white">Event hosting</Link><Link href="/local-events" className="hover:text-white">Local events</Link><Link href="/discover-local-spots" className="hover:text-white">Hidden gems</Link><Link href="/support" className="hover:text-white">Support</Link><Link href="/privacy" className="hover:text-white">Privacy</Link><Link href="/terms" className="hover:text-white">Terms</Link></nav></footer>
      </div>
    </main>
  )
}
