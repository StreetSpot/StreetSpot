"use client"

import { useMemo, useState } from "react"
import { Bot, ChevronDown, LifeBuoy, Mail, MessageCircle, Send, X } from "lucide-react"

type Message = { role: "bot" | "user"; text: string }

const quickQuestions = [
  "How do I claim my business?",
  "Why is my location not showing?",
  "I need payment or subscription help",
  "How do I delete my account?",
  "How do private events work?",
]

function getAnswer(question: string) {
  const q = question.toLowerCase()
  if (/stripe|payment|paid|billing|subscription|charge|receipt|theme|premium|purchase|refund/.test(q)) return "For payment or subscription issues, keep your Stripe receipt and contact support@streetspotapp.com with the product name and checkout date. StreetSpot must verify payment before activating paid features. This chat cannot see your card details or confirm a charge."
  if (/claim|vendor|business|listing|ownership/.test(q)) return "Open the business or vendor listing and use its claim option if available. Claims may require review before ownership changes. If the claim button is missing or your claim is stuck, send the listing name and its map area to support@streetspotapp.com."
  if (/location|map|gps|nearby|position|pin/.test(q)) return "StreetSpot shows available listing coordinates first. Your device location is requested only when you choose a location feature and grant browser permission. Check device location permissions and reload if you chose Block earlier. StreetSpot does not run background GPS tracking."
  if (/delete|remove|privacy|data|account/.test(q)) return "Use https://streetspotapp.com/delete-account for available browser data cleanup, then contact support@streetspotapp.com for account or server-side deletion help. Clearing browser data does not automatically erase server-side records."
  if (/event|invite|private|guest|host|booking/.test(q)) return "StreetSpot can help people discover local events and places. Private invite-only event details should be shared only with invited guests. If an invitation or booking is missing, email support@streetspotapp.com with the event name and date."
  if (/message|chat|spam|contact/.test(q)) return "StreetSpot messaging may require mutual consent before a conversation opens. If a message thread is missing or you see abuse, avoid sharing sensitive information and report the issue to support@streetspotapp.com."
  if (/logo|icon|theme|brand|image/.test(q)) return "Theme Studio is at https://streetspotapp.com/themes. It lists optional branding offers. Do not pay if Stripe checkout is not available for the offer; paid branding should be enabled only after payment verification."
  if (/hello|hi\b|help|support/.test(q)) return "I’m StreetSpot’s automated support assistant, available here any time for common questions. I can guide you through listings, location, events, privacy, themes, and payment troubleshooting. For account-specific cases, I’ll point you to the support team."
  return "I don’t have a verified answer for that yet. The support team can review account-specific issues at support@streetspotapp.com. Include what you were doing, the page or listing name, and any error message. Never send passwords, card numbers, or verification codes."
}

export function SupportChatWidget() {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState("")
  const [messages, setMessages] = useState<Message[]>([{ role: "bot", text: "Hi! I’m StreetSpot’s automated support assistant. I’m available 24/7 for common questions. Choose a topic or type what you need help with." }])
  const suggested = useMemo(() => quickQuestions, [])

  function send(text = draft) {
    const clean = text.trim()
    if (!clean) return
    setMessages((current) => [...current, { role: "user", text: clean }, { role: "bot", text: getAnswer(clean) }])
    setDraft("")
  }

  return <div className="fixed bottom-4 right-4 z-[1000] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
    {open && <section aria-label="StreetSpot support chat" className="flex h-[min(580px,75dvh)] w-[min(370px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
      <header className="flex items-center gap-3 bg-primary px-4 py-3 text-primary-foreground">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15"><Bot className="h-5 w-5" /></div>
        <div className="min-w-0 flex-1"><p className="font-bold">StreetSpot Support</p><p className="text-xs opacity-90">Automated help · available 24/7</p></div>
        <button type="button" onClick={() => setOpen(false)} aria-label="Minimize support chat" className="rounded-lg p-2 hover:bg-white/15"><ChevronDown className="h-5 w-5" /></button>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close support chat" className="rounded-lg p-2 hover:bg-white/15"><X className="h-4 w-4" /></button>
      </header>
      <div aria-live="polite" className="flex-1 space-y-3 overflow-y-auto p-3">
        {messages.map((message, index) => <div key={`${index}-${message.role}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}><p className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-5 ${message.role === "user" ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-muted text-foreground"}`}>{message.text}</p></div>)}
        {messages.length === 1 && <div className="flex flex-wrap gap-2">{suggested.map((question) => <button key={question} type="button" onClick={() => send(question)} className="rounded-full border border-border px-3 py-2 text-left text-xs hover:bg-muted">{question}</button>)}</div>}
      </div>
      <div className="border-t border-border p-3">
        <form onSubmit={(event) => { event.preventDefault(); send() }} className="flex gap-2">
          <label htmlFor="streetspot-support-message" className="sr-only">Message StreetSpot Support</label>
          <input id="streetspot-support-message" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Type your question..." maxLength={1000} className="min-w-0 flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
          <button type="submit" disabled={!draft.trim()} aria-label="Send message" className="rounded-xl bg-primary px-3 text-primary-foreground disabled:opacity-40"><Send className="h-4 w-4" /></button>
        </form>
        <a href="mailto:support@streetspotapp.com?subject=StreetSpot%20Support%20Request" className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground underline underline-offset-4"><Mail className="h-3.5 w-3.5" /> Email support for account-specific help</a>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">Automated guidance, not live human chat. Never send passwords or card details.</p>
      </div>
    </section>}
    <button type="button" onClick={() => setOpen((value) => !value)} aria-label={open ? "Close support chat" : "Open 24/7 support chat"} aria-expanded={open} className="flex items-center gap-2 rounded-full bg-primary px-4 py-3 font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-[1.02]">
      {open ? <X className="h-5 w-5" /> : <><MessageCircle className="h-5 w-5" /><span>24/7 Support</span><LifeBuoy className="h-4 w-4 opacity-80" /></>}
    </button>
  </div>
}