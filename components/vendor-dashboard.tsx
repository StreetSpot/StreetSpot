"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  MapPin,
  Clock,
  Power,
  PowerOff,
  Navigation,
  Crown,
  Radio,
  AlertCircle,
  Mail,
  CheckCircle2,
  X,
  Share2,
} from "lucide-react"
import { vendorStore, useVendors, type Vendor } from "@/lib/vendor-store"
import { PremierPinPayment } from "./premier-pin-payment"
import { QuickTravelLog } from "./travel/quick-travel-log"
import { NetEarningsCard } from "./travel/net-earnings-card"
import { MileageDeductionCard } from "./travel/mileage-deduction-card"
import { TravelLogsList } from "./travel/travel-logs-list"
import { VendorMenuEditor } from "./menu/vendor-menu-editor"
import { SaveParking } from "./parking/save-parking"
import { VendorBookingsList } from "./bookings/vendor-bookings-list"
import { ClaimableVendorsList } from "./claim/claimable-vendors-list"
import { VendorInbox } from "./messaging/vendor-inbox"

const SUPPORT_EMAIL = "support@streetspotapp.com"
const SUPPORT_SUBJECT = "StreetSpot Support Request"
const SUPPORT_BODY =
  "Hi StreetSpot Team,%0D%0A%0D%0AI need help with my account.%0D%0A%0D%0ABusiness Name: %0D%0AIssue: %0D%0A%0D%0AThank you."

