"use client"

import { Star, Trash2 } from "lucide-react"
import { useVendorReviews, reviewStore } from "@/lib/review-store"

interface ReviewsListProps {
  vendorId: string
  canDelete?: boolean
}

export function ReviewsList({ vendorId, canDelete = false }: ReviewsListProps) {
  const reviews = useVendorReviews(vendorId)
  const average =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0

  if (reviews.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Reviews
        </h3>
        <p className="text-sm text-muted-foreground">No reviews yet.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Reviews ({reviews.length})
        </h3>
        <div className="flex items-center gap-1.5">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-semibold text-foreground">
            {average.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {reviews.slice(0, 10).map((review) => (
          <div
            key={review.id}
            className="rounded-lg bg-secondary px-3 py-3"
          >
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {review.authorName}
                </span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-3 w-3 ${
                        s <= review.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/40"
                      }`}
                    />
                  ))}
                </div>
              </div>
              {canDelete && (
                <button
                  onClick={() => reviewStore.removeReview(review.id)}
                  className="rounded p-1 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <p className="text-xs leading-relaxed text-foreground/80">
              {review.comment}
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
