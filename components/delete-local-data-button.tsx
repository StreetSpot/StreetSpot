"use client"

import { useState } from "react"

const STREETSPOT_KEY_PREFIX = "streetspot_"

function removeStreetSpotKeys(storage: Storage) {
  const keys: string[] = []
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index)
    if (key?.startsWith(STREETSPOT_KEY_PREFIX)) keys.push(key)
  }
  for (const key of keys) storage.removeItem(key)
}

export function DeleteLocalDataButton() {
  const [status, setStatus] = useState("")

  function clearLocalData() {
    const confirmed = window.confirm(
      "Remove StreetSpot data stored in this browser on this device? This cannot be undone and will not delete server-side data or data on other devices."
    )
    if (!confirmed) return

    try {
      removeStreetSpotKeys(window.localStorage)
      removeStreetSpotKeys(window.sessionStorage)
      setStatus(
        "StreetSpot data stored in this browser has been removed. This does not delete server-side data or data on other devices."
      )
    } catch {
      setStatus(
        "Some browser data could not be removed. Check this browser's storage permissions and try again."
      )
    }
  }

  return (
    <section className="mt-6 rounded-xl border border-border bg-card p-5">
      <h2 className="text-base font-semibold text-foreground">
        Clear StreetSpot data from this browser
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Removes StreetSpot-prefixed local and session storage from this browser only. It does not delete account or server data.
      </p>
      <button
        type="button"
        onClick={clearLocalData}
        className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Clear local StreetSpot data
      </button>
      <p className="mt-3 text-sm text-muted-foreground" aria-live="polite" role="status">
        {status}
      </p>
    </section>
  )
}
