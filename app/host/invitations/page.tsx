"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ArrowLeft, CalendarDays, Check, Copy, LockKeyhole, Mail, MapPin, Navigation, PartyPopper, Palette, ShieldCheck, Sparkles, Users } from "lucide-react"

type Style = "elegant" | "celebration" | "street"
type HostPlan = "invite" | "hosted" | "signature"
type FieldKey = "title" | "hostName" | "startsAt" | "venue" | "location" | "guests" | "message" | "form"
type FieldErrors = Partial<Record<FieldKey, string>>
type PlacePin = { label: string; latitude: number; longitude: number }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const hostPlans: { id: HostPlan; name: string; price: string; billing: string; description: string; features: string[]; popular?: boolean }[] = [
  { id: "invite", name: "Custom Invitation", price: "$4.99", billing: "one-time per invitation", description: "A polished, personalized design for one special moment.", features: ["Choose a wedding, graduation, birthday, or other theme", "Customize names, colors, date, message, and venue text", "Copy and share your invitation design"] },
  { id: "hosted", name: "Hosted Event", price: "$14.99", billing: "one-time per event", description: "For hosts who want an event page and a guest list, not just an invitation.", features: ["Everything in Custom Invitation", "Private event page and guest-only invitation links", "Up to 50 invited guests", "Private venue details visible only after guest verification"], popular: true },
  { id: "signature", name: "Signature Celebration", price: "$29.99", billing: "one-time per event", description: "A more customizable experience for weddings and larger celebrations.", features: ["Everything in Hosted Event", "Up to 200 invited guests", "Premium invitation styling", "Guest links tied to invited email addresses"] },
]
const styles: Record<Style, { name: string; tagline: string; shell: string; accent: string }> = {
  elegant: { name: "Elegant", tagline: "A day to remember", shell: "from-stone-900 via-stone-800 to-amber-950", accent: "text-amber-200" },
  celebration: { name: "Celebration", tagline: "Let’s make a memory", shell: "from-fuchsia-800 via-violet-800 to-indigo-950", accent: "text-pink-200" },
  street: { name: "StreetSpot", tagline: "Your people. Your moment.", shell: "from-[#111116] via-[#1b1922] to-[#111116]", accent: "text-[#B6FF38]" },
}

function guestLimitFor(plan: string) {
  return plan === "invite" ? 1 : plan === "hosted" ? 50 : 200
}

function parseGuestLines(text: string) {
  const emails: string[] = []
  const invalid: string[] = []
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed) continue
    const email = (trimmed.includes(",") ? trimmed.split(",").slice(1).join(",") : trimmed).trim().toLowerCase()
    if (EMAIL.test(email) && email.length <= 254) emails.push(email)
    else invalid.push(trimmed)
  }
  return { emails: [...new Set(emails)], invalid }
}

function isFutureDate(date: string, time: string) {
  if (!date || !time) return false
  const timestamp = Date.parse(`${date}T${time}`)
  return Number.isFinite(timestamp) && timestamp > Date.now()
}

function fieldClass(invalid: boolean) {
  return `mt-1.5 h-11 w-full rounded-xl border px-3 ${invalid ? "border-red-500 bg-red-50" : "border-slate-200"}`
}

