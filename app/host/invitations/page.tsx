"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, CalendarDays, Check, Copy, LockKeyhole, Mail, MapPin, Navigation, PartyPopper, ShieldCheck, Sparkles, Users } from "lucide-react"
import { VendorLogin, type StreetSpotAuthSession } from "@/components/vendor-login"

type Style = "elegant" | "celebration" | "street"
type HostPlan = "invite" | "hosted" | "signature"
type Purchase = { id: string; tier: HostPlan; guest_limit: number; stripe_checkout_session_id: string; created_at: string }
type InviteLink = { email: string; url: string; expiresAt: string }
type PrivateLocation = { latitude: number; longitude: number }

const paymentLinks: Record<HostPlan, string> = {
  invite: "https://buy.stripe.com/3cI4gBfEegK4cvOcU01VK0a",
  hosted: "https://buy.stripe.com/6oUaEZ1NogK41Ra1bi1VK0b",
  signature: "https://buy.stripe.com/28EdRbbnY65q7bu07e1VK0c",
}
const hostPlans: { id: HostPlan; name: string; price: string; billing: string; description: string; features: string[]; popular?: boolean }[] = [
  { id: "invite", name: "Custom Invitation", price: "$4.99", billing: "one-time per invitation", description: "A polished, personalized design for one special moment.", features: ["One invited guest", "Personalized invitation design", "Private link with venue details"] },
  { id: "hosted", name: "Hosted Event", price: "$14.99", billing: "one-time per event", description: "For hosts who want an event page and a guest list, not just an invitation.", features: ["Up to 50 invited guests", "Private event page and guest-only pin", "Shareable guest invitation links"], popular: true },
  { id: "signature", name: "Signature Celebration", price: "$29.99", billing: "one-time per event", description: "A more customizable experience for weddings and larger celebrations.", features: ["Up to 200 invited guests", "Private event page and guest-only pin", "Expanded celebration styling"] },
]
const styles: Record<Style, { name: string; tagline: string; shell: string; accent: string }> = {
  elegant: { name: "Elegant", tagline: "A day to remember", shell: "from-stone-900 via-stone-800 to-amber-950", accent: "text-amber-200" },
  celebration: { name: "Celebration", tagline: "Let’s make a memory", shell: "from-fuchsia-800 via-violet-800 to-indigo-950", accent: "text-pink-200" },
  street: { name: "StreetSpot", tagline: "Your people. Your moment.", shell: "from-[#111116] via-[#1b1922] to-[#111116]", accent: "text-[#B6FF38]" },
}

function isFutureDate(value: string) {
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) && timestamp > Date.now()
}

