"use client"

import { useEffect, useState } from "react"
import { trackConversion } from "@/lib/analytics-events"
import { CalendarDays, LockKeyhole, MapPin, Navigation, ShieldCheck } from "lucide-react"

type PrivateEvent = {
  title: string
  eventType: string
  hostName: string
  startsAt: string
  venueLabel: string
  latitude: number
  longitude: number
  invitationStyle: string
  invitationMessage: string
}

const invitationThemes = {
  elegant: {
    page: "bg-stone-950",
    card: "from-stone-900 via-stone-800 to-amber-950",
    accent: "text-amber-200",
    button: "bg-amber-200 text-stone-950 hover:bg-amber-100",
    border: "border-amber-200/20",
  },
  celebration: {
    page: "bg-indigo-950",
    card: "from-fuchsia-900 via-violet-900 to-indigo-950",
    accent: "text-pink-200",
    button: "bg-pink-200 text-slate-950 hover:bg-pink-100",
    border: "border-pink-200/20",
  },
  street: {
    page: "bg-[#111116]",
    card: "from-[#25212e] via-[#17171f] to-black",
    accent: "text-[#B6FF38]",
    button: "bg-[#B6FF38] text-black hover:brightness-105",
    border: "border-[#B6FF38]/20",
  },
} as const

export function PrivateInviteView({ token }: { token: string }) {
  const [event, setEvent] = useState<PrivateEvent | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/host/invite/${encodeURIComponent(token)}`, { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json().catch(() => null)
        if (!response.ok || !result?.ok || !result?.event) throw new Error(result?.message || "This invitation link is invalid or has expired.")
        if (!cancelled) {
          const loadedEvent = result.event as PrivateEvent
          setEvent(loadedEvent)
          trackConversion("private_invitation_opened", { style: loadedEvent.invitationStyle })
        }
      })
      .catch((cause) => { if (!cancelled) setError(cause instanceof Error ? cause.message : "This invitation could not be loaded.") })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [token])

  if (loading) return <main className="flex min-h-dvh items-center justify-center bg-[#111116] p-6 text-white"><p className="text-sm text-white/70">Opening your private invitation…</p></main>
  if (error || !event) return <main className="flex min-h-dvh items-center justify-center bg-[#111116] p-6 text-white"><section className="max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center"><LockKeyhole className="mx-auto h-9 w-9 text-[#B6FF38]"/><h1 className="mt-4 text-2xl font-black">Private invitation unavailable</h1><p className="mt-3 text-sm leading-6 text-white/70">{error || "This invitation link is invalid or has expired."}</p></section></main>

  const when = new Date(event.startsAt)
  const dateText = Number.isNaN(when.getTime()) ? "Time to be confirmed" : when.toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`
  const theme = invitationThemes[event.invitationStyle as keyof typeof invitationThemes] ?? invitationThemes.street

  return <main className={`min-h-dvh ${theme.page} px-4 py-10 text-white sm:px-6`}>
    <section className={`mx-auto max-w-xl overflow-hidden rounded-[2rem] border ${theme.border} bg-gradient-to-br ${theme.card} shadow-2xl`}>
      <div className={`border-b ${theme.border} px-6 py-5`}>
        <p className={`flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.2em] ${theme.accent}`}><LockKeyhole className="h-4 w-4"/> Guest-only invitation</p>
        <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">{event.title}</h1>
        <p className="mt-2 text-sm text-white/60">{event.eventType} · Hosted by {event.hostName || "Your host"}</p>
      </div>
      <div className="space-y-5 px-6 py-6">
        <p className="whitespace-pre-wrap text-sm leading-7 text-white/85">{event.invitationMessage || "You're invited to a special celebration."}</p>
        <div className="space-y-3 rounded-2xl border border-white/10 bg-black/25 p-4">
          <p className="flex items-start gap-3 text-sm"><CalendarDays className={`mt-0.5 h-4 w-4 shrink-0 ${theme.accent}`}/><span>{dateText}</span></p>
          <p className="flex items-start gap-3 text-sm"><MapPin className={`mt-0.5 h-4 w-4 shrink-0 ${theme.accent}`}/><span>{event.venueLabel}</span></p>
          <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold ${theme.button}`}><Navigation className="h-4 w-4"/> Get directions</a>
        </div>
        <div className={`flex items-start gap-3 rounded-xl border ${theme.border} bg-white/5 p-4 text-xs leading-5 text-white/65`}><ShieldCheck className={`mt-0.5 h-4 w-4 shrink-0 ${theme.accent}`}/><p>This location is shared through a private invitation link and is not published on StreetSpot&apos;s public map. Keep this link within the invited guest list.</p></div>
        <p className="text-center text-[10px] font-bold uppercase tracking-[.2em] text-white/35">$treet$pot · Real spots. Real people. Real hustle.</p>
      </div>
    </section>
  </main>
}
