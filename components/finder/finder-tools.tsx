"use client"

import { useMemo, useState } from "react"
import {
  Car,
  Route,
  MapPin,
  Trash2,
  Navigation,
  Plus,
  Share2,
} from "lucide-react"
import { parkingStore, useParkingSpots } from "@/lib/parking-store"
import { travelStore, useTravelLogs, useTravelTotals } from "@/lib/travel-store"
import {
  useCommunitySpots,
  SPOT_TYPE_LABELS,
  type SpotType,
} from "@/lib/community-store"
import { CreateSpotForm } from "@/components/community/create-spot-form"
import { SpotsList } from "@/components/community/spots-list"

const FILTER_CHIPS: { id: "all" | SpotType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "food_truck", label: "Food trucks" },
  { id: "popup_cart", label: "Carts" },
  { id: "skate_park", label: "Skate parks" },
  { id: "skate_spot", label: "Skate spots" },
  { id: "market", label: "Markets" },
  { id: "event", label: "Events" },
  { id: "flea_market", label: "Flea markets" },
  { id: "block_party", label: "Block parties" },
  { id: "artisan", label: "Artisans" },
]

export function FinderTools() {
  const parkingSpots = useParkingSpots()
  const logs = useTravelLogs()
  const totals = useTravelTotals()
  const allGems = useCommunitySpots()
  const [filter, setFilter] = useState<"all" | SpotType>("all")
  const [parkingLabel, setParkingLabel] = useState("")
  const [isSavingParking, setIsSavingParking] = useState(false)
  const [showTravelForm, setShowTravelForm] = useState(false)
  const [shareDone, setShareDone] = useState(false)

  const [startAddress, setStartAddress] = useState("")
  const [destination, setDestination] = useState("")
  const [mileage, setMileage] = useState("")
  const [fuel, setFuel] = useState("")
  const [parkingCost, setParkingCost] = useState("")
  const [tolls, setTolls] = useState("")
  const [notes, setNotes] = useState("")
  const [tripDate, setTripDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  )

  const filteredCount = useMemo(() => {
    if (filter === "all") return allGems.length
    return allGems.filter((g) => g.type === filter).length
  }, [allGems, filter])

  function handleSaveParking() {
    setIsSavingParking(true)
    if (!navigator.geolocation) {
      setIsSavingParking(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        parkingStore.save({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: parkingLabel.trim() || "My parking spot",
        })
        setParkingLabel("")
        setIsSavingParking(false)
      },
      () => setIsSavingParking(false),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  function handleAddTravel(e: React.FormEvent) {
    e.preventDefault()
    travelStore.addLog({
      startAddress: startAddress.trim() || "Start",
      destination: destination.trim() || "Destination",
      mileage: parseFloat(mileage) || 0,
      fuel: parseFloat(fuel) || 0,
      parking: parseFloat(parkingCost) || 0,
      tolls: parseFloat(tolls) || 0,
      notes: notes.trim() || undefined,
      tripDate,
    })
    setStartAddress("")
    setDestination("")
    setMileage("")
    setFuel("")
    setParkingCost("")
    setTolls("")
    setNotes("")
    setShowTravelForm(false)
  }

  async function handleInvite() {
    const url =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://v0-street-spot-web-app.vercel.app"
    const text = `StreetSpot — live street vendors, food trucks, markets & skate gems on a real-time map. Pin what you find. ${url}`
    try {
      if (navigator.share) {
        await navigator.share({ title: "StreetSpot", text, url })
      } else {
        await navigator.clipboard.writeText(text)
        setShareDone(true)
        setTimeout(() => setShareDone(false), 2000)
      }
    } catch {
      try {
        await navigator.clipboard.writeText(text)
        setShareDone(true)
        setTimeout(() => setShareDone(false), 2000)
      } catch {
        /* ignore */
      }
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-4 pb-10">
      {/* Growth CTA */}
      <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
        <p className="mb-2 text-sm font-medium text-foreground">
          Help grow the map
        </p>
        <p className="mb-3 text-xs text-muted-foreground">
          Pin food trucks, markets, skate spots, and events you find. Share the
          app so more vendors go live near you.
        </p>
        <button
          onClick={handleInvite}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground"
        >
          <Share2 className="h-4 w-4" />
          {shareDone ? "Link copied!" : "Invite friends & vendors"}
        </button>
      </div>

      {/* Gem type filters */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Filter gems ({filteredCount})
        </p>
        <div className="flex flex-wrap gap-1.5">
          {FILTER_CHIPS.map((chip) => (
            <button
              key={chip.id}
              onClick={() => setFilter(chip.id)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                filter === chip.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
        {filter !== "all" && (
          <p className="mt-2 text-[11px] text-muted-foreground">
            Showing {SPOT_TYPE_LABELS[filter as SpotType]} only in the list
            below. Map still shows all active gems.
          </p>
        )}
      </div>

      <CreateSpotForm />
      <SpotsList filterType={filter === "all" ? undefined : filter} />

      {/* Multi parking */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <Car className="h-4 w-4" />
          Parking spots
        </h3>
        {parkingSpots.length > 0 && (
          <div className="mb-3 flex flex-col gap-2">
            {parkingSpots.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">
                    {p.label || "Saved spot"}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {p.lat.toFixed(5)}, {p.lng.toFixed(5)}
                  </p>
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-primary px-2 py-1.5 text-[11px] font-semibold text-primary-foreground"
                >
                  Navigate
                </a>
                <button
                  onClick={() => parkingStore.remove(p.id)}
                  className="p-1.5 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        {parkingSpots.length === 0 && (
          <p className="mb-3 text-xs text-muted-foreground">
            No parking saved yet. Save where you left the car or truck.
          </p>
        )}
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={parkingLabel}
            onChange={(e) => setParkingLabel(e.target.value)}
            placeholder="Label (optional)"
            className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm"
          />
          <button
            onClick={handleSaveParking}
            disabled={isSavingParking || parkingSpots.length >= 5}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-40"
          >
            <MapPin className="h-4 w-4" />
            {isSavingParking
              ? "Saving..."
              : parkingSpots.length >= 5
                ? "Max 5 spots"
                : "Save current location"}
          </button>
        </div>
      </div>

      {/* Travel logs */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <Route className="h-4 w-4" />
            Travel & mileage
          </h3>
          <button
            onClick={() => setShowTravelForm(!showTravelForm)}
            className="flex items-center gap-1 text-xs font-medium text-primary"
          >
            <Plus className="h-3.5 w-3.5" />
            {showTravelForm ? "Cancel" : "Add trip"}
          </button>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
          <div className="rounded-lg bg-secondary px-2 py-2">
            <p className="text-lg font-semibold text-foreground">
              {totals.mileage.toFixed(1)}
            </p>
            <p className="text-[10px] text-muted-foreground">Miles</p>
          </div>
          <div className="rounded-lg bg-secondary px-2 py-2">
            <p className="text-lg font-semibold text-foreground">
              ${totals.fuel.toFixed(0)}
            </p>
            <p className="text-[10px] text-muted-foreground">Fuel</p>
          </div>
          <div className="rounded-lg bg-secondary px-2 py-2">
            <p className="text-lg font-semibold text-foreground">
              ${totals.parking.toFixed(0)}
            </p>
            <p className="text-[10px] text-muted-foreground">Parking</p>
          </div>
          <div className="rounded-lg bg-secondary px-2 py-2">
            <p className="text-lg font-semibold text-foreground">
              ${totals.tolls.toFixed(0)}
            </p>
            <p className="text-[10px] text-muted-foreground">Tolls</p>
          </div>
        </div>

        {showTravelForm && (
          <form onSubmit={handleAddTravel} className="mb-3 flex flex-col gap-2">
            <input
              type="text"
              value={startAddress}
              onChange={(e) => setStartAddress(e.target.value)}
              placeholder="Start"
              className="h-9 rounded-lg border border-border bg-input px-3 text-sm"
            />
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Destination"
              className="h-9 rounded-lg border border-border bg-input px-3 text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="0.1"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder="Miles"
                className="h-9 rounded-lg border border-border bg-input px-3 text-sm"
              />
              <input
                type="date"
                value={tripDate}
                onChange={(e) => setTripDate(e.target.value)}
                className="h-9 rounded-lg border border-border bg-input px-3 text-sm [color-scheme:dark]"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                step="0.01"
                value={fuel}
                onChange={(e) => setFuel(e.target.value)}
                placeholder="Fuel $"
                className="h-9 rounded-lg border border-border bg-input px-3 text-sm"
              />
              <input
                type="number"
                step="0.01"
                value={parkingCost}
                onChange={(e) => setParkingCost(e.target.value)}
                placeholder="Parking $"
                className="h-9 rounded-lg border border-border bg-input px-3 text-sm"
              />
              <input
                type="number"
                step="0.01"
                value={tolls}
                onChange={(e) => setTolls(e.target.value)}
                placeholder="Tolls $"
                className="h-9 rounded-lg border border-border bg-input px-3 text-sm"
              />
            </div>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes (vacation, work, etc.)"
              className="h-9 rounded-lg border border-border bg-input px-3 text-sm"
            />
            <button
              type="submit"
              className="h-10 rounded-lg bg-primary text-sm font-semibold text-primary-foreground"
            >
              Save trip
            </button>
          </form>
        )}

        {logs.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No trips yet. Log mileage and vacation travel here.
          </p>
        ) : (
          <div className="flex max-h-48 flex-col gap-2 overflow-y-auto">
            {logs.slice(0, 10).map((log) => (
              <div
                key={log.id}
                className="flex items-start justify-between gap-2 rounded-lg bg-secondary px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground">
                    {log.startAddress} → {log.destination}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {log.tripDate} · {log.mileage} mi
                    {log.notes ? ` · ${log.notes}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => travelStore.removeLog(log.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
