"use client"

import { useState } from "react"
import { MapPin, Plus, Gem } from "lucide-react"
import {
  communityStore,
  SPOT_TYPE_LABELS,
  isSkateType,
  type SpotType,
} from "@/lib/community-store"

export function CreateSpotForm() {
  const [name, setName] = useState("")
  const [type, setType] = useState<SpotType>("food_truck")
  const [description, setDescription] = useState("")
  const [createdBy, setCreatedBy] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [isLocating, setIsLocating] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !createdBy) return

    setIsLocating(true)
    setError(null)

    if (!navigator.geolocation) {
      setError("Geolocation not supported")
      setIsLocating(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        communityStore.addSpot({
          name,
          type,
          description: description || "",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          createdBy,
          eventDate: eventDate || undefined,
        })
        setName("")
        setDescription("")
        setCreatedBy("")
        setEventDate("")
        setType("food_truck")
        setIsLocating(false)
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      },
      () => {
        setError("Unable to get location. Enable GPS and try again.")
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const skate = isSkateType(type)

  return (
    <div className="mb-6 rounded-xl border border-border bg-card p-5">
      <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <Gem className="h-4 w-4" />
        Discover a New Gem
      </h3>
      <p className="mb-4 text-xs text-muted-foreground">
        Pin skate parks, food trucks, markets, fairs, block parties, artisans,
        and more. Anyone can add a gem. For non-skate spots, only the real owner
        can claim it later.
      </p>

      {error && (
        <p className="mb-3 text-xs text-destructive">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">
            Gem Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Tacos Olé truck, Riverside Skate Park"
            className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">
            Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as SpotType)}
            className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {Object.entries(SPOT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {skate
              ? "Skate gems are open — no exclusive claim needed."
              : "This gem stays unclaimed until the real owner claims it in the app."}
          </p>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">
            Your Name (discoverer)
          </label>
          <input
            type="text"
            value={createdBy}
            onChange={(e) => setCreatedBy(e.target.value)}
            placeholder="Who spotted this?"
            className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">
            Event Date (optional)
          </label>
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary [color-scheme:dark]"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What makes this a gem?"
            rows={2}
            className="w-full resize-none rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <button
          type="submit"
          disabled={isLocating}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
          {isLocating
            ? "Getting location..."
            : saved
              ? "Gem Pinned!"
              : "Pin Gem at My Location"}
        </button>
      </form>
    </div>
  )
}
