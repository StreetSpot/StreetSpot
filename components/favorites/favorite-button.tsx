"use client"

import { Heart } from "lucide-react"
import { favoritesStore, useFavorites } from "@/lib/favorites-store"

interface FavoriteButtonProps {
  vendorId: string
  vendorName: string
  description?: string
}

export function FavoriteButton({
  vendorId,
  vendorName,
  description,
}: FavoriteButtonProps) {
  const favorites = useFavorites()
  const isFavorited = favorites.some((f) => f.vendorId === vendorId)

  function handleToggle() {
    favoritesStore.toggle({
      vendorId,
      vendorName,
      description,
    })
  }

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
        isFavorited
          ? "bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30"
          : "bg-secondary text-muted-foreground hover:text-foreground"
      }`}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={`h-3.5 w-3.5 ${
          isFavorited ? "fill-rose-400 text-rose-400" : ""
        }`}
      />
      {isFavorited ? "Favorited" : "Favorite"}
    </button>
  )
}
