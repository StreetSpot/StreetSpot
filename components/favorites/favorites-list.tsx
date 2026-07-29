"use client"

import { Heart, Trash2 } from "lucide-react"
import { useFavorites, favoritesStore } from "@/lib/favorites-store"

export function FavoritesList() {
  const favorites = useFavorites()

  if (favorites.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <Heart className="h-4 w-4" />
          Favorites
        </h3>
        <p className="text-sm text-muted-foreground">
          No favorites yet. Heart a vendor to save them here.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <Heart className="h-4 w-4 fill-rose-400 text-rose-400" />
        Favorites ({favorites.length})
      </h3>

      <div className="flex flex-col gap-2">
        {favorites.map((fav) => (
          <div
            key={fav.id}
            className="flex items-center justify-between gap-3 rounded-lg bg-secondary px-3 py-2.5"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {fav.vendorName}
              </p>
              {fav.description && (
                <p className="truncate text-xs text-muted-foreground">
                  {fav.description}
                </p>
              )}
            </div>
            <button
              onClick={() => favoritesStore.remove(fav.vendorId)}
              className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              aria-label="Remove favorite"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
