"use client"

import { useState } from "react"
import { LocateFixed, Loader2 } from "lucide-react"

interface LocateControlProps {
  onLocated: (lat: number, lng: number) => void
}

/** Centers map on the user's GPS — retention + local relevance */
export function LocateControl({ onLocated }: LocateControlProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  function handleLocate() {
    if (!navigator.geolocation) {
      setError(true)
      return
    }
    setLoading(true)
    setError(false)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onLocated(pos.coords.latitude, pos.coords.longitude)
        setLoading(false)
      },
      () => {
        setError(true)
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 12000 }
    )
  }

  return (
    <button
      type="button"
      onClick={handleLocate}
      title="Center on my location"
      className={`absolute bottom-24 right-3 z-[400] flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card shadow-lg transition hover:bg-secondary ${
        error ? "text-destructive" : "text-primary"
      }`}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <LocateFixed className="h-5 w-5" />
      )}
    </button>
  )
}