interface VendorDashboardProps {
  businessName: string
}

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
      <div className="flex items-center gap-3 rounded-xl border border-[#f06435]/25 bg-[#f06435]/[0.08] px-4 py-3 shadow-xl shadow-black/30 backdrop-blur-md">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f06435]/20">
          <CheckCircle2 className="h-4 w-4 text-[#f06435]" />
        </div>
        <p className="flex-1 text-sm font-medium text-[#f06435]">{message}</p>
        <button
          onClick={onDismiss}
          className="shrink-0 rounded-md p-1 text-[#f06435]/60 transition-colors hover:text-[#f06435]"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function VendorDashboard({
  businessName,
}: VendorDashboardProps) {
  const router = useRouter()
  const vendors = useVendors()
  const [vendorId, setVendorId] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("streetspot_vendor_id")
      if (saved && /^[0-9a-f-]{36}$/i.test(saved)) return saved
    }
    return ""
  })
  const [description, setDescription] = useState("")
  const [closingTime, setClosingTime] = useState("22:00")
  const [isPremium, setIsPremium] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  )
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [shareCopied, setShareCopied] = useState(false)

  const myVendor = vendors.find((v) => v.id === vendorId)
  const displayBusinessName = myVendor?.name || businessName
  const isLive = Boolean(myVendor?.isLive)

  useEffect(() => {
    let cancelled = false
    async function loadMyVendor() {
      try {
        const [response, entitlementResponse] = await Promise.all([
          fetch("/api/vendors/mine", { cache: "no-store" }),
          fetch("/api/entitlements", { cache: "no-store" }),
        ])
        if (new URLSearchParams(window.location.search).get("billing") === "active") {
          setToast("You already have an active vendor subscription. No additional charge was started. Contact support to change or cancel the plan.")
        }
        let hasVendorPlan = false
        if (entitlementResponse.ok) {
          const entitlementPayload = await entitlementResponse.json() as { activeFeatures?: string[] }
          hasVendorPlan = Array.isArray(entitlementPayload.activeFeatures) && entitlementPayload.activeFeatures.some(feature => ["vendor_bronze", "vendor_silver", "vendor_gold"].includes(feature))
          if (!cancelled) setIsPremium(hasVendorPlan)
        }
        if (!response.ok) return
        const payload = await response.json() as { vendors?: Vendor[] }
        const saved = payload.vendors?.[0]
        if (!saved || cancelled) return
        setIsPremium(hasVendorPlan || saved.isPremium === true)
        setVendorId(saved.id)
        sessionStorage.setItem("streetspot_vendor_id", saved.id)
        vendorStore.upsertVendor(saved)
        setDescription(saved.description)
        setClosingTime(saved.closingTime)
        if (saved.lat !== 0 || saved.lng !== 0) setLocation({ lat: saved.lat, lng: saved.lng })
      } catch {
        // The dashboard remains available if the account API is temporarily offline.
      }
    }
    void loadMyVendor()
    return () => { cancelled = true }
  }, [])

  const getLocation = useCallback((onLocated?: (position: { lat: number; lng: number }) => void) => {
    setIsLocating(true)
    setLocationError(null)
    if (!navigator.geolocation) {
      setLocationError("Location is unavailable. Allow browser location access to start a preview.")
      setIsLocating(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const position = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setLocation(position)
        onLocated?.(position)
        setIsLocating(false)
      },
      () => {
        setLocationError("Unable to get your location. Allow browser location access and try again.")
        setLocation(null)
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  async function publishVendor(position: { lat: number; lng: number }) {
    if (description.trim().length < 20) {
      setToast("Add an accurate business description of at least 20 characters before going live.")
      return
    }
    if (myVendor?.isClaimedCandidate && description.toLowerCase().includes("unclaimed candidate")) {
      setToast("Replace the catalog placeholder with an accurate description before going live.")
      return
    }
    setLocation(position)
    setLocationError(null)
    try {
      const response = await fetch(vendorId ? `/api/vendors/${vendorId}` : "/api/vendors", {
        method: vendorId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(vendorId ? { isLive: true } : { name: displayBusinessName, category: "vendor" }),
          description,
          lat: position.lat,
          lng: position.lng,
          closingTime,
        }),
        cache: "no-store",
      })
      if (response.status === 401) {
        const next = "/vendor-studio"
        router.push(`/account?next=${encodeURIComponent(next)}`)
        return
      }
      const payload = await response.json().catch(() => ({})) as { ok?: boolean; vendor?: Partial<Vendor>; code?: string; error?: string }
      if (!response.ok || !payload.vendor) {
        setToast(payload.code === "PROFILE_SETUP_REQUIRED" || payload.code === "DESCRIPTION_REQUIRED" ? payload.error ?? "Add an accurate business description before going live." : response.status === 403 || payload.code === "SUPABASE_FORBIDDEN" ? "StreetSpot could not verify an active vendor subscription. Renew or choose a paid plan before going live." : "Publishing failed. Check your account and location, then try again.")
        return
      }
      const saved: Vendor = {
        id: typeof payload.vendor.id === "string" ? payload.vendor.id : vendorId,
        name: displayBusinessName,
        description: description || "Street vendor",
        lat: position.lat,
        lng: position.lng,
        closingTime,
        isLive: true,
        isPremium,
        createdAt: typeof payload.vendor.createdAt === "number" ? payload.vendor.createdAt : myVendor?.createdAt ?? Date.now(),
      }
      setVendorId(saved.id)
      sessionStorage.setItem("streetspot_vendor_id", saved.id)
      vendorStore.upsertVendor(saved)
      setToast("Your business is live on the public StreetSpot map.")
    } catch {
      setToast("StreetSpot could not reach the publishing service. Your changes were not published.")
    }
  }

  async function setVendorLive(nextLive: boolean) {
    if (nextLive) {
      if (description.trim().length < 20 || (myVendor?.isClaimedCandidate && description.toLowerCase().includes("unclaimed candidate"))) {
        setToast("Replace the catalog placeholder with an accurate description of at least 20 characters before going live.")
        return
      }
      if (!isPremium) {
        setToast("An active paid vendor subscription is required to go live. Your listing stays offline until Stripe confirms payment.")
        document.getElementById("vendor-plan")?.scrollIntoView({ behavior: "smooth", block: "center" })
        return
      }
      if (location) await publishVendor(location)
      else getLocation((position) => { void publishVendor(position) })
      return
    }
    if (!vendorId) return
    try {
      const response = await fetch(`/api/vendors/${vendorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLive: false, description, closingTime }),
        cache: "no-store",
      })
      if (!response.ok) {
        setToast("StreetSpot could not take the listing offline. Try again.")
        return
      }
      vendorStore.updateVendor(vendorId, { isLive: false })
      setToast("Your public listing is now offline.")
    } catch {
      setToast("StreetSpot could not reach the publishing service. The listing status was not changed.")
    }
  }

  async function persistVendorDetails() {
    if (!vendorId) return
    const lat = location?.lat ?? myVendor?.lat
    const lng = location?.lng ?? myVendor?.lng
    try {
      const response = await fetch(`/api/vendors/${vendorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLive, description, closingTime, lat, lng }),
        cache: "no-store",
      })
      if (!response.ok) {
        setToast("Business details were not saved. Check your connection and try again.")
        return
      }
      vendorStore.upsertVendor({
        id: vendorId,
        name: displayBusinessName,
        description: description || "Street vendor",
        lat: lat ?? 0,
        lng: lng ?? 0,
        closingTime,
        isLive,
        isPremium,
        createdAt: myVendor?.createdAt ?? Date.now(),
      })
      setToast("Business details saved.")
    } catch {
      setToast("StreetSpot could not save those details.")
    }
  }

  function handleGoLive() {
    void setVendorLive(!isLive)
  }

  function handleUpdateLocation() {
    getLocation((position) => {
      if (isLive) void publishVendor(position)
    })
  }

  async function handleShareLive() {
    const url = "https://streetspotapp.com"
    const text = isLive
      ? `${displayBusinessName} is live on StreetSpot. Find local vendors, businesses, and community spots here: ${url}`
      : `Check out StreetSpot to discover local vendors, businesses, and community spots: ${url}`
    try {
      if (navigator.share) {
        await navigator.share({ title: "StreetSpot", text, url })
      } else {
        await navigator.clipboard.writeText(text)
        setShareCopied(true)
        setTimeout(() => setShareCopied(false), 2000)
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return
      try {
        await navigator.clipboard.writeText(text)
        setShareCopied(true)
        setTimeout(() => setShareCopied(false), 2000)
      } catch {
        /* ignore */
      }
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:py-8">
      {toast && (
        <SuccessToast message={toast} onDismiss={() => setToast(null)} />
      )}

      <div
        className={`mb-6 flex items-center gap-3 rounded-lg border px-4 py-3 ${
          isLive ? "border-primary/30 bg-primary/5" : "border-border bg-card"
        }`}
      >
        <div
          className={`h-2.5 w-2.5 rounded-full ${
            isLive ? "bg-primary animate-pulse" : "bg-muted-foreground"
          }`}
        />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            {isLive ? "Your listing is live on StreetSpot" : "You are currently offline"}
          </p>
          <p className="text-xs text-muted-foreground">
            {isLive
              ? `Visible to nearby customers until ${closingTime}${isPremium ? " · Premier placement active" : ""}`
              : "Start sharing your current location with nearby customers."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isPremium && isLive && <Crown className="h-4 w-4 text-amber-500" />}
          <Radio
            className={`h-5 w-5 ${
              isLive ? "text-primary" : "text-muted-foreground"
            }`}
          />
        </div>
      </div>

      <ClaimableVendorsList claimerName={displayBusinessName} />

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
              {displayBusinessName}
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
                if (isLive) vendorStore.updateVendor(vendorId, { description: e.target.value })
              }}
              onBlur={() => { void persistVendorDetails() }}
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
                if (isLive) vendorStore.updateVendor(vendorId, { closingTime: e.target.value })
              }}
              onBlur={() => { void persistVendorDetails() }}
              className="h-10 w-full rounded-lg border border-border bg-input px-3.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary [color-scheme:dark]"
            />
          </div>
        </div>
      </div>

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
              {isLocating ? "Acquiring GPS signal..." : "Location not available"}
            </p>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleUpdateLocation}
            disabled={isLocating}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-secondary text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40"
          >
            <Navigation className="h-4 w-4" />
            <span>{isLocating ? "Locating..." : "Refresh Location"}</span>
          </button>
          <button
            onClick={handleShareLive}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-secondary text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Share2 className="h-4 w-4" />
            <span>{shareCopied ? "Copied!" : "Share my StreetSpot link"}</span>
          </button>
        </div>
      </div>

      <button
        onClick={handleGoLive}
        disabled={isLocating}
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
            <span>{isLocating ? "Getting location…" : "Go Live"}</span>
          </>
        )}
      </button>

      <div id="vendor-plan"><PremierPinPayment /></div>
      <VendorInbox vendorId={vendorId} vendorName={displayBusinessName} />
      <VendorMenuEditor />
      <VendorBookingsList />
      <SaveParking />
      <QuickTravelLog />
      <NetEarningsCard />
      <MileageDeductionCard />
      <TravelLogsList />

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
