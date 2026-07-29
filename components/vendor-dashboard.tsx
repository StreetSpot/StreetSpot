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
} from "lucide-react"
import { vendorStore, useVendors, type Vendor } from "@/lib/vendor-store"
import { PremierPinPayment } from "./premier-pin-payment"
import { QuickTravelLog } from "./travel/quick-travel-log"
import { NetEarningsCard } from "./travel/net-earnings-card"
import { MileageDeductionCard } from "./travel/mileage-deduction-card"
import { TravelLogsList } from "./travel/travel-logs-list"
import { VendorMenuEditor } from "./menu/vendor-menu-editor"

const SUPPORT_EMAIL = "support@streetspot.app"
const SUPPORT_SUBJECT = "StreetSpot Support Request"
const SUPPORT_BODY =
  "Hi StreetSpot Team,%0D%0A%0D%0AI need help with my account.%0D%0A%0D%0ABusiness Name: %0D%0AIssue: %0D%0A%0D%0AThank you."

interface VendorDashboardProps {
  businessName: string
  initialGold?: boolean
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
      <div className="flex items-center gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] px-4 py-3 shadow-xl shadow-black/30 backdrop-blur-md">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        </div>
        <p className="flex-1 text-sm font-medium text-emerald-300">{message}</p>
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
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  )
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const myVendor = vendors.find((v) => v.id === vendorId)

  useEffect(() => {
    if (typeof window === "undefined") return
    const goldFlag = sessionStorage.getItem("streetspot_gold_active")
    if (goldFlag === "true" || initialGold) {
      setIsPremium(true)
      setToast("Premier status activated! Your pin is now featured.")
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
      if (typeof window !== "undefined") {
        sessionStorage.setItem("streetspot_vendor_id", vendorId)
      }
      setIsLive(true)
      setToast("You are now live on the map!")
    }
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

      {/* Status banner */}
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
            {isLive ? "You are live on the map" : "You are currently offline"}
          </p>
          <p className="text-xs text-muted-foreground">
            {isLive
              ? `Visible to Finders until ${closingTime}${isPremium ? " · Premier placement active" : ""}`
              : "Go live to appear on the Finder map"}
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

      {/* Business details */}
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

      {/* Location */}
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
        <button
          onClick={handleUpdateLocation}
          disabled={isLocating}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-secondary text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-40"
        >
          <Navigation className="h-4 w-4" />
          <span>{isLocating ? "Locating..." : "Refresh Location"}</span>
        </button>
      </div>

      {/* Go Live */}
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

      {/* Premier Pin (Bronze / Silver / Gold) */}
      <PremierPinPayment />

      {/* Menu & Pricing */}
      <VendorMenuEditor />

      {/* Travel & Tax Tools */}
      <QuickTravelLog />
      <NetEarningsCard />
      <MileageDeductionCard />
      <TravelLogsList />

      {/* Settings & Support */}
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