export default function PrivateInvitationsPage() {
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
  const [userId, setUserId] = useState("")
  const [accessToken, setAccessToken] = useState("")
  const [accountEmail, setAccountEmail] = useState("")
  const [accountLoading, setAccountLoading] = useState(true)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [inviteLinks, setInviteLinks] = useState<InviteLink[]>([])
  const [privateLocation, setPrivateLocation] = useState<PrivateLocation | null>(null)
  const [capturingLocation, setCapturingLocation] = useState(false)
  const [publishing, setPublishing] = useState(false)

  const guestEmails = useMemo(() => {
    const emails = guestsText.split(/\r?\n/).map((line) => {
      const trimmed = line.trim()
      if (!trimmed) return ""
      const parts = trimmed.split(",")
      return (parts.length > 1 ? parts.slice(1).join(",") : trimmed).trim().toLowerCase()
    }).filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return [...new Set(emails)]
  }, [guestsText])
  const selected = styles[style]

  useEffect(() => {
    const restore = () => {
      try {
        const saved = sessionStorage.getItem("streetspot_auth_session")
        if (saved) {
          const session = JSON.parse(saved) as StreetSpotAuthSession
          if (session.access_token && session.user?.id) {
            setUserId(session.user.id)
            setAccessToken(session.access_token)
            setAccountEmail(session.user.email ?? "")
            setHostName((current) => current || session.user.user_metadata?.business_name || "")
          }
        }
      } catch { sessionStorage.removeItem("streetspot_auth_session") }
      setAccountLoading(false)
    }
    const timer = window.setTimeout(restore, 0)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!accessToken) return
    let cancelled = false
    fetch("/api/host/purchases", { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" })
      .then(async (response) => {
        const result = await response.json().catch(() => null)
        if (!response.ok || !result?.ok) throw new Error(result?.message || "Could not verify event purchases.")
        if (!cancelled) setPurchases(Array.isArray(result.purchases) ? result.purchases : [])
      })
      .catch((cause) => { if (!cancelled) setNotice(cause instanceof Error ? cause.message : "Could not load paid event packages.") })
    return () => { cancelled = true }
  }, [accessToken])

  function saveDraft() {
    localStorage.setItem("streetspot_private_invitation_draft", JSON.stringify({
      eventType, eventName, hostName, date, time, venue, message, style, guestsText, selectedPlan,
      savedAt: new Date().toISOString(),
    }))
    setNotice("Draft saved on this device only. The event is not published until a paid package is verified.")
  }

  async function copyPreview() {
    const text = `${eventName || `${eventType} Celebration`}\n${message}\nHosted by ${hostName || "Your host"}\n${date || "Date to be announced"} at ${time}\n${venue || "Venue shared privately with invited guests"}\n\nInvitation preview. The event is not published.`
    try { await navigator.clipboard.writeText(text); setCopied(true); window.setTimeout(() => setCopied(false), 1800) }
    catch { setNotice(text) }
  }

  function captureVenueLocation() {
    if (!navigator.geolocation) {
      setNotice("This browser cannot provide a location. Allow location access in a supported browser.")
      return
    }
    setCapturingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPrivateLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude })
        setCapturingLocation(false)
        setNotice("Private map coordinates captured. They will only be returned through each guest’s invitation link.")
      },
      () => {
        setCapturingLocation(false)
        setNotice("Could not capture the venue location. Allow location access and try again while at the venue.")
      },
      { enableHighAccuracy: true, timeout: 12000 },
    )
  }

  function startCheckout(plan: HostPlan) {
    if (!userId) {
      setNotice("Create or sign in to your StreetSpot account first. No payment is taken until you continue to Stripe.")
      return
    }
    setSelectedPlan(plan)
    const url = new URL(paymentLinks[plan])
    url.searchParams.set("client_reference_id", userId)
    window.location.assign(url.toString())
  }

  async function publishEvent(purchase: Purchase, plan: HostPlan) {
    if (!accessToken || !userId) {
      setNotice("Sign in before publishing a paid private event.")
      return
    }
    if (!eventName.trim() || !hostName.trim() || !date || !time || !venue.trim()) {
      setNotice("Complete the event title, host name, future date/time, and venue label first.")
      return
    }
    if (!privateLocation) {
      setNotice("Capture the venue's private map location before publishing.")
      return
    }
    if (guestEmails.length < 1) {
      setNotice("Add at least one valid guest email address.")
      return
    }
    if (guestEmails.length > purchase.guest_limit) {
      setNotice(`This ${plan} package allows up to ${purchase.guest_limit} invited guest(s); you entered ${guestEmails.length}.`)
      return
    }
    if (!isFutureDate(`${date}T${time}`)) {
      setNotice("Choose a future event date and time.")
      return
    }
    const startsAt = new Date(`${date}T${time}`)

    setPublishing(true)
    setNotice("")
    try {
      const response = await fetch("/api/host/events", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          purchaseId: purchase.id, title: eventName.trim(), eventType, hostName: hostName.trim(),
          startsAt: startsAt.toISOString(), venueLabel: venue.trim(),
          latitude: privateLocation.latitude, longitude: privateLocation.longitude,
          invitationStyle: style, invitationMessage: message, guestEmails,
        }),
        cache: "no-store",
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || !result?.ok) throw new Error(result?.message || "The private event could not be published.")
      setInviteLinks(Array.isArray(result.inviteLinks) ? result.inviteLinks : [])
      setPurchases((current) => current.filter((item) => item.id !== purchase.id))
      setNotice(result.message || "Private event published. Copy each guest's invitation link below.")
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : "The private event could not be published.")
    } finally {
      setPublishing(false)
    }
  }

  async function copyInvite(url: string) {
    try { await navigator.clipboard.writeText(url); setNotice("Invitation link copied. Share it only with the selected guest.") }
    catch { setNotice(url) }
  }

  return <main className="min-h-dvh bg-[#f6f7f2] px-4 py-8 text-slate-900 sm:px-6"><div className="mx-auto max-w-6xl">
    <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600"><ArrowLeft className="h-4 w-4"/> Back to StreetSpot</Link>
    <div className="mb-8 flex items-start gap-3"><div className="rounded-2xl bg-slate-900 p-3 text-[#B6FF38]"><LockKeyhole className="h-6 w-6"/></div><div><p className="text-xs font-bold uppercase tracking-[.2em] text-slate-500">Private Host Studio</p><h1 className="mt-1 text-3xl font-black sm:text-4xl">Invitations that stay in your circle.</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Create a paid private event, keep venue coordinates out of public listings, and share a unique invitation link with each selected guest.</p></div></div>

    {!userId && <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><h2 className="mb-2 text-lg font-extrabold">Sign in to host an event</h2><p className="mb-4 text-sm leading-6 text-slate-600">Purchases and private invitations are tied to your StreetSpot account so paid packages cannot be claimed by someone else.</p><VendorLogin onLogin={(name, session) => { setUserId(session.user.id); setAccessToken(session.access_token); setAccountEmail(session.user.email ?? ""); setHostName((current) => current || name); setNotice("Account connected. Paid packages will appear here after Stripe confirms the payment.") }} /></section>}
    {userId && <section className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><p className="flex items-center gap-2 text-sm font-bold text-emerald-950"><ShieldCheck className="h-4 w-4"/> Signed in as {accountEmail || userId}</p><p className="mt-1 text-sm text-emerald-900">{purchases.length ? `${purchases.length} unused paid package(s) ready to use.` : "No unused paid packages yet. Choose a package below to pay securely."}</p></section>}

    <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
      <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2"><PartyPopper className="h-5 w-5 text-fuchsia-700"/><h2 className="text-lg font-extrabold">Invitation creator</h2></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold">Occasion<select value={eventType} onChange={e=>setEventType(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3">{["Wedding","Graduation","Birthday","Baby Shower","Anniversary","Family Gathering","Private Party","Other"].map(v=><option key={v}>{v}</option>)}</select></label>
          <label className="text-sm font-semibold">Invitation style<select value={style} onChange={e=>setStyle(e.target.value as Style)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3">{Object.entries(styles).map(([key,v])=><option key={key} value={key}>{v.name}</option>)}</select></label>
          <label className="text-sm font-semibold sm:col-span-2">Event title<input value={eventName} onChange={e=>setEventName(e.target.value)} placeholder="e.g. Callie & Jordan’s Wedding" maxLength={120} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3"/></label>
          <label className="text-sm font-semibold">Host / celebrant name<input value={hostName} onChange={e=>setHostName(e.target.value)} placeholder="Name to print on invitation" maxLength={100} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3"/></label>
          <label className="text-sm font-semibold">Date<input type="date" min={new Date().toISOString().slice(0,10)} value={date} onChange={e=>setDate(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3"/></label>
          <label className="text-sm font-semibold">Start time<input type="time" value={time} onChange={e=>setTime(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3"/></label>
          <label className="text-sm font-semibold sm:col-span-2">Venue label<input value={venue} onChange={e=>setVenue(e.target.value)} placeholder="Venue name or address shared only with invited guests" maxLength={200} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3"/></label>
          <label className="text-sm font-semibold sm:col-span-2">Personal message<textarea value={message} onChange={e=>setMessage(e.target.value)} rows={3} maxLength={1000} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2"/></label>
        </div>
        <div className="rounded-xl border border-slate-200 p-4"><div className="mb-2 flex items-center gap-2"><Users className="h-4 w-4"/><h3 className="font-bold">Selected invitees</h3></div><p className="mb-3 text-xs leading-5 text-slate-500">Enter one guest per line as <code>Name, email@example.com</code>, or enter an email by itself. A separate private link is generated for each guest. Links expire after 30 days.</p><textarea value={guestsText} onChange={e=>setGuestsText(e.target.value)} rows={5} placeholder={"Jordan Lee, jordan@example.com\nTaylor Smith, taylor@example.com"} className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm"/><p className="mt-2 text-xs text-slate-500">{guestEmails.length} valid unique email address(es) detected.</p></div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-emerald-700"/><h3 className="font-bold">Private event pin</h3></div><p className="mt-1 text-sm leading-5 text-slate-600">Capture your device location while at the venue. These coordinates are saved in the private event record and never returned by the public map API.</p><button type="button" onClick={captureVenueLocation} disabled={capturingLocation} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold disabled:opacity-50"><Navigation className="h-4 w-4"/>{capturingLocation ? "Capturing location…" : privateLocation ? "Refresh private location" : "Capture venue location"}</button>{privateLocation && <p className="mt-2 text-xs font-semibold text-emerald-800">Private coordinates captured: {privateLocation.latitude.toFixed(5)}, {privateLocation.longitude.toFixed(5)}</p>}</div>
        <div className="flex flex-wrap gap-3"><button onClick={saveDraft} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white"><Check className="h-4 w-4"/> Save private draft</button><button onClick={copyPreview} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold"><Copy className="h-4 w-4"/>{copied?"Copied":"Copy invitation preview"}</button></div>
        {notice && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-950">{notice}</p>}
      </section>

      <aside className="space-y-4">
        <section className={`overflow-hidden rounded-3xl bg-gradient-to-br ${selected.shell} p-6 text-white shadow-xl`}><div className="flex items-center justify-between"><span className={`text-xs font-bold uppercase tracking-[.2em] ${selected.accent}`}>You’re invited</span><Sparkles className={`h-5 w-5 ${selected.accent}`}/></div><div className="my-8 border-y border-white/20 py-8 text-center"><p className={`text-sm ${selected.accent}`}>{selected.tagline}</p><h2 className="mt-3 text-3xl font-black leading-tight">{eventName || `${eventType} Celebration`}</h2><p className="mt-4 text-sm leading-6 text-white/85">{message}</p><p className="mt-6 font-bold">{hostName || "Your host"}</p></div><div className="space-y-3 text-sm"><p className="flex items-center gap-2"><CalendarDays className={`h-4 w-4 ${selected.accent}`}/>{date || "Date to be announced"} · {time}</p><p className="flex items-center gap-2"><Mail className={`h-4 w-4 ${selected.accent}`}/>{venue || "Venue details shared privately"}</p></div><div className={`mt-6 rounded-xl border border-white/20 bg-black/20 p-3 text-xs leading-5 ${selected.accent}`}><LockKeyhole className="mr-1 inline h-3.5 w-3.5"/> PRIVATE INVITE · No public event pin</div></section>
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-800"/><div><h3 className="font-extrabold text-emerald-950">Private by design</h3><p className="mt-1 text-sm leading-6 text-emerald-900">Venue coordinates are available only through a valid, unexpired invite token. Tokens are stored as hashes, not plaintext. Guests receive directions only on their invitation page.</p></div></div></section>
      </aside>
    </div>

    {inviteLinks.length > 0 && <section className="mt-6 rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm"><h2 className="text-xl font-black">Private event created</h2><p className="mt-2 text-sm leading-6 text-slate-600">Copy each unique link and send it only to the matching guest. Automatic email delivery is not configured, so these links are not sent for you.</p><div className="mt-4 space-y-3">{inviteLinks.map((invite) => <div key={invite.email} className="flex flex-col gap-2 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><p className="text-sm font-bold">{invite.email}</p><p className="break-all text-xs text-slate-500">{invite.url}</p><p className="mt-1 text-[10px] text-slate-400">Expires {new Date(invite.expiresAt).toLocaleDateString()}</p></div><button onClick={() => void copyInvite(invite.url)} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-bold text-white"><Copy className="h-4 w-4"/> Copy invite</button></div>)}</div></section>}

    <section className="mt-10" aria-labelledby="host-pricing-title">
      <div className="mb-5 max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-slate-500">Simple, one-time pricing</p><h2 id="host-pricing-title" className="mt-2 text-2xl font-black sm:text-3xl">Make the moment yours.</h2><p className="mt-2 text-sm leading-6 text-slate-600">Each package is a one-time payment. Stripe confirms payment before a package becomes available; a return-page redirect alone never counts as proof of payment.</p></div>
      <div className="grid gap-4 md:grid-cols-3">
        {hostPlans.map((plan) => {
          const isSelected = selectedPlan === plan.id
          const purchase = purchases.find((item) => item.tier === plan.id)
          return <article key={plan.id} className={`relative flex flex-col rounded-2xl border bg-white p-5 shadow-sm ${isSelected ? "border-slate-900 ring-2 ring-slate-900" : "border-slate-200"}`}>
            {plan.popular && <span className="absolute -top-3 right-4 rounded-full bg-[#B6FF38] px-3 py-1 text-[10px] font-black uppercase tracking-wide text-slate-950">Most popular</span>}
            <h3 className="text-lg font-extrabold">{plan.name}</h3><p className="mt-2 min-h-12 text-sm leading-5 text-slate-600">{plan.description}</p>
            <div className="mt-4"><span className="text-3xl font-black">{plan.price}</span><p className="mt-1 text-xs font-semibold text-slate-500">{plan.billing}</p></div>
            <ul className="my-5 flex-1 space-y-2 text-sm text-slate-700">{plan.features.map((feature) => <li key={feature} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700"/>{feature}</li>)}</ul>
            <button type="button" disabled={accountLoading || publishing} onClick={() => { setSelectedPlan(plan.id); if (!userId) setNotice("Sign in or create an account above to continue to secure checkout."); else if (purchase) void publishEvent(purchase, plan.id); else startCheckout(plan.id) }} className={`min-h-11 rounded-xl px-4 py-3 text-sm font-bold disabled:opacity-50 ${isSelected ? "bg-slate-900 text-white" : "border border-slate-300 text-slate-900 hover:bg-slate-50"}`}>
              {accountLoading ? "Loading account…" : !userId ? "Sign in to continue" : purchase ? (publishing ? "Publishing private event…" : "Publish private event") : "Pay securely with Stripe"}
            </button>
            {purchase && <p className="mt-2 text-center text-xs font-semibold text-emerald-800">Paid package verified · up to {purchase.guest_limit} guest(s)</p>}
          </article>
        })}
      </div>
      <p className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">Checkout is handled by Stripe. A successful payment creates one unused package, and the event is published only after you submit valid details and guest addresses. Invitation links are shown once for copying; store them safely.</p>
    </section>
  </div></main>
}
