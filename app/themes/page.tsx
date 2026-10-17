import Link from "next/link"
import { ArrowLeft, Check, Palette, Sparkles, Crown, ShoppingBag, LockKeyhole } from "lucide-react"

const offers = [
  {
    id: "street-style",
    name: "Street Style Pack",
    price: "$4.99",
    billing: "one-time",
    description: "A themed icon, profile logo treatment, and matching listing accents.",
    features: ["1 theme pack", "Matching app/profile icon treatment", "Theme stays yours after purchase"],
    icon: ShoppingBag,
    style: "from-orange-500 to-rose-500",
    checkout: process.env.NEXT_PUBLIC_STRIPE_THEME_STREET_STYLE_URL,
    badge: "One-time purchase",
  },
  {
    id: "creator",
    name: "Creator Themes",
    price: "$9.99",
    billing: "/month",
    description: "A rotating collection for vendors, food trucks, pop-ups, and local creators.",
    features: ["All standard theme packs", "Seasonal theme drops", "Profile and listing styling"],
    icon: Palette,
    style: "from-emerald-600 to-teal-500",
    checkout: process.env.NEXT_PUBLIC_STRIPE_THEME_CREATOR_URL,
    badge: "Monthly subscription",
  },
  {
    id: "brand-studio",
    name: "Brand Studio",
    price: "$19.99",
    billing: "/month",
    description: "A premium branded look for established businesses and busy vendors.",
    features: ["All Creator Themes benefits", "Premium logo and cover treatments", "Expanded branded profile options", "New premium designs as released"],
    icon: Crown,
    style: "from-slate-700 to-slate-500",
    checkout: process.env.NEXT_PUBLIC_STRIPE_THEME_BRAND_STUDIO_URL,
    badge: "Premium subscription",
  },
]

export default function ThemesPage() {
  return (
    <main className="min-h-dvh bg-[#f6f7f2] px-4 py-8 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"><ArrowLeft className="h-4 w-4" /> Back to StreetSpot</Link>
        <div className="mb-8 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-800"><Sparkles className="h-3.5 w-3.5" /> StreetSpot Theme Studio</div>
          <h1 className="text-3xl font-black tracking-tight sm:text-5xl">Make your spot look like yours.</h1>
          <p className="mt-3 text-base leading-7 text-slate-600">Choose themed icons, logo treatments, profile pages, and listing styles that fit your business. Everyday discovery stays free. Branding upgrades are optional.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {offers.map((offer) => {
            const Icon = offer.icon
            return <section key={offer.id} className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className={`bg-gradient-to-br ${offer.style} p-5 text-white`}>
                <div className="mb-7 flex items-center justify-between"><span className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">{offer.badge}</span><Icon className="h-5 w-5" /></div>
                <div className="rounded-xl border border-white/25 bg-black/10 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-900"><Icon className="h-6 w-6" /></div><div><div className="text-xs font-medium text-white/80">YOUR STREETSPOT</div><div className="text-lg font-black">Your Brand</div><div className="text-xs text-white/80">Local. Live. Yours.</div></div></div>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="text-xl font-extrabold">{offer.name}</h2>
                <p className="mt-2 min-h-[60px] text-sm leading-6 text-slate-600">{offer.description}</p>
                <div className="my-4 flex items-baseline gap-1"><span className="text-3xl font-black">{offer.price}</span><span className="text-sm text-slate-500">{offer.billing}</span></div>
                <ul className="mb-6 space-y-2 text-sm text-slate-700">{offer.features.map((feature) => <li key={feature} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{feature}</li>)}</ul>
                {offer.checkout ? <a href={offer.checkout} target="_blank" rel="noopener noreferrer" className={`mt-auto flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${offer.style} px-4 py-3 text-sm font-bold text-white hover:brightness-105`}>Continue to secure checkout <LockKeyhole className="h-4 w-4" /></a> : <div className="mt-auto rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-center text-xs font-semibold leading-5 text-amber-900">Checkout is not connected yet. This plan will not charge you until its Stripe payment link is configured.</div>}
              </div>
            </section>
          })}
        </div>
        <p className="mt-6 text-center text-xs leading-5 text-slate-500">Subscriptions renew until canceled. One-time purchases do not renew. Final theme availability and benefits are shown before payment. Need help? <a className="underline underline-offset-2" href="mailto:support@streetspotapp.com?subject=StreetSpot%20Theme%20Studio">Contact StreetSpot support</a>.</p>
      </div>
    </main>
  )
}
