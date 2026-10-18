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
  userId: string
  accessToken: string
  email: string
  onSignOut: () => void
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
  businessName, userId, accessToken, email, onSignOut,
}: VendorDashboardProps) {
  const vendors = useVendors()
  const [vendorId, setVendorId] = useState("")
  const [description, setDescription] = useState("")
  const [closingTime, setClosingTime] = useState("22:00")
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  )
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [shareCopied, setShareCopied] = useState(false)
  const [accountLoading, setAccountLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function loadAccount() {
      try {
        const response = await fetch("/api/vendor/me", { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" })
        const result = await response.json().catch(() => null)
        if (!response.ok) throw new Error(result?.message || "Unable to load your vendor account.")
        if (cancelled) return
        const vendor = result?.vendor
        if (vendor && typeof vendor.id === "string" && typeof vendor.lat === "number" && typeof vendor.lng === "number") {
          const mapped: Vendor = { id: vendor.id, name: vendor.name, description: vendor.description ?? "", lat: vendor.lat, lng: vendor.lng, closingTime: vendor.closingTime, isLive: Boolean(vendor.isLive), isPremium: Boolean(vendor.isPremium), createdAt: Number.isFinite(vendor.createdAt) ? vendor.createdAt : Date.now() }
          if (vendorStore.getSnapshot().some((item) => item.id === mapped.id)) vendorStore.updateVendor(mapped.id, mapped)
          else vendorStore.addVendor(mapped)
          setVendorId(mapped.id)
          setDescription(mapped.description)
          setClosingTime(mapped.closingTime)
          setLocation({ lat: mapped.lat, lng: mapped.lng })
        }
      } catch (cause) {
        if (!cancelled) setToast(cause instanceof Error ? cause.message : "Unable to load your account.")
      } finally {
        if (!cancelled) setAccountLoading(false)
      }
    }
    void loadAccount()
    return () => { cancelled = true }
  }, [accessToken])

  const myVendor = vendors.find((v) => v.id === vendorId)
  const isPremium = Boolean(myVendor?.isPremium)
  const isLive = Boolean(myVendor?.isLive)

  const getLocation = useCallback((onLocated?: (position: { lat: number; lng: number }) => void) => {
    setIsLocating(true)
    setLocationError(null)
    if (!navigator.geolocation) {
      setLocationError("Location is unavailable. Allow browser location access to publish your listing live.")
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
    setToast(null)
    try {
      const response = await fetch("/api/vendor/me", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ name: businessName, description, category: "vendor", latitude: position.lat, longitude: position.lng, closingTime }),
        cache: "no-store",
      })
      const result = await response.json().catch(() => null)
      if (response.status === 402) {
        setToast(result?.message || "An active monthly Premier subscription is required before your listing can go live.")
        return
      }
      if (!response.ok || !result?.ok || !result?.vendor) {
        setToast(result?.message || "StreetSpot could not publish this listing. Check your profile and try again.")
        return
      }
      const value = result.vendor
      if (typeof value.lat !== "number" || typeof value.lng !== "number") {
        setToast("Your account was saved, but the live location could not be confirmed. Refresh location and retry.")
        return
      }
      const vendor: Vendor = { id: value.id, name: value.name, description: value.description ?? description, lat: value.lat, lng: value.lng, closingTime: value.closingTime, isLive: Boolean(value.isLive), isPremium: Boolean(value.isPremium), createdAt: Number.isFinite(value.createdAt) ? value.createdAt : Date.now() }
      if (vendorStore.getSnapshot().some((item) => item.id === vendor.id)) vendorStore.updateVendor(vendor.id, vendor)
      else vendorStore.addVendor(vendor)
      setVendorId(vendor.id)
      sessionStorage.setItem("streetspot_vendor_id", vendor.id)
      setToast("Your listing is live on StreetSpot. Keep your location and hours current so customers can find you.")
    } catch {
      setToast("StreetSpot could not reach the server. Check your connection and try again.")
    }
  }

  async function handleGoLive() {
    if (isLive) {
      const response = await fetch("/api/vendor/me", { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` }, body: JSON.stringify({ isLive: false }), cache: "no-store" })
      if (!response.ok) {
        setToast("StreetSpot could not update your live status. Try again.")
        return
      }
      vendorStore.updateVendor(vendorId, { isLive: false })
      setToast("Your listing is offline. You can bring it back live while your subscription is active.")
    } else if (location) {
      await publishVendor(location)
    } else {
      getLocation((position) => { void publishVendor(position) })
    }
  }

  function handleUpdateLocation() {
    getLocation((position) => {
      if (isLive) void publishVendor(position)
    })
  }

  async function handleShareLive() {
    const url = "https://streetspotapp.com"
    const text = isLive
      ? `${businessName} is live on StreetSpot. Find local businesses, food trucks, pop-ups, and events: ${url}`
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
            {accountLoading ? "Loading your vendor account..." : isLive ? "Your business is live on StreetSpot" : "Your listing is offline"}
          </p>
          <p className="text-xs text-muted-foreground">
            {isLive
              ? `Customers can discover your listing until ${closingTime}${isPremium ? " · Paid Premier benefits verified" : ""}`
              : "Choose a monthly Premier plan, add an accurate description, and confirm your location to go live."}
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

      <ClaimableVendorsList claimerName={businessName} />

      <div className="mb-6 rounded-xl border border-border bg-card p-5">
        <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Business Details
        </h3>
        <p className="mb-4 text-xs text-muted-foreground">Signed in as {email}</p>
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
              maxLength={2000}
              onBlur={() => { if (isLive && location) void publishVendor(location) }}
              className="w-full resize-none rounded-lg border border-border bg-input px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="mt-1 text-right text-xs text-muted-foreground">
              {description.length}/2000 · At least 20 characters required to go live
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
              onChange={(e) => setClosingTime(e.target.value)}
              onBlur={() => { if (isLive && location) void publishVendor(location) }}
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
        disabled={isLocating || accountLoading}
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

      <PremierPinPayment userId={userId} accessToken={accessToken} />
      {vendorId ? <>
        <VendorInbox vendorId={vendorId} vendorName={businessName} />
        <VendorMenuEditor />
        <VendorBookingsList />
      </> : <p className="mb-6 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">Your inbox, menu, and booking tools become available after your first listing is published.</p>}
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
          <button type="button" onClick={onSignOut} className="flex h-10 w-full items-center justify-center rounded-lg border border-border text-sm font-semibold text-muted-foreground hover:bg-muted">Sign out</button>
        </div>
      </div>
    </div>
  )
}
