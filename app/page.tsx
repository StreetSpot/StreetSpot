"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { MapPin, Globe, Wrench } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { RoleSelector } from "@/components/role-selector"
import { VendorLogin, type StreetSpotAuthSession } from "@/components/vendor-login"
import { VendorDashboard } from "@/components/vendor-dashboard"
import { FinderTools } from "@/components/finder/finder-tools"

const VendorMap = dynamic(
  () => import("@/components/vendor-map").then((mod) => mod.VendorMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[calc(100dvh-57px)] items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    ),
  }
)

export default function HomePage() {
  return <HomeContent />
}

type AppView = "landing" | "founder-login" | "founder-dashboard" | "finder"
type FinderTab = "map" | "tools"

function HomeContent() {
  const [view, setView] = useState<AppView>("landing")
  const [businessName, setBusinessName] = useState("")
  const [authSession, setAuthSession] = useState<StreetSpotAuthSession | null>(null)
  const [finderTab, setFinderTab] = useState<FinderTab>("map")

  useEffect(() => {
    window.history.replaceState({ streetSpotView: "landing" }, "", window.location.href)
    const restoreSession = () => {
      try {
        const saved = sessionStorage.getItem("streetspot_auth_session")
        if (saved) {
          const session = JSON.parse(saved) as StreetSpotAuthSession
          if (session.access_token && session.refresh_token && session.user?.id) {
            setAuthSession(session)
            setBusinessName(session.user.user_metadata?.business_name || session.user.email?.split("@")[0] || "StreetSpot Vendor")
            setView("founder-dashboard")
            window.history.replaceState({ streetSpotView: "founder-dashboard" }, "", window.location.href)
          } else sessionStorage.removeItem("streetspot_auth_session")
        }
      } catch { sessionStorage.removeItem("streetspot_auth_session") }
    }
    const restoreTimer = window.setTimeout(restoreSession, 0)
    const restoreView = (event: PopStateEvent) => {
      const next = event.state?.streetSpotView
      setView(next === "founder-login" || next === "founder-dashboard" || next === "finder" ? next : "landing")
    }
    window.addEventListener("popstate", restoreView)
    return () => { window.clearTimeout(restoreTimer); window.removeEventListener("popstate", restoreView) }
  }, [])

  function navigateView(next: AppView) {
    window.history.pushState({ streetSpotView: next }, "", window.location.href)
    setView(next)
  }

  function handleRoleSelect(role: "founder" | "finder") {
    if (role === "founder") {
      navigateView("founder-login")
    } else {
      navigateView("finder")
      setFinderTab("map")
    }
  }

  function handleLogin(name: string, session: StreetSpotAuthSession) {
    setBusinessName(name)
    setAuthSession(session)
    navigateView("founder-dashboard")
  }

  function handleSignOut() {
    sessionStorage.removeItem("streetspot_auth_session")
    sessionStorage.removeItem("streetspot_vendor_id")
    setAuthSession(null)
    setBusinessName("")
    setView("landing")
    window.history.replaceState({ streetSpotView: "landing" }, "", window.location.href)
  }

  function handleBack() {
    if (view !== "landing" && window.history.state?.streetSpotView) {
      window.history.back()
      return
    }
    setView("landing")
  }

  const headerMode =
    view === "landing"
      ? "landing"
      : view === "finder"
        ? "finder"
        : "founder"

  const showFooter = true

  return (
    <div className="streetspot-app-shell flex min-h-dvh flex-col bg-background">
      <AppHeader mode={headerMode} onBack={handleBack} />
      <main className="flex-1">
        {view === "landing" && <RoleSelector onSelect={handleRoleSelect} />}
        {view === "founder-login" && <VendorLogin onLogin={handleLogin} />}
        {view === "founder-dashboard" && (authSession ? <VendorDashboard
          businessName={businessName}
          userId={authSession.user.id}
          accessToken={authSession.access_token}
          email={authSession.user.email ?? ""}
          onSignOut={handleSignOut}
        /> : <VendorLogin onLogin={handleLogin} />)}
        {view === "finder" && (
          <div className="flex flex-col">
            {/* Finder tabs: Map | Tools (gems, parking, travel) */}
            <div className="flex border-b border-border bg-card">
              <button
                onClick={() => setFinderTab("map")}
                className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition ${
                  finderTab === "map"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MapPin className="h-3.5 w-3.5" />
                Live Map
              </button>
              <button
                onClick={() => setFinderTab("tools")}
                className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition ${
                  finderTab === "tools"
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Wrench className="h-3.5 w-3.5" />
                Discover & Tools
              </button>
            </div>
            {finderTab === "map" ? <VendorMap /> : <FinderTools />}
          </div>
        )}
      </main>

      {showFooter && (
        <footer className="border-t border-border bg-card px-4 py-6 md:px-6">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5" aria-label="StreetSpot home">
              <span className="brand-mark relative flex h-7 w-7 items-center justify-center rounded-lg">
                <MapPin className="h-4 w-4" strokeWidth={2.8} />
              </span>
              <span className="brand-wordmark text-sm font-black text-foreground">
                StreetSpot
                <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">LOCAL DISCOVERY • LIVE MAP</span>
              </span>
            </Link>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
  <span className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3" />
          Choose a location to discover nearby spots
        </span>
              <a href="/themes" className="transition-colors hover:text-foreground">Theme Studio</a>
              <a href="/host/invitations" className="transition-colors hover:text-foreground">Private Invitations</a>
              <a href="/vendor-studio" className="transition-colors hover:text-foreground">Vendor Studio</a>
              <a href="/agents" className="transition-colors hover:text-foreground">Agent Control</a>
              <a
                href="/support"
                className="flex items-center gap-1.5 transition-colors hover:text-foreground"
              >
                <Globe className="h-3 w-3" />
                Support
              </a>
            </div>

            <p className="text-center text-[10px] leading-relaxed text-muted-foreground/60">
              {"\u00A9"} {new Date().getFullYear()} $treet$pot. FIND LOCAL. SHOP SMALL. SHOW UP.
            </p>

            <p className="rounded-md border border-border bg-secondary px-3 py-1.5 text-[10px] text-muted-foreground">
              Tip: Add $treet$pot to your Home Screen for a native app
              experience.
            </p>
          </div>
        </footer>
      )}
    </div>
  )
}
