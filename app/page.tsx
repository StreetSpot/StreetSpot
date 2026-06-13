"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import { MapPin, Globe, CreditCard } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { RoleSelector } from "@/components/role-selector"
import { VendorLogin } from "@/components/vendor-login"
import { VendorDashboard } from "@/components/vendor-dashboard"

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
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  )
}

type AppView = "landing" | "founder-login" | "founder-dashboard" | "finder"

function HomeContent() {
  const searchParams = useSearchParams()
  const goldParam = searchParams.get("gold")

  const [view, setView] = useState<AppView>("landing")
  const [businessName, setBusinessName] = useState("")
  const [goldActivated, setGoldActivated] = useState(false)

  // If returning from /success with ?gold=activated, go straight to dashboard
  useEffect(() => {
    if (goldParam === "activated") {
      setGoldActivated(true)
      const savedName =
        typeof window !== "undefined"
          ? sessionStorage.getItem("streetspot_business_name")
          : null
      if (savedName) {
        setBusinessName(savedName)
        setView("founder-dashboard")
      } else {
        setView("founder-login")
      }
    }
  }, [goldParam])

  function handleRoleSelect(role: "founder" | "finder") {
    if (role === "founder") {
      setView("founder-login")
    } else {
      setView("finder")
    }
  }

  function handleLogin(name: string) {
    setBusinessName(name)
    if (typeof window !== "undefined") {
      sessionStorage.setItem("streetspot_business_name", name)
    }
    setView("founder-dashboard")
  }

  function handleBack() {
    setView("landing")
    setBusinessName("")
    setGoldActivated(false)
  }

  const headerMode =
    view === "landing"
      ? "landing"
      : view === "finder"
        ? "finder"
        : "founder"

  const showFooter = view !== "finder"

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AppHeader mode={headerMode} onBack={handleBack} />
      <main className="flex-1">
        {view === "landing" && <RoleSelector onSelect={handleRoleSelect} />}
        {view === "founder-login" && <VendorLogin onLogin={handleLogin} />}
        {view === "founder-dashboard" && (
          <VendorDashboard
            businessName={businessName}
            initialGold={goldActivated}
          />
        )}
        {view === "finder" && <VendorMap />}
      </main>

      {showFooter && (
        <footer className="border-t border-border bg-card px-4 py-6 md:px-6">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
                <MapPin className="h-3 w-3 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                StreetSpot
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3" />
                Manning, SC 29102
              </span>
              <span className="flex items-center gap-1.5">
                <CreditCard className="h-3 w-3" />
                StreetSpot Gold &ndash; $0.99/week
              </span>
              <a
                href="https://v0.app/chat/street-spot-web-app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 transition-colors hover:text-foreground"
              >
                <Globe className="h-3 w-3" />
                Support
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground/50">
              <span>Statement Descriptor: STREETSPOT</span>
              <span>Tax: SaaS &ndash; Personal Use</span>
            </div>

            <p className="text-center text-[10px] leading-relaxed text-muted-foreground/60">
              {"\u00A9"} {new Date().getFullYear()} StreetSpot. All rights
              reserved. Payments processed securely via Stripe.
            </p>

            <p className="rounded-md border border-border bg-secondary px-3 py-1.5 text-[10px] text-muted-foreground">
              Tip: Add StreetSpot to your Home Screen for a native app
              experience.
            </p>
          </div>
        </footer>
      )}
    </div>
  )
}
