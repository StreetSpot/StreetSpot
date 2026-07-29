"use client"

import { useState } from "react"
import { Calendar } from "lucide-react"
import { bookingStore } from "@/lib/booking-store"

interface BookingRequestFormProps {
  vendorId: string
  vendorName: string
}

export function BookingRequestForm({
  vendorId,
  vendorName,
}: BookingRequestFormProps) {
  const [customerName, setCustomerName] = useState("")
  const [customerContact, setCustomerContact] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [eventTime, setEventTime] = useState("")
  const [location, setLocation] = useState("")
  const [notes, setNotes] = useState("")
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!customerName || !eventDate || !location) return

    bookingStore.addBooking({
      vendorId,
      vendorName,
      customerName,
      customerContact: customerContact || undefined,
      eventDate,
      eventTime: eventTime || undefined,
      location,
      notes: notes || undefined,
    })

    setCustomerName("")
    setCustomerContact("")
    setEventDate("")
    setEventTime("")
    setLocation("")
    setNotes("")
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <Calendar className="h-4 w-4" />
        Request Booking
      </h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">
            Your Name
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Full name"
            className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">
            Contact (phone or email)
          </label>
          <input
            type="text"
            value={customerContact}
            onChange={(e) => setCustomerContact(e.target.value)}
            placeholder="Optional"
            className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">
              Event Date
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary [color-scheme:dark]"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">
              Time
            </label>
            <input
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary [color-scheme:dark]"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">
            Event Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Address or venue"
            className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special requests"
            rows={2}
            className="w-full resize-none rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button
          type="submit"
          className="flex h-10 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          {submitted ? "Request Sent!" : "Send Booking Request"}
        </button>
      </form>
    </div>
  )
}
