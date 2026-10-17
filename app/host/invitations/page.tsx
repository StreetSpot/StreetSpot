"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowLeft, CalendarDays, Check, Copy, LockKeyhole, Mail, PartyPopper, Palette, ShieldCheck, Sparkles, Users } from "lucide-react"

type Style = "elegant" | "celebration" | "street"
const styles: Record<Style, { name: string; tagline: string; shell: string; accent: string }> = {
  elegant: { name: "Elegant", tagline: "A day to remember", shell: "from-stone-900 via-stone-800 to-amber-950", accent: "text-amber-200" },
  celebration: { name: "Celebration", tagline: "Let’s make a memory", shell: "from-fuchsia-800 via-violet-800 to-indigo-950", accent: "text-pink-200" },
  street: { name: "StreetSpot", tagline: "Your people. Your moment.", shell: "from-[#111116] via-[#1b1922] to-[#111116]", accent: "text-[#B6FF38]" },
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
  const [guestsText, setGuestsText] = useState("")
  const [notice, setNotice] = useState("")
  const [copied, setCopied] = useState(false)
  const guestCount = useMemo(() => guestsText.split(/\r?\n/).filter(line => line.includes("@") && line.trim()).length, [guestsText])
  const selected = styles[style]
  function saveDraft() {
    localStorage.setItem("streetspot_private_invitation_draft", JSON.stringify({ eventType, eventName, hostName, date, time, venue, message, style, guestsText, savedAt: new Date().toISOString() }))
    setNotice("Private invitation draft saved on this device only. No guests were invited and no map pin was published.")
  }
  async function copyPreview() {
    const text = `${eventName || `${eventType} Celebration`}\n${message}\nHosted by ${hostName || "Your host"}\n${date || "Date to be announced"} at ${time}\n${venue || "Venue shared privately with invited guests"}\n\nPrivate invitation draft. The event is not published.`
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { setNotice(text) }
  }
  return <main className="min-h-dvh bg-[#f6f7f2] px-4 py-8 text-slate-900 sm:px-6"><div className="mx-auto max-w-6xl">
    <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600"><ArrowLeft className="h-4 w-4"/> Back to StreetSpot</Link>
    <div className="mb-8 flex items-start gap-3"><div className="rounded-2xl bg-slate-900 p-3 text-[#B6FF38]"><LockKeyhole className="h-6 w-6"/></div><div><p className="text-xs font-bold uppercase tracking-[.2em] text-slate-500">Private Host Studio</p><h1 className="mt-1 text-3xl font-black sm:text-4xl">Invitations that stay in your circle.</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Design wedding, graduation, birthday, family, and private-party invitations with guest names and a chosen look. Private pins must never be publicly listed.</p></div></div>
    <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
      <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center gap-2"><PartyPopper className="h-5 w-5 text-fuchsia-700"/><h2 className="text-lg font-extrabold">Invitation creator</h2></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold">Occasion<select value={eventType} onChange={e=>setEventType(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3">{["Wedding","Graduation","Birthday","Baby Shower","Anniversary","Family Gathering","Private Party","Other"].map(v=><option key={v}>{v}</option>)}</select></label>
          <label className="text-sm font-semibold">Invitation style<select value={style} onChange={e=>setStyle(e.target.value as Style)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3">{Object.entries(styles).map(([key,v])=><option key={key} value={key}>{v.name}</option>)}</select></label>
          <label className="text-sm font-semibold sm:col-span-2">Event title<input value={eventName} onChange={e=>setEventName(e.target.value)} placeholder="e.g. Callie & Jordan’s Wedding" maxLength={100} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3"/></label>
          <label className="text-sm font-semibold">Host / celebrant name<input value={hostName} onChange={e=>setHostName(e.target.value)} placeholder="Name to print on invitation" maxLength={80} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3"/></label>
          <label className="text-sm font-semibold">Date<input type="date" value={date} onChange={e=>setDate(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3"/></label>
          <label className="text-sm font-semibold">Start time<input type="time" value={time} onChange={e=>setTime(e.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3"/></label>
          <label className="text-sm font-semibold">Venue label<input value={venue} onChange={e=>setVenue(e.target.value)} placeholder="Address shared privately with guests" maxLength={180} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3"/></label>
          <label className="text-sm font-semibold sm:col-span-2">Personal message<textarea value={message} onChange={e=>setMessage(e.target.value)} rows={3} maxLength={500} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2"/></label>
        </div>
        <div className="rounded-xl border border-slate-200 p-4"><div className="mb-2 flex items-center gap-2"><Users className="h-4 w-4"/><h3 className="font-bold">Selected invitees</h3></div><p className="mb-3 text-xs leading-5 text-slate-500">Enter one guest per line as <code>Name, email@example.com</code>. Only addresses selected by the host belong on the invitation list.</p><textarea value={guestsText} onChange={e=>setGuestsText(e.target.value)} rows={5} placeholder={'Jordan Lee, jordan@example.com\nTaylor Smith, taylor@example.com'} className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm"/><p className="mt-2 text-xs text-slate-500">{guestCount} email address(es) detected. This draft does not send invitations.</p></div>
        <div className="flex flex-wrap gap-3"><button onClick={saveDraft} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white"><Check className="h-4 w-4"/> Save private draft</button><button onClick={copyPreview} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold"><Copy className="h-4 w-4"/>{copied?"Copied":"Copy invitation text"}</button></div>
        {notice && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-900">{notice}</p>}
      </section>
      <aside className="space-y-4"><section className={`overflow-hidden rounded-3xl bg-gradient-to-br ${selected.shell} p-6 text-white shadow-xl`}><div className="flex items-center justify-between"><span className={`text-xs font-bold uppercase tracking-[.2em] ${selected.accent}`}>You’re invited</span><Sparkles className={`h-5 w-5 ${selected.accent}`}/></div><div className="my-8 border-y border-white/20 py-8 text-center"><p className={`text-sm ${selected.accent}`}>{selected.tagline}</p><h2 className="mt-3 text-3xl font-black leading-tight">{eventName || `${eventType} Celebration`}</h2><p className="mt-4 text-sm leading-6 text-white/85">{message}</p><p className="mt-6 font-bold">{hostName || "Your host"}</p></div><div className="space-y-3 text-sm"><p className="flex items-center gap-2"><CalendarDays className={`h-4 w-4 ${selected.accent}`}/>{date || "Date to be announced"} · {time}</p><p className="flex items-center gap-2"><Mail className={`h-4 w-4 ${selected.accent}`}/>{venue || "Venue details shared privately"}</p></div><div className={`mt-6 rounded-xl border border-white/20 bg-black/20 p-3 text-xs leading-5 ${selected.accent}`}><LockKeyhole className="mr-1 inline h-3.5 w-3.5"/> PRIVATE INVITE · No public event pin</div></section>
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-800"/><div><h3 className="font-extrabold text-emerald-950">Privacy must be enforced on the server</h3><p className="mt-1 text-sm leading-6 text-emerald-900">A hidden icon is not access control. Production must keep private coordinates out of public map APIs and verify each guest’s signed-in email against the host’s invite list before returning the pin or venue.</p></div></div></section>
      <section className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center gap-2"><Palette className="h-4 w-4"/><h3 className="font-bold">What this draft does</h3></div><ul className="mt-3 space-y-2 text-sm text-slate-600"><li>✓ Personalize occasion, names, date, time, venue label, and message</li><li>✓ Preview three invitation looks</li><li>✓ Save draft on this device and copy invitation text</li><li>○ Send verified private invitations and create guest-only map pins: backend/authentication not yet connected</li></ul></section></aside>
    </div>
  </div></main>
}
