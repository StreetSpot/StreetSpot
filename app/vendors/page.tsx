import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, CheckCircle2, MapPin, Megaphone, Smartphone, Store } from "lucide-react"

export const metadata: Metadata = {
  title: "Get Your Local Business Seen",
  description: "Create a StreetSpot account, choose a monthly vendor plan, and publish your business location and hours so nearby customers can discover you.",
  alternates: { canonical: "https://streetspotapp.com/vendors" },
  openGraph: { title: "Get Your Local Business Seen | StreetSpot", description: "Put your food truck, pop-up, or local business on the map with StreetSpot.", url: "https://streetspotapp.com/vendors", type: "website" },
}

const plans = [
  { id: "bronze", name: "Bronze", detail: "Get your business started on StreetSpot" },
  { id: "silver", name: "Silver", detail: "Build visibility for your local business", featured: true },
  { id: "gold", name: "Gold", detail: "Explore premium visibility options" },
]
const benefits = [
  "Publish your business location and operating hours",
  "Help nearby customers discover your food truck, cart, or pop-up",
  "Keep your business details and live status up to date",
  "Share specials, event appearances, and relocation updates",
]

export default function VendorsPage() {
  return (
    <main className="min-h-dvh bg-[#111116] text-white">
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(182,255,56,0.16),transparent_45%),radial-gradient(ellipse_at_bottom_left,rgba(216,165,255,0.15),transparent_42%)]" />
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#B6FF38]/40 bg-[#B6FF38]/10 px-3 py-1.5 text-xs font-black uppercase tracking-[.18em] text-[#B6FF38]"><Store className="h-4 w-4" /> StreetSpot for businesses</p>
            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">Get your local business <span className="text-[#B6FF38]">seen.</span></h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">Put your food truck, cart, pop-up shop, or local business on the map. Create an account, choose a monthly vendor plan, and publish your location and hours so nearby customers can find you.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/account?next=%2F%3Fview%3Dfounder-login" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#B6FF38] px-6 py-3 font-black text-[#111116] transition hover:brightness-110">Create your account <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/discover-local-spots" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/20 px-6 py-3 font-bold text-white transition hover:border-[#D8A5FF] hover:text-[#D8A5FF]">Explore local spots</Link>
            </div>
            <p className="mt-3 text-xs leading-5 text-white/50">Plans are billed through Stripe. Visibility and customer activity are not guaranteed.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/30 p-6 shadow-2xl backdrop-blur sm:p-8">
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#D8A5FF]">Built for the hustle</p>
            <h2 className="mt-3 text-2xl font-black sm:text-3xl">Your spot. Your hours. Your customers can find you.</h2>
            <ul className="mt-6 space-y-4">{benefits.map((benefit) => <li key={benefit} className="flex gap-3 text-sm leading-6 text-white/80"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#B6FF38]" /> {benefit}</li>)}</ul>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="max-w-2xl"><p className="text-xs font-black uppercase tracking-[.2em] text-[#B6FF38]">Choose your plan</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">Pick the vendor tier that fits your business.</h2><p className="mt-3 leading-7 text-white/65">Select a tier to continue through your StreetSpot account and secure Stripe checkout. Your plan is subject to the terms shown during checkout.</p></div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">{plans.map((plan) => <article key={plan.id} className={`flex flex-col rounded-2xl border p-6 ${plan.featured ? "border-[#B6FF38] bg-[#B6FF38]/[.07] shadow-[0_0_35px_rgba(182,255,56,.08)]" : "border-white/15 bg-white/[.03]"}`}><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-[#D8A5FF]"><Store className="h-5 w-5" /></span><div><h3 className="text-xl font-black">{plan.name}</h3><p className="text-xs text-white/50">Monthly vendor plan</p></div></div><p className="mt-4 min-h-12 text-sm leading-6 text-white/70">{plan.detail}</p><Link href={`/api/billing/checkout?plan=${plan.id}`} className={`mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black transition ${plan.featured ? "bg-[#B6FF38] text-[#111116] hover:brightness-110" : "border border-white/20 text-white hover:border-[#D8A5FF] hover:text-[#D8A5FF]"}`}>Choose {plan.name} <ArrowRight className="h-4 w-4" /></Link></article>)}</div>
      </section>
      <section className="border-t border-white/10 bg-black/20"><div className="mx-auto grid max-w-6xl gap-6 px-5 py-12 sm:px-8 md:grid-cols-3">
        <div className="flex gap-3"><MapPin className="h-6 w-6 shrink-0 text-[#B6FF38]" /><div><h3 className="font-extrabold">Location-led discovery</h3><p className="mt-1 text-sm leading-6 text-white/60">Make it easier for people nearby to find the places and vendors they care about.</p></div></div>
        <div className="flex gap-3"><Smartphone className="h-6 w-6 shrink-0 text-[#D8A5FF]" /><div><h3 className="font-extrabold">Update your spot</h3><p className="mt-1 text-sm leading-6 text-white/60">Keep your listing details and availability accurate as your business moves.</p></div></div>
        <div className="flex gap-3"><Megaphone className="h-6 w-6 shrink-0 text-[#D6A34D]" /><div><h3 className="font-extrabold">Share your hustle</h3><p className="mt-1 text-sm leading-6 text-white/60">Prepare business updates about specials, new locations, and event appearances.</p></div></div>
      </div></section>
      <footer className="border-t border-white/10 px-5 py-6 text-center text-sm text-white/45"><Link href="/" className="hover:text-[#B6FF38]">StreetSpot home</Link><span className="mx-3">·</span><Link href="/terms" className="hover:text-[#B6FF38]">Terms</Link><span className="mx-3">·</span><Link href="/privacy" className="hover:text-[#B6FF38]">Privacy</Link></footer>
    </main>
  )
}
