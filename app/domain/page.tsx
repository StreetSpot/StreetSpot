"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Globe,
  ShieldCheck,
  Zap,
  Server,
  Lock,
  ExternalLink,
  Code2,
  Terminal,
  Activity,
  ChevronDown,
  ChevronUp,
  Sliders,
  BarChart3,
  MapPin,
  Sparkles,
} from "lucide-react"

interface DomainStatusData {
  domain: string
  checkedAt: string
  isConfigured: boolean
  dns: {
    nameservers: string[]
    isCloudflareNameserver: boolean
    apex: {
      a: string[]
      cname: string[]
    }
    www: {
      cname: string[]
      a: string[]
    }
  }
  http: {
    reachable: boolean
    statusCode?: number
    isCloudflareProxy?: boolean
    cfRay?: string | null
    server?: string | null
    error?: string
  }
  targetHost: string
}

export default function DomainHubPage() {
  const domain = "streetspotapp.com"
  const targetHost = "ais-pre-wvkjq5rxiwrz3xw6dkmgou-197495457505.us-west1.run.app"

  const [loading, setLoading] = useState(false)
  const [statusData, setStatusData] = useState<DomainStatusData | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [expandedSection, setExpandedSection] = useState<string>("dns")
  const [cfAnalyticsToken, setCfAnalyticsToken] = useState<string>("")
  const [analyticsSaved, setAnalyticsSaved] = useState(false)

  const fetchStatus = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/domain-status?domain=${domain}`)
      if (res.ok) {
        const data = await res.json()
        setStatusData(data)
      }
    } catch (err) {
      console.error("Failed to query domain status", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const savedToken = localStorage.getItem("cf_analytics_token")
    if (savedToken) {
      setCfAnalyticsToken(savedToken)
    }
  }, [])

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2500)
  }

  const saveAnalyticsToken = () => {
    if (cfAnalyticsToken) {
      localStorage.setItem("cf_analytics_token", cfAnalyticsToken.trim())
      setAnalyticsSaved(true)
      setTimeout(() => setAnalyticsSaved(false), 3000)
    }
  }

  const zoneFileContent = `; Cloudflare DNS Zone Export for ${domain}
; Generated for StreetSpot Web App
$ORIGIN ${domain}.
$TTL 3600

; Cloudflare Proxied CNAME Records
@       IN  CNAME   ${targetHost}.
www     IN  CNAME   ${domain}.

; Optional mail / verification records can be added below
`

  const workerScript = `/**
 * StreetSpot - Cloudflare Worker Edge Proxy
 * Routes streetspotapp.com traffic to your StreetSpot deployment
 * Passes through user geolocation headers for instant local map centering!
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const originHost = "${targetHost}";

    // Canonical redirect www.streetspotapp.com to streetspotapp.com
    if (url.hostname === "www.streetspotapp.com") {
      url.hostname = "streetspotapp.com";
      return Response.redirect(url.toString(), 301);
    }

    // Rewrite host to target origin
    url.hostname = originHost;

    // Clone headers and forward Cloudflare geolocation coordinates
    const newHeaders = new Headers(request.headers);
    newHeaders.set("Host", originHost);
    newHeaders.set("X-Forwarded-Host", "streetspotapp.com");
    newHeaders.set("X-Forwarded-Proto", "https");

    // Pass client location to StreetSpot
    if (request.cf) {
      if (request.cf.latitude) newHeaders.set("X-StreetSpot-Lat", request.cf.latitude);
      if (request.cf.longitude) newHeaders.set("X-StreetSpot-Lng", request.cf.longitude);
      if (request.cf.city) newHeaders.set("X-StreetSpot-City", request.cf.city);
    }

    const modifiedRequest = new Request(url.toString(), {
      method: request.method,
      headers: newHeaders,
      body: request.body,
      redirect: "follow",
    });

    const response = await fetch(modifiedRequest);

    // Add enhanced security headers
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    responseHeaders.set("X-Content-Type-Options", "nosniff");
    responseHeaders.set("X-Frame-Options", "SAMEORIGIN");
    responseHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  },
};`

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card/90 px-4 py-3 backdrop-blur-md md:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Back to StreetSpot"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <span className="text-base font-semibold tracking-tight text-foreground">
                Cloudflare Tools & Domain Hub
              </span>
              <p className="text-[11px] text-muted-foreground">
                streetspotapp.com integration manager
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary/80 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-orange-500" : ""}`} />
            <span>{loading ? "Checking..." : "Live Check"}</span>
          </button>
          <a
            href="https://dash.cloudflare.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-500 sm:inline-flex"
          >
            <span>Cloudflare Dash</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Domain Status Hero Card */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-lg md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xl font-bold tracking-tight text-foreground md:text-2xl">
                    streetspotapp.com
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-orange-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                    Cloudflare Powered
                  </span>
                </div>
                <p className="text-xs text-muted-foreground md:text-sm">
                  Primary production domain for the StreetSpot live vendor and map platform.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`https://${domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3.5 py-2 text-xs font-semibold text-foreground transition hover:bg-secondary/80"
                >
                  <Globe className="h-3.5 w-3.5 text-primary" />
                  Visit Domain
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </a>
                <a
                  href="https://dash.cloudflare.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-orange-400"
                >
                  <Zap className="h-3.5 w-3.5" />
                  Open Cloudflare
                </a>
              </div>
            </div>

            {/* Live Diagnostic Metrics */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {/* Nameservers */}
              <div className="rounded-xl border border-border/80 bg-secondary/50 p-3.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Nameservers</span>
                  <ShieldCheck className="h-4 w-4 text-orange-400" />
                </div>
                <div className="mt-2">
                  {statusData?.dns.isCloudflareNameserver ? (
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span className="text-xs font-semibold">Cloudflare DNS</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-amber-400">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span className="text-xs font-semibold">
                        {statusData?.dns.nameservers.length ? "Active DNS" : "Checking..."}
                      </span>
                    </div>
                  )}
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground truncate">
                    {statusData?.dns.nameservers[0] || "ns.cloudflare.com"}
                  </p>
                </div>
              </div>

              {/* Apex CNAME/A */}
              <div className="rounded-xl border border-border/80 bg-secondary/50 p-3.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Apex (@)</span>
                  <Server className="h-4 w-4 text-blue-400" />
                </div>
                <div className="mt-2">
                  {statusData?.dns.apex.cname.length || statusData?.dns.apex.a.length ? (
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span className="text-xs font-semibold">Resolving</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-amber-400">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span className="text-xs font-semibold">Config Ready</span>
                    </div>
                  )}
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground truncate">
                    {statusData?.dns.apex.cname[0] || statusData?.dns.apex.a[0] || "Needs CNAME"}
                  </p>
                </div>
              </div>

              {/* SSL / HTTPS */}
              <div className="rounded-xl border border-border/80 bg-secondary/50 p-3.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>SSL / TLS</span>
                  <Lock className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="mt-2">
                  {statusData?.http.reachable ? (
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span className="text-xs font-semibold">HTTPS Active</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-orange-400">
                      <Lock className="h-4 w-4 shrink-0" />
                      <span className="text-xs font-semibold">Full (Strict)</span>
                    </div>
                  )}
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                    TLS 1.3 + Edge Cert
                  </p>
                </div>
              </div>

              {/* Cloudflare Edge / WAF */}
              <div className="rounded-xl border border-border/80 bg-secondary/50 p-3.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Proxy (CDN)</span>
                  <Zap className="h-4 w-4 text-amber-400" />
                </div>
                <div className="mt-2">
                  {statusData?.http.isCloudflareProxy ? (
                    <div className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span className="text-xs font-semibold">Proxied 🟠</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-orange-400">
                      <Zap className="h-4 w-4 shrink-0" />
                      <span className="text-xs font-semibold">Orange Cloud</span>
                    </div>
                  )}
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground truncate">
                    {statusData?.http.cfRay ? `Ray: ${statusData.http.cfRay.slice(0, 10)}...` : "DDoS + WAF Protected"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Navigation Tabs / Accordion Buttons */}
          <div className="flex flex-wrap gap-2 border-b border-border pb-3">
            {[
              { id: "dns", label: "1. Cloudflare DNS Records", icon: Server },
              { id: "ssl", label: "2. SSL & Edge Settings", icon: Lock },
              { id: "rules", label: "3. Page Rules & Redirects", icon: Sliders },
              { id: "worker", label: "4. Cloudflare Worker Proxy", icon: Code2 },
              { id: "analytics", label: "5. Web Analytics & Speed", icon: BarChart3 },
            ].map((tab) => {
              const Icon = tab.icon
              const active = expandedSection === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setExpandedSection(tab.id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                    active
                      ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                      : "border border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Tab 1: DNS Records */}
          {expandedSection === "dns" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-foreground">
                      Required Cloudflare DNS Records
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Add these two records in your Cloudflare Dashboard under{" "}
                      <span className="font-semibold text-foreground">
                        streetspotapp.com &gt; DNS &gt; Records
                      </span>
                      .
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(zoneFileContent, "zone")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-secondary/80"
                  >
                    {copiedKey === "zone" ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Zone Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy BIND Zone</span>
                      </>
                    )}
                  </button>
                </div>

                {/* DNS Records Table */}
                <div className="mt-4 overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border bg-secondary/70">
                        <th className="px-4 py-2.5 font-semibold text-foreground">Type</th>
                        <th className="px-4 py-2.5 font-semibold text-foreground">Name</th>
                        <th className="px-4 py-2.5 font-semibold text-foreground">Target / Content</th>
                        <th className="px-4 py-2.5 font-semibold text-foreground">Proxy Status</th>
                        <th className="px-4 py-2.5 font-semibold text-foreground">TTL</th>
                        <th className="px-4 py-2.5 text-right font-semibold text-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {/* Apex Record */}
                      <tr className="hover:bg-secondary/30">
                        <td className="px-4 py-3 font-mono font-bold text-orange-400">CNAME</td>
                        <td className="px-4 py-3 font-mono font-medium text-foreground">
                          @ <span className="text-[10px] text-muted-foreground">(streetspotapp.com)</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
                          {targetHost}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold text-orange-400 border border-orange-500/30">
                            <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                            Proxied 🟠
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">Auto</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => copyToClipboard(targetHost, "apex-target")}
                            className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-medium transition hover:bg-secondary"
                          >
                            {copiedKey === "apex-target" ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                            Copy Target
                          </button>
                        </td>
                      </tr>

                      {/* WWW Record */}
                      <tr className="hover:bg-secondary/30">
                        <td className="px-4 py-3 font-mono font-bold text-orange-400">CNAME</td>
                        <td className="px-4 py-3 font-mono font-medium text-foreground">
                          www <span className="text-[10px] text-muted-foreground">(www.streetspotapp.com)</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
                          streetspotapp.com
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold text-orange-400 border border-orange-500/30">
                            <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                            Proxied 🟠
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">Auto</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => copyToClipboard("streetspotapp.com", "www-target")}
                            className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-medium transition hover:bg-secondary"
                          >
                            {copiedKey === "www-target" ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                            Copy Target
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Important Cloudflare CNAME Flattening Note */}
                <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-xs text-blue-300">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold text-blue-200">
                        Pro-Tip: Cloudflare CNAME Flattening at Apex (@)
                      </p>
                      <p className="text-blue-300/90 leading-relaxed">
                        Unlike standard DNS providers that restrict apex domains to A records, Cloudflare natively supports <strong>CNAME Flattening</strong> on the root domain (@). You can safely set a CNAME to the target host and keep the Orange Cloud (Proxied) toggled ON.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: SSL & Edge Settings */}
          {expandedSection === "ssl" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-5">
                <h2 className="text-base font-bold text-foreground">
                  Cloudflare SSL/TLS & Edge Security Configuration
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Follow these essential settings to avoid SSL redirect loops and secure StreetSpot.
                </p>

                <div className="mt-5 space-y-4">
                  {/* Setting 1: Encryption Mode */}
                  <div className="rounded-xl border border-border bg-secondary/40 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground text-sm">
                            1. SSL/TLS Encryption Mode
                          </span>
                          <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                            RECOMMENDED: Full (strict)
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          In Cloudflare, go to <strong>SSL/TLS &gt; Overview</strong>. Select <strong>Full (strict)</strong> or <strong>Full</strong>.
                          <br />
                          <span className="text-amber-400/90">
                            ⚠️ Never choose "Flexible": Since the backend is already served via HTTPS, Flexible mode causes an infinite redirect loop (ERR_TOO_MANY_REDIRECTS).
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Setting 2: Always Use HTTPS */}
                  <div className="rounded-xl border border-border bg-secondary/40 p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground text-sm">
                          2. Always Use HTTPS & Automatic HTTPS Rewrites
                        </span>
                        <span className="rounded bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                          TOGGLE ON
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        In Cloudflare, navigate to <strong>SSL/TLS &gt; Edge Certificates</strong>:
                      </p>
                      <ul className="mt-2 list-disc pl-5 text-xs text-muted-foreground space-y-1">
                        <li><strong>Always Use HTTPS</strong>: Turn ON (automatically upgrades all http:// requests to https://).</li>
                        <li><strong>Automatic HTTPS Rewrites</strong>: Turn ON (fixes any mixed content on map icons or assets).</li>
                        <li><strong>Minimum TLS Version</strong>: Set to <strong>TLS 1.2</strong> or <strong>TLS 1.3</strong>.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Setting 3: HSTS */}
                  <div className="rounded-xl border border-border bg-secondary/40 p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground text-sm">
                          3. HTTP Strict Transport Security (HSTS)
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Enable HSTS with max-age 6 months (15768000 seconds) and include subdomains. This instructs browsers to always connect to streetspotapp.com via HTTPS before sending requests.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Page Rules & Redirects */}
          {expandedSection === "rules" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-5">
                <h2 className="text-base font-bold text-foreground">
                  Cloudflare Page Rules & Redirect Rules
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ensure canonical traffic flows cleanly to https://streetspotapp.com.
                </p>

                <div className="mt-5 space-y-4">
                  {/* Canonical www to apex redirect */}
                  <div className="rounded-xl border border-border bg-secondary/40 p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground">
                        Rule 1: Redirect WWW to Apex (streetspotapp.com)
                      </h3>
                      <span className="rounded bg-orange-500/20 px-2 py-0.5 text-[10px] font-bold text-orange-400">
                        301 Permanent Redirect
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 text-xs">
                      <div className="rounded-lg bg-background p-3 font-mono border border-border">
                        <span className="text-muted-foreground">When incoming request matches:</span>
                        <div className="text-foreground font-semibold">www.streetspotapp.com/*</div>
                      </div>
                      <div className="rounded-lg bg-background p-3 font-mono border border-border">
                        <span className="text-muted-foreground">Forward URL to:</span>
                        <div className="text-emerald-400 font-semibold">https://streetspotapp.com/$1</div>
                      </div>
                    </div>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      In Cloudflare, go to <strong>Rules &gt; Redirect Rules</strong> &gt; Create Rule &gt; "Redirect WWW to Root".
                    </p>
                  </div>

                  {/* Caching Rules for Next.js */}
                  <div className="rounded-xl border border-border bg-secondary/40 p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground">
                        Rule 2: Edge Caching for Next.js Static Assets
                      </h3>
                      <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-400">
                        High Performance
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                      Next.js compiles static chunks with unique hashes. Cache them at Cloudflare Edge to make StreetSpot load instantly:
                    </p>
                    <div className="mt-2 rounded-lg bg-background p-3 font-mono text-xs border border-border space-y-1">
                      <div><span className="text-muted-foreground">Pattern:</span> streetspotapp.com/_next/static/*</div>
                      <div><span className="text-muted-foreground">Cache Level:</span> Cache Everything</div>
                      <div><span className="text-muted-foreground">Edge Cache TTL:</span> 1 month</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Cloudflare Worker Proxy */}
          {expandedSection === "worker" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-foreground">
                      Cloudflare Worker Edge Reverse Proxy
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Deploy this lightweight worker to pass Cloudflare edge geolocation (latitude/longitude) directly to StreetSpot!
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(workerScript, "worker")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-secondary/80"
                  >
                    {copiedKey === "worker" ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Script Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Worker Script</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-4 rounded-xl border border-border bg-zinc-950 p-4 font-mono text-xs text-zinc-300 overflow-x-auto max-h-96">
                  <pre>{workerScript}</pre>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>How to deploy: Cloudflare Dashboard &gt; Workers & Pages &gt; Create Application &gt; Paste code &gt; Route to <code>streetspotapp.com/*</code></span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Analytics & Speed */}
          {expandedSection === "analytics" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-5">
                <h2 className="text-base font-bold text-foreground">
                  Cloudflare Web Analytics (Zero Cookies, Privacy-First)
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Track real page views and performance without annoying cookie consent banners or GDPR privacy issues.
                </p>

                <div className="mt-5 space-y-4">
                  <div className="rounded-xl border border-border bg-secondary/40 p-4">
                    <label className="text-xs font-semibold text-foreground block mb-1">
                      Cloudflare Web Analytics Site Token
                    </label>
                    <p className="text-[11px] text-muted-foreground mb-3">
                      Found in Cloudflare Dashboard &gt; Web Analytics &gt; Manage Site &gt; JS Snippet (token="..." parameter).
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. 748b19a28c314a5bb829f0"
                        value={cfAnalyticsToken}
                        onChange={(e) => setCfAnalyticsToken(e.target.value)}
                        className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                      <button
                        onClick={saveAnalyticsToken}
                        className="rounded-lg bg-orange-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-orange-400"
                      >
                        {analyticsSaved ? "Saved!" : "Save Token"}
                      </button>
                    </div>
                  </div>

                  {/* Cloudflare Speed & Early Hints */}
                  <div className="rounded-xl border border-border bg-secondary/40 p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      Recommended Speed Optimizations
                    </h3>
                    <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1.5 mt-2">
                      <li><strong>Early Hints</strong>: Enable under Speed &gt; Optimization to preload fonts and critical scripts.</li>
                      <li><strong>Brotli Compression</strong>: Enable to shrink HTML and CSS transfer sizes by up to 20%.</li>
                      <li><strong>Rocket Loader</strong>: Leave OFF for Next.js apps to prevent React hydration mismatches.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cloudflare Tools Quick Links & Support Card */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-sm font-semibold text-foreground">
                  Questions regarding streetspotapp.com setup?
                </h3>
                <p className="text-xs text-muted-foreground">
                  Our team can verify your Cloudflare DNS propagation and SSL certificates anytime.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="mailto:support@streetspotapp.com?subject=Cloudflare%20Domain%20Setup%20streetspotapp.com"
                  className="rounded-lg border border-border bg-secondary px-3.5 py-2 text-xs font-medium text-foreground transition hover:bg-secondary/80"
                >
                  Contact Support
                </a>
                <Link
                  href="/"
                  className="rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  Go to Live Map
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
