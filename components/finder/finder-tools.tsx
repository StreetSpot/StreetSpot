"use client"

import { useState } from "react"
import {
  Car,
  Route,
  MapPin,
  Trash2,
  Navigation,
  Plus,
} from "lucide-react"
import { parkingStore, useParking } from "@/lib/parking-store"
import { travelStore, useTravelLogs, useTravelTotals } from "@/lib/travel-store"
import { CreateSpotForm } from "@/components/community/create-spot-form"
import { SpotsList } from "@/components/community/spots-list"

/**
 * Customer / finder tools:
 * - Save parking
 * - Travel / mileage / vacation logs
 * - Discover gems (skate + food trucks + events etc.)
 */
export function FinderTools() {
  const parking = useParking()
  const logs = useTravelLogs()
  const totals = useTravelTotals()
  const [parkingLabel, setParkingLabel] = useState("")
  const [isSavingParking, setIsSavingParking] = useState(false)
  const [showTravelForm, setShowTravelForm] = useState(false)

  // Travel form state
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

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-4">
      {/* Discover gems */}
      <CreateSpotForm />
      <SpotsList />

      {/* Save parking */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <Car className="h-4 w-4" />
          Save Parking Spot
        </h3>
        {parking ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-foreground">
              {parking.label || "Saved spot"}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              {parking.lat.toFixed(5)}, {parking.lng.toFixed(5)}
            </p>
            <div className="flex gap-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${parking.lat},${parking.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary text-xs font-semibold text-primary-foreground"
              >
                <Navigation className="h-3.5 w-3.5" />
                Find my car
              </a>
              <button
                onClick={() => parkingStore.clear()}
                className="flex h-9 items-center justify-center rounded-lg border border-border px-3 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={parkingLabel}
              onChange={(e) => setParkingLabel(e.target.value)}
              placeholder="Label (optional) e.g. Level 2 near elevator"
              className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
            <button
              onClick={handleSaveParking}
              disabled={isSavingParking}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-40"
            >
              <MapPin className="h-4 w-4" />
              {isSavingParking ? "Saving..." : "Save current location"}
            </button>
          </div>
        )}
      </div>

      {/* Travel / mileage / vacation logs */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <Route className="h-4 w-4" />
            Travel & Mileage Logs
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
