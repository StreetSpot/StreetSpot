"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

type EventInfo = { title?: string; event_type?: string; host_name?: string; starts_at?: string; venue_label?: string; latitude?: number; longitude?: number; invitation_message?: string }

export default function EventInvitePage() {
  const [token, setToken] = useState("")
  const [status, setStatus] = useState<"checking"|"accepted"|"signed-out"|"error">("checking")
  const [message, setMessage] = useState("Checking your private invitation…")
  const [event, setEvent] = useState<EventInfo|null>(null)

  /* eslint-disable react-hooks/set-state-in-effect -- invite token and server state are read on mount. */
  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("token") ?? ""
    setToken(value)
    if (!value) { setStatus("error"); setMessage("This invitation link is missing its token."); return }
    void (async () => {
      try {
        const response = await fetch("/api/private-events/invite/accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: value }),
          cache: "no-store",
        })
        const result = await response.json() as { ok?: boolean; error?: string; event?: EventInfo }
        if (response.status === 401) { setStatus("signed-out"); setMessage("Sign in with the exact email address the host invited."); return }
        if (!response.ok || !result.event) { setStatus("error"); setMessage(result.error ?? "This invitation could not be verified."); return }
        setEvent(result.event)
        setStatus("accepted")
        setMessage("Your invitation is verified. This event is private and visible only to its host and invited guests.")
      } catch {
        setStatus("error")
        setMessage("StreetSpot could not verify the invitation. Check your connection and try again.")
      }
    })()
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  return <main className="flex min-h-dvh items-center justify-center bg-background px-5 py-12 text-foreground">
    <section className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">StreetSpot Private Event</p>
      <h1 className="mt-2 text-3xl font-black">You’re invited.</h1>
      <p role="status" className="mt-4 text-sm leading-6 text-muted-foreground">{message}</p>
      {status === "accepted" && event && <div className="mt-6 rounded-xl border border-border p-4">
        <h2 className="text-xl font-bold">{event.title ?? event.event_type ?? "Private event"}</h2>
        {event.host_name && <p className="mt-1 text-sm">Hosted by {event.host_name}</p>}
        {event.starts_at && <p className="mt-3 text-sm">{new Date(event.starts_at).toLocaleString()}</p>}
        {event.venue_label && <p className="mt-2 text-sm">{event.venue_label}</p>}
        {typeof event.latitude === "number" && typeof event.longitude === "number" && <a className="mt-3 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground" href={"https://www.openstreetmap.org/?mlat=" + event.latitude + "&mlon=" + event.longitude + "#map=16/" + event.latitude + "/" + event.longitude} target="_blank" rel="noreferrer">Open private venue map</a>}
        {event.invitation_message && <p className="mt-3 text-sm leading-6">{event.invitation_message}</p>}
        <p className="mt-4 rounded-lg bg-primary/10 p-3 text-xs leading-5">Private location details are shared only after the invitation is verified.</p>
      </div>}
      <div className="mt-6 flex flex-wrap gap-3">
        {status === "signed-out" && <Link className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground" href={`/account?next=${encodeURIComponent(`/event-invite?token=${token}`)}`}>Sign in to accept</Link>}
        {status === "error" && <button className="rounded-lg border border-border px-4 py-2 text-sm font-semibold" onClick={() => window.location.reload()}>Try again</button>}
        <Link className="rounded-lg border border-border px-4 py-2 text-sm font-semibold" href="/">Back to StreetSpot</Link>
      </div>
    </section>
  </main>
}
