"use client"

import { Calendar, Check, X } from "lucide-react"
import { useBookings, bookingStore } from "@/lib/booking-store"

export function VendorBookingsList() {
  const bookings = useBookings()

  if (bookings.length === 0) {
    return (
      <div className="mb-6 rounded-xl border border-border bg-card p-5">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <Calendar className="h-4 w-4" />
          Booking Requests
        </h3>
        <p className="text-sm text-muted-foreground">No booking requests yet.</p>
      </div>
    )
  }

  return (
    <div className="mb-6 rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <Calendar className="h-4 w-4" />
        Booking Requests ({bookings.length})
      </h3>

      <div className="flex flex-col gap-3">
        {bookings.map((b) => (
          <div key={b.id} className="rounded-lg bg-secondary px-3 py-3">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">
                {b.customerName}
              </p>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  b.status === "pending"
                    ? "bg-amber-500/15 text-amber-400"
                    : b.status === "accepted"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : b.status === "declined"
                        ? "bg-destructive/15 text-destructive"
                        : "bg-secondary text-muted-foreground"
                }`}
              >
                {b.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {b.eventDate}
              {b.eventTime ? ` · ${b.eventTime}` : ""} · {b.location}
            </p>
            {b.notes && (
              <p className="mt-1 text-xs text-foreground/70">{b.notes}</p>
            )}
            {b.status === "pending" && (
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => bookingStore.updateStatus(b.id, "accepted")}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-500/15 py-1.5 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/25"
                >
                  <Check className="h-3.5 w-3.5" />
                  Accept
                </button>
                <button
                  onClick={() => bookingStore.updateStatus(b.id, "declined")}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-destructive/15 py-1.5 text-xs font-medium text-destructive transition hover:bg-destructive/25"
                >
                  <X className="h-3.5 w-3.5" />
                  Decline
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
