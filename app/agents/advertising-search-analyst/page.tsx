"use client"
import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, BarChart3, Search, ShieldCheck } from "lucide-react"

type Report = {
  generatedAt: string; mode: "ai" | "fallback"; objective: string; keywordIdeas: string[]; adHeadlines: string[]; adDescriptions: string[]
  recommendedLandingPage: { title: string; metaDescription: string; primaryCallToAction: string }
  channelPlan: { channel: string; action: string }[]; measurementPlan: string[]; guardrails: string[]
}
export default function AdvertisingSearchAnalystPage() {
  const [business, setBusiness] = useState("StreetSpot")
  const [location, setLocation] = useState("")
  const [audience, setAudience] = useState("all")
  const [goal, setGoal] = useState("awareness")
  const [offerings, setOfferings] = useState("live vendor discovery, food trucks, pop-up shops, local events, private celebrations")
  const [seedKeywords, setSeedKeywords] = useState("")
  const [report, setReport] = useState<Report | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  async function analyze(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError(""); setReport(null)
    try {
      const response = await fetch("/api/agents/advertising-search-analyst", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ business, location, audience, goal, offerings, seedKeywords }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Analysis could not be generated.")
      setReport(data as Report)
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Analysis failed.") }
    finally { setLoading(false) }
  }
  return <main className="min-h-dvh bg-[#f6f7f2] px-4 py-8 text-slate-900 sm:px-6"><div className="mx-auto max-w-6xl">
    <Link href="/agents" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600"><ArrowLeft className="h-4 w-4"/> Back to Agent Control</Link>
    <header className="mb-8 flex items-start gap-4"><div className="rounded-2xl bg-slate-900 p-3 text-[#B6FF38]"><Search className="h-7 w-7"/></div><div><p className="text-xs font-bold uppercase tracking-[.2em] text-slate-500">StreetSpot growth operations</p><h1 className="mt-1 text-3xl font-black sm:text-4xl">Advertising Search Analyst</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Create practical SEO and campaign drafts for local discovery. This version generates repeatable strategy from your inputs; it does not claim live Google search-volume data or permission to spend advertising budget.</p></div></header>
    <form onSubmit={analyze} className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
      <label className="grid gap-2 text-sm font-bold">Business or campaign name<input required maxLength={100} value={business} onChange={e=>setBusiness(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-3 font-normal"/></label>
      <label className="grid gap-2 text-sm font-bold">Target city or area (optional)<input maxLength={100} value={location} onChange={e=>setLocation(e.target.value)} placeholder="e.g. Charlotte, NC" className="rounded-xl border border-slate-300 px-3 py-3 font-normal"/></label>
      <label className="grid gap-2 text-sm font-bold">Audience<select value={audience} onChange={e=>setAudience(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-3 font-normal"><option value="all">Customers, vendors, and hosts</option><option value="customers">Local customers</option><option value="vendors">Vendors and food trucks</option><option value="event-hosts">Personal and community event hosts</option><option value="businesses">Local businesses and pop-up retailers</option></select></label>
      <label className="grid gap-2 text-sm font-bold">Primary goal<select value={goal} onChange={e=>setGoal(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-3 font-normal"><option value="awareness">Increase local awareness</option><option value="app-installs">Earn relevant app installs</option><option value="vendor-claims">Get verified vendor claims</option><option value="event-hosting">Sell hosted event packages</option><option value="retention">Increase repeat engagement</option></select></label>
      <label className="grid gap-2 text-sm font-bold md:col-span-2">Features, services, and offers<textarea maxLength={500} rows={3} value={offerings} onChange={e=>setOfferings(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-3 font-normal"/></label>
      <label className="grid gap-2 text-sm font-bold md:col-span-2">Seed keywords (optional)<textarea maxLength={500} rows={2} value={seedKeywords} onChange={e=>setSeedKeywords(e.target.value)} placeholder="local food trucks, things to do this weekend, wedding invitation app" className="rounded-xl border border-slate-300 px-3 py-3 font-normal"/></label>
      <div className="flex flex-wrap items-center gap-3 md:col-span-2"><button disabled={loading} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white disabled:opacity-60"><BarChart3 className="h-4 w-4"/>{loading ? "Analyzing…" : "Generate search & advertising plan"}</button><span className="text-xs text-slate-500">AI analysis may incur model usage charges. No ad spend or publishing.</span></div>
      {error && <p role="alert" className="md:col-span-2 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    </form>
    {report && <section aria-live="polite" className="mt-8 space-y-5">
      <div className="rounded-2xl border border-emerald-200 bg-white p-5"><div className="flex items-center gap-2 text-sm font-bold text-emerald-800"><ShieldCheck className="h-4 w-4"/> {report.mode === "ai" ? "AI-generated draft" : "Rule-based draft · AI unavailable, using fallback"}</div><h2 className="mt-2 text-xl font-black">Campaign objective</h2><p className="mt-2 text-sm leading-6 text-slate-700">{report.objective}</p><p className="mt-2 text-xs text-slate-500">Generated {new Date(report.generatedAt).toLocaleString()}</p></div>
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="text-lg font-extrabold">Keyword ideas</h2><p className="mt-1 text-xs text-slate-500">Ideas to validate, not measured volume or rankings.</p><div className="mt-4 flex flex-wrap gap-2">{report.keywordIdeas.map(word=><button key={word} type="button" onClick={()=>navigator.clipboard?.writeText(word)} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm hover:bg-slate-100" title="Click to copy keyword">{word}</button>)}</div></section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="text-lg font-extrabold">Landing page recommendation</h2><p className="mt-3 text-xs font-bold uppercase text-slate-500">Title</p><p className="mt-1 text-sm">{report.recommendedLandingPage.title}</p><p className="mt-3 text-xs font-bold uppercase text-slate-500">Meta description</p><p className="mt-1 text-sm leading-6">{report.recommendedLandingPage.metaDescription}</p><p className="mt-3 text-xs font-bold uppercase text-slate-500">Call to action</p><p className="mt-1 text-sm font-bold">{report.recommendedLandingPage.primaryCallToAction}</p></section>
      </div>
      <section className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="text-lg font-extrabold">Ad copy drafts</h2><h3 className="mt-4 text-sm font-bold">Headlines</h3><ul className="mt-2 grid gap-2 sm:grid-cols-2">{report.adHeadlines.map(x=><li key={x} className="rounded-lg bg-slate-50 p-3 text-sm">{x}</li>)}</ul><h3 className="mt-4 text-sm font-bold">Descriptions</h3><ul className="mt-2 space-y-2">{report.adDescriptions.map(x=><li key={x} className="rounded-lg bg-slate-50 p-3 text-sm leading-6">{x}</li>)}</ul></section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="text-lg font-extrabold">Channel plan</h2><div className="mt-4 grid gap-3 md:grid-cols-2">{report.channelPlan.map(x=><article key={x.channel} className="rounded-xl border border-slate-100 p-4"><h3 className="font-bold">{x.channel}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{x.action}</p></article>)}</div><h3 className="mt-6 font-bold">Measurement checklist</h3><ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-700">{report.measurementPlan.map(x=><li key={x}>{x}</li>)}</ol></section>
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><h2 className="font-extrabold text-amber-950">Accuracy limits</h2><ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-amber-950">{report.guardrails.map(x=><li key={x}>{x}</li>)}</ul></section>
    </section>}
  </div></main>
}
