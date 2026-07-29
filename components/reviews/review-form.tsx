"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { reviewStore } from "@/lib/review-store"

interface ReviewFormProps {
  vendorId: string
  vendorName: string
  onSubmitted?: () => void
}

export function ReviewForm({
  vendorId,
  vendorName,
  onSubmitted,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState("")
  const [authorName, setAuthorName] = useState("")
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating < 1 || !comment.trim()) return

    reviewStore.addReview({
      vendorId,
      vendorName,
      rating,
      comment: comment.trim(),
      authorName: authorName.trim() || "Anonymous",
    })

    setRating(0)
    setComment("")
    setAuthorName("")
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 2500)
    onSubmitted?.()
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Leave a Review
      </h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <p className="mb-1.5 text-xs font-medium text-foreground">Rating</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                className="p-0.5"
              >
                <Star
                  className={`h-6 w-6 transition ${
                    star <= (hover || rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">
            Your Name (optional)
          </label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Anonymous"
            className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">
            Comment
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="How was your experience?"
            rows={3}
            maxLength={300}
            className="w-full resize-none rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            required
          />
        </div>

        <button
          type="submit"
          disabled={rating < 1}
          className="flex h-10 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
        >
          {submitted ? "Review Submitted!" : "Submit Review"}
        </button>
      </form>
    </div>
  )
}
