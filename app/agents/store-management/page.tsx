"use client"
import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, CheckCircle2, CircleAlert, ExternalLink, RefreshCw, ShieldCheck } from "lucide-react"

const checks = [
  { name: "Homepage", path: "/" }, { name: "Web manifest", path: "/manifest.json" },
  { name: "Android asset links", path: "/.well-known/assetlinks.json" }, { name: "Privacy policy", path: "/privacy" },
  { name: "Terms", path: "/terms" }, { name: "Account deletion", path: "/delete-account" },
  { name: "Support", path: "/support" }, { name: "Health endpoint", path: "/api/health" },
]
type Result = { name: string; path: string; ok: boolean; detail: string }
type IntegrationStatus = { livePaymentLinks: boolean; stripeWebhook: boolean; entitlementSync: boolean; testCheckout: boolean; testCheckoutMissing: string[]; googlePlayPublishing: boolean; googleAdsApi: boolean; aiGateway: boolean }
export default function StoreManagementAgentPage() {
  const [results, setResults] = useState<Result[]>([])
  const [running, setRunning] = useState(false)
  const [lastRun, setLastRun] = useState("")
  const [integrations, setIntegrations] = useState<IntegrationStatus | null>(null)
  const [integrationError, setIntegrationError] = useState("")
  async function runChecks() {
    setRunning(true); setResults([])
    const next = await Promise.all(checks.map(async (item): Promise<Result> => {
      try {
        const response = await fetch(item.path, { cache: "no-store" })
        if (!response.ok) return { name: item.name, path: item.path, ok: false, detail: `HTTP ${response.status}` }
        if (item.path === "/manifest.json") {
          const data = await response.json() as { start_url?: string; scope?: string; icons?: unknown[] }
          const ok = Boolean(data.start_url && data.scope && Array.isArray(data.icons) && data.icons.length)
          return { name: item.name, path: item.path, ok, detail: ok ? "Install metadata and icons are present." : "Start URL, scope, or icons are missing." }
        }
        if (item.path === "/.well-known/assetlinks.json") {
          const data = await response.json() as { target?: { namespace?: string; package_name?: string }; relation?: string[] }[]
          const ok = Array.isArray(data) && data.some(x => x.target?.namespace === "android_app" && x.target.package_name === "com.plainjane.streetspot" && x.relation?.includes("delegate_permission/common.handle_all_urls"))
          return { name: item.name, path: item.path, ok, detail: ok ? "Expected StreetSpot Android association found." : "Expected package association was not found." }
        }
        if (item.path === "/api/health") {
          const data = await response.json() as { ok?: boolean }
          return { name: item.name, path: item.path, ok: data.ok === true, detail: data.ok === true ? "Health endpoint reports OK." : "Health endpoint did not report OK." }
        }
        return { name: item.name, path: item.path, ok: true, detail: `Public resource returned HTTP ${response.status}.` }
      } catch { return { name: item.name, path: item.path, ok: false, detail: "Fetch or validation failed." } }
    }))
    setResults(next)
    try {
      const response = await fetch("/api/agents/store-management/status", { cache: "no-store" })
      const payload = await response.json() as { ok?: boolean; integrations?: IntegrationStatus }
      if (!response.ok || !payload.ok || !payload.integrations) throw new Error("Integration status could not be loaded.")
      setIntegrations(payload.integrations)
      setIntegrationError("")
    } catch {
      setIntegrationError("Integration status could not be loaded. Check operator access and try again.")
    }
    setLastRun(new Date().toLocaleString()); setRunning(false)
  }
  const passed = results.filter(x => x.ok).length
  const failed = results.length - passed
  return <main className="min-h-dvh bg-[#f6f7f2] px-4 py-8 text-slate-900 sm:px-6"><div className="mx-auto max-w-5xl">
    <Link href="/agents" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600"><ArrowLeft className="h-4 w-4" /> Back to Agent Control</Link>
    <header className="mb-8 flex items-start gap-4"><div className="rounded-2xl bg-slate-900 p-3 text-[#B6FF38]"><ShieldCheck className="h-7 w-7" /></div><div><p className="text-xs font-bold uppercase tracking-[.2em] text-slate-500">StreetSpot release operations</p><h1 className="mt-1 text-3xl font-black sm:text-4xl">Store Management Agent</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Check public install metadata, Android association, health, and policy pages. Google Play Console access and store publishing are not connected, so this agent will not pretend to upload or release a bundle.</p></div></header>
    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5"><h2 className="text-lg font-extrabold">Public release checks</h2><p className="mt-2 text-sm text-slate-600">Read-only checks. No production writes, charges, or store changes.</p><button type="button" onClick={runChecks} disabled={running} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${running ? "animate-spin" : ""}`} />{running ? "Checking..." : "Run release-readiness checks"}</button>{lastRun && <p className="mt-3 text-xs text-slate-500">Last run: {lastRun}</p>}</section>
    {results.length > 0 && <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5" aria-live="polite"><div className="mb-4 flex justify-between gap-3"><h2 className="text-lg font-extrabold">Results</h2><p className="text-sm font-semibold">{passed} passed · {failed} failed</p></div><ul className="space-y-3">{results.map(x => <li key={x.path} className="flex items-start gap-3 rounded-xl border border-slate-100 p-3">{x.ok ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-700" /> : <CircleAlert className="mt-0.5 h-5 w-5 text-red-700" />}<div className="flex-1"><p className="font-bold">{x.name}</p><p className="mt-1 text-sm text-slate-600">{x.detail}</p></div><span className={`rounded-full px-2 py-1 text-xs font-bold ${x.ok ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>{x.ok ? "PASS" : "FAIL"}</span></li>)}</ul>{failed > 0 && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Fix failed checks before submitting a new Android bundle. These checks do not verify signing, Play Console declarations, device behavior, or store review status.</p>}</section>}
    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5"><h2 className="text-lg font-extrabold">Billing, advertising, and store integrations</h2><p className="mt-1 text-sm text-slate-600">Configuration checks only. Secret values are never shown, and no payment or ad is created.</p>{integrationError && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">{integrationError}</p>}{integrations && <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{([{name:"Live Stripe Payment Links",ok:integrations.livePaymentLinks,detail:"Existing checkout links are configured in the app."},{name:"Stripe webhook",ok:integrations.stripeWebhook,detail:"Payment events can reach the webhook route."},{name:"Entitlement sync",ok:integrations.entitlementSync,detail:"Server-side Supabase entitlement sync is configured."},{name:"Test-mode Checkout",ok:integrations.testCheckout,detail:integrations.testCheckout ? "Test secret and test Price IDs are configured." : `Missing: ${integrations.testCheckoutMissing.join(", ")}`},{name:"Google Play publishing API",ok:integrations.googlePlayPublishing,detail:integrations.googlePlayPublishing ? "A Play service-account credential is configured." : "No Google Play service-account credential is configured."},{name:"Google Ads API",ok:integrations.googleAdsApi,detail:integrations.googleAdsApi ? "Google Ads API credentials are configured." : "No Google Ads API credentials are configured."},{name:"AI campaign generation",ok:integrations.aiGateway,detail:integrations.aiGateway ? "An AI Gateway credential is configured; usage may be billable." : "Uses the no-cost deterministic campaign fallback."}]).map(item=><article key={item.name} className="rounded-xl border border-slate-200 p-3"><div className="flex items-center gap-2">{item.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-700"/> : <CircleAlert className="h-4 w-4 text-amber-700"/>}<h3 className="font-bold">{item.name}</h3></div><p className="mt-2 text-sm leading-5 text-slate-600">{item.detail}</p><p className={`mt-2 text-xs font-extrabold uppercase ${item.ok ? "text-emerald-700" : "text-amber-700"}`}>{item.ok ? "Configured" : "Needs setup"}</p></article>)}</div>}{!integrations && !integrationError && <p className="mt-3 text-sm text-slate-500">Run release-readiness checks to inspect integrations.</p>}</section>
    <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5"><h2 className="font-extrabold text-amber-950">Manual Play Console checks still required</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-amber-950"><li>Confirm package <code>com.plainjane.streetspot</code> and highest uploaded version code.</li><li>Confirm signing certificate, target API, permissions, Data safety, and app-content declarations.</li><li>Install and test the exact signed bundle before submitting.</li><li>Confirm listing copy, screenshots, privacy, and support URLs.</li></ul><a href="https://play.google.com/console/" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-xl border border-amber-400 bg-white px-4 py-3 text-sm font-bold">Open Google Play Console <ExternalLink className="h-4 w-4" /></a></section>
  </div></main>
}
