"use client"

import { useState } from "react"
import { MapPin, Plus } from "lucide-react"
import { travelStore } from "@/lib/travel-store"

export function QuickTravelLog() {
  const [startAddress, setStartAddress] = useState("")
  const [destination, setDestination] = useState("")
  const [mileage, setMileage] = useState("")
  const [fuel, setFuel] = useState("")
  const [parking, setParking] = useState("")
  const [tolls, setTolls] = useState("")
  const [notes, setNotes] = useState("")
  const [saved, setSaved] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!startAddress || !destination || !mileage) return

    travelStore.addLog({
      startAddress,
      destination,
      mileage: parseFloat(mileage) || 0,
      fuel: parseFloat(fuel) || 0,
      parking: parseFloat(parking) || 0,
      tolls: parseFloat(tolls) || 0,
      notes: notes || undefined,
      tripDate: new Date().toISOString().slice(0, 10),
    })

    setStartAddress("")
    setDestination("")
    setMileage("")
    setFuel("")
    setParking("")
    setTolls("")
    setNotes("")
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="mb-6 rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <MapPin className="h-4 w-4" />
        Quick Travel Log
      </h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">
            Start Address
          </label>
          <input
            type="text"
            value={startAddress}
            onChange={(e) => setStartAddress(e.target.value)}
            placeholder="Where did you start?"
            className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">
            Destination
          </label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Where did you go?"
            className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">
              Mileage
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              placeholder="0.0"
              className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">
              Fuel $
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={fuel}
              onChange={(e) => setFuel(e.target.value)}
              placeholder="0.00"
              className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">
              Parking $
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={parking}
              onChange={(e) => setParking(e.target.value)}
              placeholder="0.00"
              className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">
              Tolls $
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={tolls}
              onChange={(e) => setTolls(e.target.value)}
              placeholder="0.00"
              className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">
            Notes (optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes about this trip"
            className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <button
          type="submit"
          className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          {saved ? "Saved!" : "Log Trip"}
        </button>
      </form>
    </div>
  )
}