export default function PrivateInvitationsPage() {
  const router = useRouter()
  const [eventType, setEventType] = useState("Birthday")
  const [eventName, setEventName] = useState("")
  const [hostName, setHostName] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("15:00")
  const [venue, setVenue] = useState("")
  const [message, setMessage] = useState("Join us for a special celebration!")
  const [style, setStyle] = useState<Style>("celebration")
  const [selectedPlan, setSelectedPlan] = useState<HostPlan>("hosted")
  const [guestsText, setGuestsText] = useState("")
  const [notice, setNotice] = useState("")
  const [copied, setCopied] = useState(false)
  const [venueQuery, setVenueQuery] = useState("")
  const [suggestions, setSuggestions] = useState<PlacePin[]>([])
  const [searchingVenue, setSearchingVenue] = useState(false)
  const [locating, setLocating] = useState(false)
  const [pendingPin, setPendingPin] = useState<PlacePin | null>(null)
  const [confirmedPin, setConfirmedPin] = useState<PlacePin | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [activeEventId, setActiveEventId] = useState("")
  const [paidTier, setPaidTier] = useState("")
  const [inviteLinks, setInviteLinks] = useState<Array<{ email: string; url: string }>>([])
  const [busy, setBusy] = useState(false)
  const searchTimer = useRef<number | null>(null)
  const selected = styles[style]
  const parsedGuests = useMemo(() => parseGuestLines(guestsText), [guestsText])

  const validateDetails = useCallback((plan: string): FieldErrors => {
    const errors: FieldErrors = {}
    if (!eventName.trim()) errors.title = "Add an event title."
    else if (eventName.trim().length > 120) errors.title = "Event title must be 120 characters or fewer."
    if (!hostName.trim()) errors.hostName = "Add the host or celebrant name."
    else if (hostName.trim().length > 100) errors.hostName = "Host name must be 100 characters or fewer."
    if (!date || !time) errors.startsAt = "Choose a date and start time."
    else if (!isFutureDate(date, time)) errors.startsAt = "Choose a date and time in the future."
    if (!venue.trim()) errors.venue = "Add a venue name or street address."
    else if (venue.trim().length > 200) errors.venue = "Venue must be 200 characters or fewer."
    if (!confirmedPin) errors.location = pendingPin
      ? "Confirm the venue pin below before continuing. You do not need to enter coordinates."
      : "Search the venue address or use your location to drop a private pin. You do not need to enter coordinates."
    if (message.trim().length > 1000) errors.message = "The personal message must be 1000 characters or fewer."
    if (parsedGuests.invalid.length) errors.guests = `These guest emails are invalid: ${parsedGuests.invalid.join(", ")}`
    else if (parsedGuests.emails.length < 1) errors.guests = "Add at least one valid guest email address."
    else if (parsedGuests.emails.length > guestLimitFor(plan)) {
      errors.guests = `This package allows up to ${guestLimitFor(plan)} invited guest(s); you entered ${parsedGuests.emails.length}.`
    }
    return errors
  }, [eventName, hostName, date, time, venue, confirmedPin, pendingPin, message, parsedGuests])

  const checkoutGaps = useMemo(() => validateDetails(selectedPlan), [validateDetails, selectedPlan])
  const publishGaps = useMemo(() => validateDetails(paidTier || selectedPlan), [validateDetails, paidTier, selectedPlan])

  /* eslint-disable react-hooks/set-state-in-effect -- restore the pending event from browser storage on mount. */
  useEffect(() => {
    const eventId = window.localStorage.getItem("streetspot_pending_event_id")
    if (!eventId) return
    setActiveEventId(eventId)
    void (async () => {
      try {
        const [eventResponse, purchaseResponse, guestsResponse] = await Promise.all([
          fetch(`/api/private-events/${encodeURIComponent(eventId)}`, { cache: "no-store" }),
          fetch(`/api/private-events/${encodeURIComponent(eventId)}/purchase`, { cache: "no-store" }),
          fetch(`/api/private-events/${encodeURIComponent(eventId)}/guests`, { cache: "no-store" }),
        ])
        if (guestsResponse.ok) {
          const guests = await guestsResponse.json() as { emails?: unknown }
          if (Array.isArray(guests.emails)) setGuestsText(guests.emails.filter((email): email is string => typeof email === "string").join("\n"))
        }
        if (eventResponse.ok) {
          const payload = await eventResponse.json() as { event?: Record<string, unknown> }
          const event = payload.event
          if (event) {
            if (typeof event.title === "string") setEventName(event.title)
            if (typeof event.event_type === "string") setEventType(event.event_type)
            if (typeof event.host_name === "string") setHostName(event.host_name)
            if (typeof event.venue_label === "string") setVenue(event.venue_label)
            if (typeof event.invitation_message === "string") setMessage(event.invitation_message)
            if (typeof event.invitation_style === "string" && event.invitation_style in styles) setStyle(event.invitation_style as Style)
            if (typeof event.latitude === "number" && typeof event.longitude === "number" && Number.isFinite(event.latitude) && Number.isFinite(event.longitude)) {
              const label = typeof event.venue_label === "string" && event.venue_label.trim() ? event.venue_label : "Saved venue pin"
              const pin = { label, latitude: event.latitude, longitude: event.longitude }
              setConfirmedPin(pin)
              setPendingPin(null)
              setVenueQuery("")
            }
            if (typeof event.starts_at === "string") {
              const start = new Date(event.starts_at)
              if (Number.isFinite(start.getTime())) {
                setDate(`${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`)
                setTime(`${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`)
              }
            }
          }
        }
        if (purchaseResponse.ok) {
          const purchase = await purchaseResponse.json() as { paid?: boolean; purchase?: { tier?: string } | null }
          if (purchase.paid && purchase.purchase?.tier) {
            setPaidTier(purchase.purchase.tier)
            if (["invite", "hosted", "signature"].includes(purchase.purchase.tier)) setSelectedPlan(purchase.purchase.tier as HostPlan)
            setNotice("Payment confirmed by StreetSpot. Publish your private event to create guest invitations.")
          } else {
            setNotice("Your event draft is saved. Payment has not been confirmed, so the event cannot be published yet.")
          }
        }
      } catch {
        setNotice("Your event draft is saved. Payment confirmation could not be checked right now.")
      }
    })()
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    return () => {
      if (searchTimer.current) window.clearTimeout(searchTimer.current)
    }
  }, [])

  function applyServerFields(result: { error?: string; fields?: FieldErrors; invalidEmails?: string[] }, fallback: string) {
    const fields: FieldErrors = { ...(result.fields ?? {}) }
    if (result.invalidEmails?.length && !fields.guests) {
      fields.guests = `These guest emails are invalid: ${result.invalidEmails.join(", ")}`
    }
    setFieldErrors(fields)
    setNotice(result.error ?? Object.values(fields)[0] ?? fallback)
  }

  async function searchVenue(query: string) {
    const trimmed = query.trim()
    setVenueQuery(query)
    if (searchTimer.current) window.clearTimeout(searchTimer.current)
    if (trimmed.length < 3) {
      setSuggestions([])
      setSearchingVenue(false)
      return
    }
    setSearchingVenue(true)
    searchTimer.current = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/geocode?q=${encodeURIComponent(trimmed)}`, { cache: "no-store" })
        const result = await response.json() as { ok?: boolean; error?: string; results?: PlacePin[] }
        setSuggestions(Array.isArray(result.results) ? result.results : [])
        if (!response.ok || result.ok === false) {
          setFieldErrors((current) => ({ ...current, location: result.error ?? "Address search is temporarily unavailable." }))
        } else if (!result.results?.length) {
          setFieldErrors((current) => ({ ...current, location: "No matches for that address. Try a fuller street address, or use your location if you are at the venue." }))
        } else {
          setFieldErrors((current) => ({ ...current, location: undefined }))
        }
      } catch {
        setSuggestions([])
        setFieldErrors((current) => ({ ...current, location: "Address search is temporarily unavailable. Try again, or use your location if you are at the venue." }))
      } finally {
        setSearchingVenue(false)
      }
    }, 400)
  }

  function chooseSuggestion(place: PlacePin) {
    setPendingPin(place)
    setConfirmedPin(null)
    setSuggestions([])
    setVenueQuery(place.label)
    setVenue((current) => current.trim() || place.label)
    setFieldErrors((current) => ({ ...current, location: undefined, venue: current.venue }))
  }

  function confirmPendingPin() {
    if (!pendingPin) return
    setConfirmedPin(pendingPin)
    if (!venue.trim()) setVenue(pendingPin.label.slice(0, 200))
    setPendingPin(null)
    setSuggestions([])
    setFieldErrors((current) => ({ ...current, location: undefined, venue: undefined }))
    setNotice("Private pin confirmed. Invited guests will see this place; it stays off the public map.")
  }

  function clearPin() {
    setPendingPin(null)
    setConfirmedPin(null)
    setSuggestions([])
  }

  async function captureCurrentLocation() {
    if (!navigator.geolocation) {
      setFieldErrors((current) => ({ ...current, location: "This browser cannot provide a location. Search the venue address instead." }))
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(`/api/geocode?lat=${encodeURIComponent(String(position.coords.latitude))}&lon=${encodeURIComponent(String(position.coords.longitude))}`, { cache: "no-store" })
          const result = await response.json() as { results?: PlacePin[]; error?: string }
          const place = result.results?.[0] ?? {
            label: "Your current location",
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }
          setPendingPin(place)
          setConfirmedPin(null)
          setVenueQuery(place.label)
          setFieldErrors((current) => ({ ...current, location: undefined }))
          setNotice("Confirm this is the venue before continuing. If you are not at the venue, search the address instead.")
        } catch {
          setFieldErrors((current) => ({ ...current, location: "Your location was found, but the place name could not be looked up. Search the venue address instead." }))
        } finally {
          setLocating(false)
        }
      },
      (error) => {
        setLocating(false)
        const reason = error.code === error.PERMISSION_DENIED
          ? "Location permission was blocked. Search the venue address instead, or allow location access and try again."
          : error.code === error.TIMEOUT
            ? "Location lookup timed out. Search the venue address, or try Use my location again."
            : "Could not read your location. Search the venue address instead."
        setFieldErrors((current) => ({ ...current, location: reason }))
      },
      { enableHighAccuracy: true, timeout: 12000 },
    )
  }

  async function startCheckout() {
    const errors = validateDetails(selectedPlan)
    setFieldErrors(errors)
    if (Object.keys(errors).length || !confirmedPin) {
      setNotice(Object.values(errors).join(" ") || "Complete the event details before checkout. No payment was taken.")
      document.getElementById("invitation-creator")?.scrollIntoView({ behavior: "smooth", block: "start" })
      return
    }
    setBusy(true)
    setNotice("")
    try {
      const response = await fetch("/api/private-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: eventName.trim(),
          eventType,
          hostName: hostName.trim(),
          startsAt: new Date(`${date}T${time}`).toISOString(),
          venueLabel: venue.trim(),
          latitude: confirmedPin.latitude,
          longitude: confirmedPin.longitude,
          invitationStyle: style,
          invitationMessage: message,
        }),
      })
      if (response.status === 401) {
        router.push(`/account?next=${encodeURIComponent("/host/invitations")}`)
        return
      }
      const result = await response.json() as { ok?: boolean; error?: string; fields?: FieldErrors; event?: { id: string } }
      if (!response.ok || !result.event?.id) {
        applyServerFields(result, "The event draft could not be saved. No payment was taken.")
        return
      }
      window.localStorage.setItem("streetspot_pending_event_id", result.event.id)
      setActiveEventId(result.event.id)
      const guestDraftResponse = await fetch(`/api/private-events/${encodeURIComponent(result.event.id)}/guests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: parsedGuests.emails, plan: selectedPlan }),
      })
      if (guestDraftResponse.status === 401) {
        router.push("/account?next=" + encodeURIComponent("/host/invitations"))
        return
      }
      const guestDraft = await guestDraftResponse.json() as { ok?: boolean; error?: string; fields?: FieldErrors; invalidEmails?: string[] }
      if (!guestDraftResponse.ok) {
        applyServerFields(guestDraft, "The event was saved, but the private guest list could not be saved. No payment was taken.")
        return
      }
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- this API route responds with a 302 to Stripe Checkout.
      window.location.href = `/api/billing/checkout?plan=event_${selectedPlan}&eventId=${encodeURIComponent(result.event.id)}`
    } catch {
      setNotice("StreetSpot could not save the event draft. Check your connection and try again. No payment was taken.")
    } finally {
      setBusy(false)
    }
  }

  async function publishEvent() {
    if (!activeEventId || !paidTier) {
      setNotice("A confirmed payment is required before publishing.")
      return
    }
    const errors = validateDetails(paidTier)
    setFieldErrors(errors)
    if (Object.keys(errors).length) {
      setNotice(Object.values(errors).join(" "))
      document.getElementById("invitation-creator")?.scrollIntoView({ behavior: "smooth", block: "start" })
      return
    }
    setBusy(true)
    try {
      const response = await fetch(`/api/private-events/${encodeURIComponent(activeEventId)}/publish`, { method: "POST" })
      if (response.status === 401) {
        router.push("/account?next=" + encodeURIComponent("/host/invitations"))
        return
      }
      const result = await response.json() as { ok?: boolean; error?: string }
      if (!response.ok) {
        setNotice(result.error ?? "The event could not be published.")
        return
      }
      const inviteResponse = await fetch(`/api/private-events/${encodeURIComponent(activeEventId)}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: parsedGuests.emails }),
      })
      if (inviteResponse.status === 401) {
        router.push("/account?next=" + encodeURIComponent("/host/invitations"))
        return
      }
      const inviteResult = await inviteResponse.json() as { ok?: boolean; error?: string; fields?: FieldErrors; invalidEmails?: string[]; invites?: Array<{ email: string; url: string }> }
      if (!inviteResponse.ok) {
        applyServerFields(inviteResult, "The event is published privately, but guest invitations could not be created.")
        return
      }
      setInviteLinks(inviteResult.invites ?? [])
      setNotice("Your event is published privately. Copy each guest link and send it directly; StreetSpot does not email guests automatically.")
    } catch {
      setNotice("StreetSpot could not finish publishing the event. Try again.")
    } finally {
      setBusy(false)
    }
  }

  function saveDraft() {
    localStorage.setItem("streetspot_private_invitation_draft", JSON.stringify({
      eventType, eventName, hostName, date, time, venue, venueLabel: confirmedPin?.label, message, style, guestsText, selectedPlan, savedAt: new Date().toISOString(),
    }))
    setNotice("Private invitation draft saved on this device only. No guests were invited and no map pin was published.")
  }

  async function copyPreview() {
    const text = `${eventName || `${eventType} Celebration`}\n${message}\nHosted by ${hostName || "Your host"}\n${date || "Date to be announced"} at ${time}\n${venue || "Venue shared privately with invited guests"}\n\nPrivate invitation draft. The event is not published.`
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { setNotice(text) }
  }

  return <main className="min-h-dvh bg-[#f6f7f2] px-4 py-8 text-slate-900 sm:px-6"><div className="mx-auto max-w-6xl">
    <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600"><ArrowLeft className="h-4 w-4"/> Back to StreetSpot</Link>
    <div className="mb-8 flex items-start gap-3"><div className="rounded-2xl bg-slate-900 p-3 text-[#258052]"><LockKeyhole className="h-6 w-6"/></div><div><p className="text-xs font-bold uppercase tracking-[.2em] text-slate-500">Private Host Studio</p><h1 className="mt-1 text-3xl font-black sm:text-4xl">Invitations that stay in your circle.</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Design wedding, graduation, birthday, family, and private-party invitations with guest names and a chosen look. Private pins must never be publicly listed.</p></div></div>
    <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
      <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center gap-2"><PartyPopper className="h-5 w-5 text-fuchsia-700"/><h2 id="invitation-creator" className="text-lg font-extrabold">Invitation creator</h2></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold">Occasion<select value={eventType} onChange={e=>setEventType(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3">{["Wedding","Graduation","Birthday","Baby Shower","Anniversary","Family Gathering","Private Party","Other"].map(v=><option key={v}>{v}</option>)}</select></label>
          <label className="text-sm font-semibold">Invitation style<select value={style} onChange={e=>setStyle(e.target.value as Style)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3">{Object.entries(styles).map(([key,v])=><option key={key} value={key}>{v.name}</option>)}</select></label>
          <label className="text-sm font-semibold sm:col-span-2">Event title<input value={eventName} onChange={e=>setEventName(e.target.value)} placeholder="e.g. Callie & Jordan’s Wedding" maxLength={120} aria-invalid={Boolean(fieldErrors.title)} className={fieldClass(Boolean(fieldErrors.title))}/></label>
          {fieldErrors.title && <p role="alert" className="sm:col-span-2 text-sm font-semibold text-red-700">{fieldErrors.title}</p>}
          <label className="text-sm font-semibold">Host / celebrant name<input value={hostName} onChange={e=>setHostName(e.target.value)} placeholder="Name to print on invitation" maxLength={100} aria-invalid={Boolean(fieldErrors.hostName)} className={fieldClass(Boolean(fieldErrors.hostName))}/></label>
          <div className="grid grid-cols-2 gap-4">
            <label className="text-sm font-semibold">Date<input type="date" value={date} onChange={e=>setDate(e.target.value)} aria-invalid={Boolean(fieldErrors.startsAt)} className={fieldClass(Boolean(fieldErrors.startsAt))}/></label>
            <label className="text-sm font-semibold">Start time<input type="time" value={time} onChange={e=>setTime(e.target.value)} aria-invalid={Boolean(fieldErrors.startsAt)} className={fieldClass(Boolean(fieldErrors.startsAt))}/></label>
          </div>
          {fieldErrors.hostName && <p role="alert" className="text-sm font-semibold text-red-700">{fieldErrors.hostName}</p>}
          {fieldErrors.startsAt && <p role="alert" className="text-sm font-semibold text-red-700 sm:col-span-2">{fieldErrors.startsAt}</p>}
          <label className="text-sm font-semibold sm:col-span-2">Venue name or address<input value={venue} onChange={e=>setVenue(e.target.value)} placeholder="Address shared privately with guests" maxLength={200} aria-invalid={Boolean(fieldErrors.venue)} className={fieldClass(Boolean(fieldErrors.venue))}/></label>
          {fieldErrors.venue && <p role="alert" className="sm:col-span-2 text-sm font-semibold text-red-700">{fieldErrors.venue}</p>}
          <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-emerald-700"/><h3 className="font-bold">Private venue pin</h3></div>
            <p className="mt-1 text-sm leading-5 text-slate-600">Search the venue address to set a private pin for invited guests. You can also use your current location if you are already there. You never need to type coordinates.</p>
            <input type="search" value={venueQuery} onChange={(e) => void searchVenue(e.target.value)} placeholder="Search street address or place name" aria-invalid={Boolean(fieldErrors.location)} aria-describedby={fieldErrors.location ? "location-error" : undefined} className={`${fieldClass(Boolean(fieldErrors.location))} bg-white`} />
            {searchingVenue && <p className="mt-2 text-xs text-slate-500">Searching addresses…</p>}
            {suggestions.length > 0 && (
              <ul className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white">
                {suggestions.map((suggestion) => (
                  <li key={`${suggestion.latitude},${suggestion.longitude},${suggestion.label}`}>
                    <button type="button" className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50" onClick={() => chooseSuggestion(suggestion)}>{suggestion.label}</button>
                  </li>
                ))}
              </ul>
            )}
            <button type="button" onClick={() => void captureCurrentLocation()} disabled={locating} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold disabled:opacity-50"><Navigation className="h-4 w-4"/>{locating ? "Finding your location…" : "Use my current location"}</button>
            {pendingPin && !confirmedPin && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-white p-3">
                <p className="text-sm font-bold text-slate-900">Confirm this private pin</p>
                <p className="mt-1 text-sm leading-5 text-slate-700">{pendingPin.label}</p>
                <p className="mt-1 text-xs text-slate-500">Invited guests will see this place. It will not appear on the public map.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={confirmPendingPin} className="inline-flex min-h-10 items-center rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white">Use this location</button>
                  <button type="button" onClick={clearPin} className="inline-flex min-h-10 items-center rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold">Choose a different place</button>
                </div>
              </div>
            )}
            {confirmedPin && (
              <p className="mt-3 text-sm font-semibold text-emerald-800">Private pin set for {confirmedPin.label}. Invited guests will see this place.</p>
            )}
            {fieldErrors.location && <p id="location-error" role="alert" className="mt-2 text-sm font-semibold text-red-700">{fieldErrors.location}</p>}
          </div>
          <label className="text-sm font-semibold sm:col-span-2">Personal message<textarea value={message} onChange={e=>setMessage(e.target.value)} rows={3} maxLength={1000} aria-invalid={Boolean(fieldErrors.message)} className={`mt-1.5 w-full rounded-xl border px-3 py-2 ${fieldErrors.message ? "border-red-500 bg-red-50" : "border-slate-200"}`}/></label>
          {fieldErrors.message && <p role="alert" className="sm:col-span-2 text-sm font-semibold text-red-700">{fieldErrors.message}</p>}
        </div>
        <div className="rounded-xl border border-slate-200 p-4"><div className="mb-2 flex items-center gap-2"><Users className="h-4 w-4"/><h3 className="font-bold">Selected invitees</h3></div><p className="mb-3 text-xs leading-5 text-slate-500">Enter one guest per line as <code>Name, email@example.com</code>, or enter an email by itself. Only addresses selected by the host belong on the invitation list.</p><textarea value={guestsText} onChange={e=>setGuestsText(e.target.value)} rows={5} placeholder={'Jordan Lee, jordan@example.com\nTaylor Smith, taylor@example.com'} aria-invalid={Boolean(fieldErrors.guests)} className={`w-full rounded-xl border px-3 py-2 font-mono text-sm ${fieldErrors.guests ? "border-red-500 bg-red-50" : "border-slate-200"}`}/><p className="mt-2 text-xs text-slate-500">{parsedGuests.emails.length} valid unique email address(es) detected{parsedGuests.invalid.length ? `; ${parsedGuests.invalid.length} line(s) need a valid email.` : ""}. This draft does not send invitations.</p>{parsedGuests.invalid.length > 0 && <p role="alert" className="mt-2 text-sm font-semibold text-red-700">These guest emails are invalid: {parsedGuests.invalid.join(", ")}</p>}{fieldErrors.guests && parsedGuests.invalid.length === 0 && <p role="alert" className="mt-2 text-sm font-semibold text-red-700">{fieldErrors.guests}</p>}</div>
        <div className="flex flex-wrap gap-3"><button onClick={saveDraft} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white"><Check className="h-4 w-4"/> Save private draft</button><button onClick={copyPreview} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold"><Copy className="h-4 w-4"/>{copied?"Copied":"Copy invitation text"}</button></div>
        {notice && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-900">{notice}</p>}
        {activeEventId && paidTier && <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <h3 className="font-extrabold text-emerald-950">Paid event setup</h3>
          <p className="text-sm leading-5 text-emerald-900">Payment is confirmed for this event. Publish it privately to generate guest-only invitation links.</p>
          {Object.keys(publishGaps).length > 0 && (
            <ul className="list-disc space-y-1 pl-5 text-sm font-semibold text-red-700">
              <li className="list-none font-bold text-red-800">To publish, still needed:</li>
              {Object.values(publishGaps).map((item) => <li key={item}>{item}</li>)}
            </ul>
          )}
          <button type="button" onClick={() => void publishEvent()} disabled={busy} className="min-h-11 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">{busy ? "Working…" : "Publish private event and create guest links"}</button>
          {inviteLinks.map(invite => <div key={invite.email} className="break-all rounded-lg border border-emerald-200 bg-white p-3 text-sm"><strong>{invite.email}</strong><p className="mt-1"><a href={invite.url} className="underline">{invite.url}</a></p><button type="button" onClick={() => void navigator.clipboard.writeText(invite.url)} className="mt-2 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold">Copy invite link</button></div>)}
        </div>}
      </section>
      <aside className="space-y-4"><section className={`overflow-hidden rounded-3xl bg-gradient-to-br ${selected.shell} p-6 text-white shadow-xl`}><div className="flex items-center justify-between"><span className={`text-xs font-bold uppercase tracking-[.2em] ${selected.accent}`}>You’re invited</span><Sparkles className={`h-5 w-5 ${selected.accent}`}/></div><div className="my-8 border-y border-white/20 py-8 text-center"><p className={`text-sm ${selected.accent}`}>{selected.tagline}</p><h2 className="mt-3 text-3xl font-black leading-tight">{eventName || `${eventType} Celebration`}</h2><p className="mt-4 text-sm leading-6 text-white/85">{message}</p><p className="mt-6 font-bold">{hostName || "Your host"}</p></div><div className="space-y-3 text-sm"><p className="flex items-center gap-2"><CalendarDays className={`h-4 w-4 ${selected.accent}`}/>{date || "Date to be announced"} · {time}</p><p className="flex items-center gap-2"><Mail className={`h-4 w-4 ${selected.accent}`}/>{venue || "Venue details shared privately"}</p></div><div className={`mt-6 rounded-xl border border-white/20 bg-black/20 p-3 text-xs leading-5 ${selected.accent}`}><LockKeyhole className="mr-1 inline h-3.5 w-3.5"/> PRIVATE INVITE · No public event pin</div></section>
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-800"/><div><h3 className="font-extrabold text-emerald-950">Privacy must be enforced on the server</h3><p className="mt-1 text-sm leading-6 text-emerald-900">A hidden icon is not access control. Production must keep private coordinates out of public map APIs and verify each guest’s signed-in email against the host’s invite list before returning the pin or venue.</p></div></div></section>
      <section className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center gap-2"><Palette className="h-4 w-4"/><h3 className="font-bold">What this draft does</h3></div><ul className="mt-3 space-y-2 text-sm text-slate-600"><li>✓ Personalize occasion, names, date, time, venue label, and message</li><li>✓ Preview three invitation looks</li><li>✓ Save draft on this device and copy invitation text</li><li>✓ Publish a paid event privately after server-confirmed payment</li><li>✓ Generate guest-only invitation links tied to invited email addresses</li></ul></section></aside>
    </div>
    <section className="mt-10" aria-labelledby="host-pricing-title">
      <div className="mb-5 max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-slate-500">Simple, one-time pricing</p>
        <h2 id="host-pricing-title" className="mt-2 text-2xl font-black sm:text-3xl">Make the moment yours.</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Choose a wedding, graduation, birthday, baby shower, anniversary, or any personal celebration. Every package is a one-time payment per invitation or event, not a recurring subscription.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {hostPlans.map((plan) => {
          const isSelected = selectedPlan === plan.id
          return <article key={plan.id} className={`relative flex flex-col rounded-2xl border bg-white p-5 shadow-sm ${isSelected ? "border-slate-900 ring-2 ring-slate-900" : "border-slate-200"}`}>
            {plan.popular && <span className="absolute -top-3 right-4 rounded-full bg-[#f06435] px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white">Most popular</span>}
            <h3 className="text-lg font-extrabold">{plan.name}</h3>
            <p className="mt-2 min-h-12 text-sm leading-5 text-slate-600">{plan.description}</p>
            <div className="mt-4"><span className="text-3xl font-black">{plan.price}</span><p className="mt-1 text-xs font-semibold text-slate-500">{plan.billing}</p></div>
            <ul className="my-5 flex-1 space-y-2 text-sm text-slate-700">{plan.features.map((feature) => <li key={feature} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />{feature}</li>)}</ul>
            <button type="button" onClick={() => { setSelectedPlan(plan.id); setNotice(`${plan.name} selected at ${plan.price} (${plan.billing}). Complete the event details, then continue to secure checkout below.`) }} className={`min-h-11 rounded-xl px-4 py-3 text-sm font-bold ${isSelected ? "bg-slate-900 text-white" : "border border-slate-300 text-slate-900 hover:bg-slate-50"}`}>
              {isSelected ? "Selected package" : "Choose this package"}
            </button>
          </article>
        })}
      </div>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-extrabold">Secure checkout and private publishing</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">Your event draft is saved to your account before checkout. Complete the title, host name, future date, guest list, and venue pin first — Stripe checkout will not start until those details are valid. Payment is confirmed on the server. Only paid events can be published, and invitation links are generated for the email addresses you provide. StreetSpot does not send invitation emails automatically.</p>
        {Object.keys(checkoutGaps).length > 0 && (
          <ul className="mt-4 list-disc space-y-1 rounded-xl border border-red-200 bg-red-50 p-4 pl-8 text-sm font-semibold text-red-700">
            <li className="list-none -ml-3 font-bold text-red-800">To continue to checkout, still needed:</li>
            {Object.values(checkoutGaps).map((item) => <li key={item}>{item}</li>)}
          </ul>
        )}
        <button type="button" onClick={() => void startCheckout()} disabled={busy} className="mt-4 min-h-12 w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{busy ? "Preparing secure checkout…" : `Create private event draft and pay ${hostPlans.find(plan => plan.id === selectedPlan)?.price ?? ""}`}</button>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-500">The private event pin is set from an address search or your location. Invited guests see the place name; StreetSpot does not ask you to type map coordinates.</p>
    </section>
  </div></main>
}
