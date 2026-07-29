"use client"

import { useState } from "react"
import { Car, MapPin, Trash2, Navigation } from "lucide-react"
import { parkingStore, useParking } from "@/lib/parking-store"

export function SaveParking() {
  const parking = useParking()
  const [isLocating, setIsLocating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSave() {
    setIsLocating(true)
    setError(null)
    if (!navigator.geolocation) {
      setError("Geolocation not supported")
      setIsLocating(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        parkingStore.save({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: "My Car",
        })
        setIsLocating(false)
      },
      () => {
        setError("Unable to get location")
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  function openInMaps() {
    if (!parking) return
    const url = `https://www.google.com/maps/dir/?api=1&destination=${parking.lat},${parking.lng}`
    window.open(url, "_blank")
  }

  return (
    <div className="mb-6 rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <Car className="h-4 w-4" />
        Find My Car
      </h3>

      {error && (
        <p className="mb-3 text-xs text-destructive">{error}</p>
      )}

      {parking ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 rounded-lg bg-secondary px-4 py-3">
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                {parking.label || "Saved Parking"}
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                {parking.lat.toFixed(5)}, {parking.lng.toFixed(5)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={openInMaps}
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              <Navigation className="h-4 w-4" />
              Navigate
            </button>
            <button
              onClick={() => parkingStore.clear()}
              className="flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-secondary text-sm font-medium text-foreground transition hover:bg-muted"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleSave}
          disabled={isLocating}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
        >
          <Car className="h-4 w-4" />
          {isLocating ? "Saving location..." : "Save Parking Spot"}
        </button>
      )}
    </div>
  )
}
