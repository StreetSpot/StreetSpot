"use client"

import { useState, useEffect, useCallback } from "react"
import {
  MapPin,
  Clock,
  Power,
  PowerOff,
  Navigation,
  Crown,
  Radio,
  AlertCircle,
  Sparkles,
  Shield,
  TrendingUp,
  Zap,
  Check,
  ExternalLink,
  Mail,
  CheckCircle2,
  X,
} from "lucide-react"
import { vendorStore, useVendors, type Vendor } from "@/lib/vendor-store"

const STRIPE_URL = "https://buy.stripe.com/dRmfZgbv4fDzepddxY63K00"

function getStripeCheckoutUrl() {
  const origin = typeof window !== "undefined" ? window.location.origin : ""
  return STRIPE_URL
    + (STRIPE_URL.includes("?") ? "&" : "?")
    + "success_url=" + encodeURIComponent(origin + "/success")
    + "&cancel_url=" + encodeURIComponent(origin + "/?cancelled=true")
}

const SUPPORT_EMAIL = "support@streetspot.app"
const SUPPORT_SUBJECT = "StreetSpot Support Request"
const SUPPORT_BODY =
  "Hi StreetSpot Team,%0D%0A%0D%0AI need help with my account.%0D%0A%0D%0ABusiness Name: %0D%0AIssue: %0D%0A%0D%0AThank you."

interface VendorDashboardProps {
  businessName: string
  initialGold?: boolean
}

