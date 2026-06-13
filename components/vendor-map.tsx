"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import {
  MapPin,
  Clock,
  Navigation,
  List,
  X,
  Radio,
  Crown,
  Timer,
} from "lucide-react"
import {
  useActiveVendors,
  getMinutesRemaining,
  type Vendor,
} from "@/lib/vendor-store"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

/* ───────────────── Countdown helpers ───────────────── */

function formatCountdown(closingTime: string): string {
  const mins = getMinutesRemaining(closingTime)
  if (mins <= 0) return "Closing now"
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h > 0) return `${h}h ${m}m left`
  return `${m}m left`
}

function formatCountdownShort(closingTime: string): string {
  const mins = getMinutesRemaining(closingTime)
  if (mins <= 0) return "NOW"
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h${m}m` : `${h}h`
}

function isClosingSoon(closingTime: string): boolean {
  return getMinutesRemaining(closingTime) <= 30
}

/* ───────────────── Custom pin icon factory ───────────────── */

function createVendorIcon(vendor: Vendor) {
  const closing = isClosingSoon(vendor.closingTime)
  const isPremium = vendor.isPremium
  const countdownLabel = formatCountdownShort(vendor.closingTime)

  // Size: premium pins are bigger
  const size = isPremium ? 42 : 36

  // Colors
  const pinColor = closing ? "#f97316" : "#38bdf8"
  const countdownColor = closing ? "#f97316" : "#38bdf8"
  const countdownBg = closing
    ? "rgba(249,115,22,0.18)"
    : "rgba(56,189,248,0.14)"
  const countdownBorder = closing
    ? "rgba(249,115,22,0.4)"
    : "rgba(56,189,248,0.3)"

  // Animation for pin body
  let pinAnimation = ""
  if (isPremium) {
    pinAnimation = "animation: pin-pulse-gold 2s ease-in-out infinite;"
  } else if (closing) {
    pinAnimation = "animation: pin-pulse-orange 1.8s ease-in-out infinite;"
  }

  // Countdown badge urgency animation
  const countdownAnim =
    closing && !isPremium
      ? "animation: countdown-urgent 1.2s ease-in-out infinite;"
      : ""

  // Premium crown badge
  const premiumBadge = isPremium
    ? `<div style="
        position:absolute; top:-7px; right:-7px;
        width:18px; height:18px;
        background:linear-gradient(135deg,#fbbf24,#f59e0b);
        border-radius:50%;
        display:flex; align-items:center; justify-content:center;
        border:2px solid #0d1117;
        animation: gold-badge-pulse 2s ease-in-out infinite;
        z-index:2;
      "><svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="#0d1117" stroke="none"><path d="M2 4l3 12h14l3-12-5 4-5-6-5 6z"/><path d="M5 16v4h14v-4"/></svg></div>`
    : ""

  // Pin border styling
  const borderStyle = isPremium
    ? `border:3px solid #fbbf24;`
    : `border:3px solid #0d1117;`

  return L.divIcon({
    html: `<div style="position:relative;width:${size}px;height:${size}px;">
      <div style="
        width:${size}px; height:${size}px;
        background:${isPremium ? "linear-gradient(135deg,#fbbf24,#f59e0b)" : pinColor};
        ${borderStyle}
        border-radius:50%;
        display:flex; align-items:center; justify-content:center;
        ${pinAnimation}
        transition:all .3s ease;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="${isPremium ? 17 : 15}" height="${isPremium ? 17 : 15}" viewBox="0 0 24 24" fill="none" stroke="#0d1117" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
      ${premiumBadge}
      <div style="
        position:absolute;
        bottom:-22px; left:50%; transform:translateX(-50%);
        background:${countdownBg};
        border:1px solid ${countdownBorder};
        border-radius:4px;
        padding:1px 6px;
        white-space:nowrap;
        font-size:10px; font-weight:700;
        color:${countdownColor};
        font-family:'JetBrains Mono',ui-monospace,monospace;
        letter-spacing:.03em;
        backdrop-filter:blur(4px);
        ${countdownAnim}
      ">${countdownLabel}</div>
    </div>`,
    className: "",
    iconSize: [size, size + 22],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  })
}

/* ───────────────── List item ───────────────── */

function VendorListItem({
  vendor,
  isSelected,
  onSelect,
}: {
  vendor: Vendor
  isSelected: boolean
  onSelect: (v: Vendor) => void
}) {
  const closing = isClosingSoon(vendor.closingTime)
  const minsLeft = getMinutesRemaining(vendor.closingTime)

  return (
    <button
      onClick={() => onSelect(vendor)}
      className={`w-full text-left rounded-lg border p-3 transition-all ${
        isSelected
          ? "border-primary/50 bg-primary/5"
          : vendor.isPremium
            ? "border-amber-500/30 bg-amber-500/[0.04] hover:bg-amber-500/[0.08]"
            : "border-border bg-card hover:bg-secondary/50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            vendor.isPremium
              ? "bg-amber-500/15 ring-1 ring-amber-500/30"
              : "bg-primary/10"
          }`}
        >
          {vendor.isPremium ? (
            <Crown className="h-3.5 w-3.5 text-amber-500" />
          ) : (
            <MapPin className="h-3.5 w-3.5 text-primary" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-foreground">
              {vendor.name}
            </p>
            {vendor.isPremium && (
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-500 ring-1 ring-amber-500/20">
                <Crown className="h-2.5 w-2.5" />
                Gold
              </span>
            )}
          </div>
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {vendor.description}
          </p>
          <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
            <span
              className={`flex items-center gap-1 font-mono ${
                closing ? "text-orange-400" : "text-muted-foreground"
              }`}
            >
              <Timer className="h-3 w-3" />
              {minsLeft > 0 ? formatCountdown(vendor.closingTime) : "Closing now"}
            </span>
            <span className="flex items-center gap-1 text-primary">
              <Radio className="h-3 w-3" />
              Live
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}

/* ───────────────── Main map component ───────────────── */

export function VendorMap() {
  const activeVendors = useActiveVendors()
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [showList, setShowList] = useState(false)
  const [, setTick] = useState(0)
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<L.Marker[]>([])
  const hasAutoFitted = useRef(false)

  // Premium first, then by creation time
  const sortedVendors = [...activeVendors].sort((a, b) => {
    if (a.isPremium && !b.isPremium) return -1
    if (!a.isPremium && b.isPremium) return 1
    return b.createdAt - a.createdAt
  })
  const premiumVendors = sortedVendors.filter((v) => v.isPremium)
  const standardVendors = sortedVendors.filter((v) => !v.isPremium)

  // Tick every 10s for countdown updates
  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), 10000)
    return () => clearInterval(iv)
  }, [])

  const selectVendor = useCallback((vendor: Vendor) => {
    setSelectedVendor(vendor)
    setShowList(false)
    if (mapRef.current) {
      mapRef.current.setView([vendor.lat, vendor.lng], 16, { animate: true })
    }
  }, [])

  // Init map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: [40.7128, -74.006],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    })

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      { maxZoom: 19 }
    ).addTo(map)

    L.control.zoom({ position: "bottomright" }).addTo(map)
    L.control
      .attribution({ position: "bottomleft" })
      .addTo(map)
      .addAttribution(
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      )

    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Sync markers
  useEffect(() => {
    if (!mapRef.current) return

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    // Standard first, premium on top
    const ordered = [...activeVendors].sort((a, b) => {
      if (a.isPremium && !b.isPremium) return 1
      if (!a.isPremium && b.isPremium) return -1
      return 0
    })

    ordered.forEach((vendor) => {
      const icon = createVendorIcon(vendor)
      const closing = isClosingSoon(vendor.closingTime)
      const countdownColor = closing ? "#f97316" : "#38bdf8"
      const countdownBg = closing
        ? "rgba(249,115,22,0.1)"
        : "rgba(56,189,248,0.08)"

      const premiumLabel = vendor.isPremium
        ? `<div style="display:inline-flex;align-items:center;gap:4px;background:rgba(251,191,36,0.12);border:1px solid rgba(251,191,36,0.25);border-radius:4px;padding:2px 6px;font-size:10px;font-weight:700;color:#fbbf24;margin-bottom:6px;text-transform:uppercase;letter-spacing:.05em;">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="#fbbf24" stroke="none"><path d="M2 4l3 12h14l3-12-5 4-5-6-5 6z"/><path d="M5 16v4h14v-4"/></svg>
            Gold Vendor
          </div>`
        : ""

      const marker = L.marker([vendor.lat, vendor.lng], {
        icon,
        zIndexOffset: vendor.isPremium ? 1000 : 0,
      })
        .addTo(mapRef.current!)
        .bindPopup(
          `<div style="
            background:#1a1b26;color:#e5e5e5;padding:14px 16px;border-radius:10px;min-width:210px;
            font-family:system-ui,-apple-system,sans-serif;
            border:1px solid ${vendor.isPremium ? "rgba(251,191,36,0.3)" : "rgba(255,255,255,0.08)"};
            ${vendor.isPremium ? "box-shadow:0 0 24px rgba(251,191,36,0.12);" : ""}
          ">
            ${premiumLabel}
            <p style="font-weight:700;font-size:14px;margin:0 0 4px;color:#fff;">${vendor.name}</p>
            <p style="font-size:12px;margin:0 0 10px;color:#888;line-height:1.5;">${vendor.description}</p>
            <div style="display:flex;align-items:center;justify-content:space-between;background:${countdownBg};border-radius:6px;padding:6px 10px;">
              <div style="display:flex;align-items:center;gap:5px;font-size:11px;color:#888;">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Closes ${vendor.closingTime}
              </div>
              <span style="font-size:11px;font-weight:700;color:${countdownColor};font-family:'JetBrains Mono',monospace;">${formatCountdown(vendor.closingTime)}</span>
            </div>
          </div>`,
          { className: "streetspot-popup", closeButton: false }
        )

      marker.on("click", () => setSelectedVendor(vendor))
      markersRef.current.push(marker)
    })

    // Auto-fit once
    if (
      !hasAutoFitted.current &&
      activeVendors.length > 0 &&
      markersRef.current.length > 0
    ) {
      const group = L.featureGroup(markersRef.current)
      mapRef.current.fitBounds(group.getBounds().pad(0.3))
      hasAutoFitted.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeVendors])

  return (
    <div className="relative flex h-[calc(100dvh-57px)] flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-foreground">
              {activeVendors.length} vendor
              {activeVendors.length !== 1 ? "s" : ""} live
            </span>
          </div>
          {premiumVendors.length > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-500 ring-1 ring-amber-500/20">
              <Crown className="h-2.5 w-2.5" />
              {premiumVendors.length} Gold
            </span>
          )}
        </div>
        <button
          onClick={() => setShowList(!showList)}
          className="flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
        >
          {showList ? (
            <>
              <X className="h-3.5 w-3.5" />
              <span>Close</span>
            </>
          ) : (
            <>
              <List className="h-3.5 w-3.5" />
              <span>List View</span>
            </>
          )}
        </button>
      </div>

      <div className="relative flex-1">
        <div ref={mapContainerRef} className="h-full w-full" />

        {/* ── List overlay ── */}
        {showList && (
          <div className="absolute inset-0 z-[500] overflow-y-auto bg-background/95 backdrop-blur-sm p-4">
            {/* Featured vendors section */}
            {premiumVendors.length > 0 && (
              <div className="mb-5">
                <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-500">
                  <Crown className="h-3.5 w-3.5" />
                  Featured Vendors
                </h3>
                <div className="flex flex-col gap-2">
                  {premiumVendors.map((v) => (
                    <VendorListItem
                      key={v.id}
                      vendor={v}
                      isSelected={selectedVendor?.id === v.id}
                      onSelect={selectVendor}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Standard vendors */}
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {premiumVendors.length > 0 ? "All Vendors" : "Active Vendors"}
            </h3>
            {standardVendors.length === 0 && premiumVendors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <MapPin className="mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">
                  No vendors live right now
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Check back soon
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {standardVendors.map((v) => (
                  <VendorListItem
                    key={v.id}
                    vendor={v}
                    isSelected={selectedVendor?.id === v.id}
                    onSelect={selectVendor}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Bottom detail card ── */}
        {selectedVendor && !showList && (
          <div
            className={`absolute bottom-4 left-4 right-4 z-[500] rounded-xl border bg-card p-4 shadow-xl shadow-black/40 md:left-auto md:right-4 md:max-w-sm ${
              selectedVendor.isPremium
                ? "border-amber-500/30"
                : "border-border"
            }`}
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${
                    selectedVendor.isPremium
                      ? "bg-amber-500/15 ring-1 ring-amber-500/30"
                      : "bg-primary/10"
                  }`}
                >
                  {selectedVendor.isPremium ? (
                    <Crown className="h-4 w-4 text-amber-500" />
                  ) : (
                    <MapPin className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {selectedVendor.name}
                    </p>
                    {selectedVendor.isPremium && (
                      <span className="flex items-center gap-0.5 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-500 ring-1 ring-amber-500/20">
                        Gold
                      </span>
                    )}
                  </div>
                  <p className="flex items-center gap-1 text-xs text-primary">
                    <Radio className="h-3 w-3" />
                    Live Now
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVendor(null)}
                className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
              {selectedVendor.description}
            </p>
            <div
              className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                isClosingSoon(selectedVendor.closingTime)
                  ? "bg-orange-500/[0.08]"
                  : "bg-secondary"
              }`}
            >
              <div
                className={`flex items-center gap-1.5 text-xs ${
                  isClosingSoon(selectedVendor.closingTime)
                    ? "text-orange-400"
                    : "text-muted-foreground"
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Closes at {selectedVendor.closingTime}</span>
              </div>
              <span
                className={`font-mono text-xs font-bold ${
                  isClosingSoon(selectedVendor.closingTime)
                    ? "text-orange-400"
                    : "text-sky-400"
                }`}
              >
                {formatCountdown(selectedVendor.closingTime)}
              </span>
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selectedVendor.lat},${selectedVendor.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-primary text-xs font-medium text-primary-foreground hover:opacity-90"
            >
              <Navigation className="h-3.5 w-3.5" />
              Get Directions
            </a>
          </div>
        )}
      </div>

      {/* Map CSS overrides */}
      <style>{`
        .streetspot-popup .leaflet-popup-content-wrapper {
          background:transparent;box-shadow:none;border-radius:0;padding:0;
        }
        .streetspot-popup .leaflet-popup-content { margin:0; }
        .streetspot-popup .leaflet-popup-tip {
          background:#1a1b26;border:1px solid rgba(255,255,255,0.08);
        }
        .leaflet-control-zoom a {
          background:#1a1b26 !important;color:#e5e5e5 !important;
          border-color:rgba(255,255,255,0.08) !important;
        }
        .leaflet-control-zoom a:hover { background:#2a2b36 !important; }
      `}</style>
    </div>
  )
}