/* ───── Success toast ───── */
function SuccessToast({
  message,
  onDismiss,
}: {
  message: string
  onDismiss: () => void
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div
      className="fixed left-4 right-4 top-20 z-[9999] mx-auto max-w-sm"
      style={{ animation: "toast-enter .35s ease-out" }}
    >
      <div className="flex items-center gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] px-4 py-3 shadow-xl shadow-black/30 backdrop-blur-md">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        </div>
        <p className="flex-1 text-sm font-medium text-emerald-300">
          {message}
        </p>
        <button
          onClick={onDismiss}
          className="shrink-0 rounded-md p-1 text-emerald-400/60 transition-colors hover:text-emerald-300"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

/* ───── Main dashboard ───── */
export function VendorDashboard({
  businessName,
  initialGold = false,
}: VendorDashboardProps) {
  const vendors = useVendors()
  const [vendorId] = useState(() => `vendor-${Date.now()}`)
  const [description, setDescription] = useState("")
  const [closingTime, setClosingTime] = useState("22:00")
  const [isLive, setIsLive] = useState(false)
  const [isPremium, setIsPremium] = useState(initialGold)
  const [location, setLocation] = useState<{
    lat: number
    lng: number
  } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const myVendor = vendors.find((v) => v.id === vendorId)

  // Check for returning from Stripe via sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return
    const goldFlag = sessionStorage.getItem("streetspot_gold_active")
    if (goldFlag === "true" || initialGold) {
      setIsPremium(true)
      setToast("Gold Status activated! Your pin is now featured.")
      sessionStorage.removeItem("streetspot_gold_active")
    }
  }, [initialGold])

  const getLocation = useCallback(() => {
    setIsLocating(true)
    setLocationError(null)
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser")
      setIsLocating(false)
      setLocation({ lat: 40.7128, lng: -74.006 })
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setIsLocating(false)
      },
      () => {
        setLocationError("Unable to get location. Using default.")
        setLocation({ lat: 40.7128, lng: -74.006 })
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  useEffect(() => {
    getLocation()
  }, [getLocation])

  function handleGoLive() {
    if (!location) return
    if (isLive) {
      vendorStore.updateVendor(vendorId, { isLive: false })
      setIsLive(false)
    } else {
      if (myVendor) {
        vendorStore.updateVendor(vendorId, {
          name: businessName,
          description: description || "Street vendor",
          lat: location.lat,
          lng: location.lng,
          closingTime,
          isLive: true,
          isPremium,
        })
      } else {
        const vendor: Vendor = {
          id: vendorId,
          name: businessName,
          description: description || "Street vendor",
          lat: location.lat,
          lng: location.lng,
          closingTime,
          isLive: true,
          isPremium,
          createdAt: Date.now(),
        }
        vendorStore.addVendor(vendor)
      }
      // Persist vendor ID for Stripe return flow
      if (typeof window !== "undefined") {
        sessionStorage.setItem("streetspot_vendor_id", vendorId)
      }
      setIsLive(true)
      setToast("You are now live on the map!")
    }
  }

  function handleDeactivateGold() {
    setIsPremium(false)
    if (isLive) vendorStore.updateVendor(vendorId, { isPremium: false })
  }

  function handleUpdateLocation() {
    getLocation()
    if (location && isLive) {
      vendorStore.updateVendor(vendorId, {
        lat: location.lat,
        lng: location.lng,
      })
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:py-8">
      {toast && (
        <SuccessToast message={toast} onDismiss={() => setToast(null)} />
      )}

      {/* ── Status banner ── */}
      <div
        className={`mb-6 flex items-center gap-3 rounded-lg border px-4 py-3 ${
          isLive
            ? "border-primary/30 bg-primary/5"
            : "border-border bg-card"
        }`}
      >
        <div
          className={`h-2.5 w-2.5 rounded-full ${
            isLive ? "bg-primary animate-pulse" : "bg-muted-foreground"
          }`}
        />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            {isLive ? "You are live on the map" : "You are currently offline"}
          </p>
          <p className="text-xs text-muted-foreground">
            {isLive
              ? `Visible to Finders until ${closingTime}${isPremium ? " \u00B7 Gold placement active" : ""}`
              : "Go live to appear on the Finder map"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isPremium && isLive && (
            <Crown className="h-4 w-4 text-amber-500" />
          )}
          <Radio
            className={`h-5 w-5 ${
              isLive ? "text-primary" : "text-muted-foreground"
            }`}
          />
        </div>
      </div>

      {/* ── Business details ── */}
      <div className="mb-6 rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Business Details
        </h3>
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Business Name
            </label>
            <div className="flex h-10 w-full items-center rounded-lg border border-border bg-secondary px-3.5 text-sm text-foreground">
              {businessName}
            </div>
          </div>
          <div>
            <label
              htmlFor="desc"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Short Description
            </label>
            <textarea
              id="desc"
              placeholder="What do you sell? Keep it short and clear."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                if (isLive)
                  vendorStore.updateVendor(vendorId, {
                    description: e.target.value,
                  })
              }}
              rows={2}
              maxLength={120}
              className="w-full resize-none rounded-lg border border-border bg-input px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="mt-1 text-right text-xs text-muted-foreground">
              {description.length}/120
            </p>
          </div>
          <div>
            <label
              htmlFor="closing"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              <Clock className="mr-1.5 inline h-3.5 w-3.5 text-muted-foreground" />
              Closing Time
            </label>
            <input
              id="closing"
              type="time"
              value={closingTime}
              onChange={(e) => {
                setClosingTime(e.target.value)
                if (isLive)
                  vendorStore.updateVendor(vendorId, {
                    closingTime: e.target.value,
                  })
              }}
              className="h-10 w-full rounded-lg border border-border bg-input px-3.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary [color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      {/* ── Location ── */}
      <div className="mb-6 rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Location
        </h3>
        {locationError && (
          <div className="mb-3 flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{locationError}</span>
          </div>
        )}
        {location ? (
          <div className="mb-4 flex items-center gap-3 rounded-lg bg-secondary px-4 py-3">
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
            <div className="font-mono text-xs text-foreground">
              {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </div>
          </div>
        ) : (
          <div className="mb-4 flex items-center justify-center rounded-lg bg-secondary px-4 py-6">
            <p className="text-sm text-muted-foreground">
              {isLocating
                ? "Acquiring GPS signal..."
                : "Location not available"}
            </p>
          </div>
        )}
        <button
          onClick={handleUpdateLocation}
          disabled={isLocating}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-secondary text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40"
        >
          <Navigation className="h-4 w-4" />
          <span>{isLocating ? "Locating..." : "Refresh Location"}</span>
        </button>
      </div>

      {/* ── Go Live ── */}
      <button
        onClick={handleGoLive}
        disabled={!location}
        className={`mb-6 flex h-12 w-full items-center justify-center gap-2.5 rounded-xl text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
          isLive
            ? "border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20"
            : "bg-primary text-primary-foreground hover:opacity-90"
        }`}
      >
        {isLive ? (
          <>
            <PowerOff className="h-4 w-4" />
            <span>Go Offline</span>
          </>
        ) : (
          <>
            <Power className="h-4 w-4" />
            <span>Go Live</span>
          </>
        )}
      </button>

      {/* ── Gold Status ── */}
      <div
        className={`mb-6 overflow-hidden rounded-xl border ${
          isPremium
            ? "border-amber-500/30 bg-gradient-to-b from-amber-500/[0.05] to-card"
            : "border-border bg-card"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-4 ${
            isPremium ? "border-b border-amber-500/15" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 ${
                isPremium
                  ? "bg-amber-500/15 ring-amber-500/30"
                  : "bg-amber-500/10 ring-amber-500/20"
              }`}
              style={
                isPremium
                  ? { animation: "gold-badge-pulse 2s ease-in-out infinite" }
                  : undefined
              }
            >
              <Crown className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-foreground">
                  Gold Status
                </h4>
                {isPremium ? (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 ring-1 ring-emerald-500/20">
                    <Check className="h-2.5 w-2.5" />
                    Active
                  </span>
                ) : (
                  <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-500">
                    Pro
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {isPremium
                  ? "Your pin has gold glow and top placement"
                  : "Get priority visibility on the map"}
              </p>
            </div>
          </div>
          {isPremium && (
            <button
              onClick={handleDeactivateGold}
              className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Deactivate
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-5 pb-5 pt-4">
          {isPremium ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 rounded-lg bg-amber-500/[0.06] px-3.5 py-3 ring-1 ring-amber-500/10">
                <Sparkles className="h-4 w-4 shrink-0 text-amber-500" />
                <p className="text-xs leading-relaxed text-foreground/80">
                  Your pin now has a pulsing gold glow and is prioritized at the
                  top of all vendor lists for Finders.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: TrendingUp, label: "Top Placement" },
                  { icon: Sparkles, label: "Gold Glow Pin" },
                  { icon: Crown, label: "Featured Tag" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-1.5 rounded-lg bg-secondary px-2 py-3 text-center"
                  >
                    <Icon className="h-4 w-4 text-amber-500" />
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-center text-[11px] text-muted-foreground">
                Statement descriptor: STREETSPOT &middot; $0.99/week
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Upgrade to Gold for top-of-map placement. Your pin gets a
                pulsing gold glow that draws every Finder&rsquo;s eye.
              </p>

              {/* Feature list */}
              <div className="flex flex-col gap-2.5">
                {[
                  {
                    icon: TrendingUp,
                    title: "Top-of-Map Placement",
                    desc: "Always appear above standard pins",
                  },
                  {
                    icon: Sparkles,
                    title: "Pulsing Gold Glow Pin",
                    desc: "Premium visual that draws attention",
                  },
                  {
                    icon: Shield,
                    title: "Featured Vendor Badge",
                    desc: "Trusted vendor badge on your listing",
                  },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-center gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amber-500/10">
                      <Icon className="h-3.5 w-3.5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">
                        {title}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="rounded-lg bg-secondary px-4 py-3">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-foreground">
                    $0.99
                  </span>
                  <span className="text-xs text-muted-foreground">/week</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  SaaS &middot; Personal Use &middot; Cancel anytime
                </p>
              </div>

              {/* CTA - direct Stripe redirect */}
              <a
                href={getStripeCheckoutUrl()}
                rel="noopener noreferrer"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all hover:shadow-amber-500/30 hover:brightness-110"
              >
                <Zap className="h-4 w-4" />
                Activate Gold Status
                <ExternalLink className="h-3.5 w-3.5 opacity-60" />
              </a>

              <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                <Shield className="h-3 w-3" />
                Secure checkout powered by Stripe &middot; STREETSPOT
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Settings & Support ── */}
      <div className="mb-6 rounded-xl border border-border bg-card p-5">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Settings
        </h3>
        <div className="flex flex-col gap-2.5">
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=${SUPPORT_SUBJECT}&body=${SUPPORT_BODY}`}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-secondary text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Mail className="h-4 w-4 text-muted-foreground" />
            Contact Support
          </a>
          <p className="text-center text-[11px] text-muted-foreground">
            Opens a pre-filled email so we can assist you quickly.
          </p>
        </div>
      </div>
    </div>
  )
}
