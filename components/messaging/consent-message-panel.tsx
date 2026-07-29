"use client"

import { useState } from "react"
import { MessageCircle, Shield } from "lucide-react"
import { messageStore, useConversations } from "@/lib/message-store"

interface ConsentMessagePanelProps {
  vendorId: string
  vendorName: string
}

export function ConsentMessagePanel({
  vendorId,
  vendorName,
}: ConsentMessagePanelProps) {
  const conversations = useConversations()
  const [customerName, setCustomerName] = useState("")
  const [body, setBody] = useState("")
  const [sent, setSent] = useState(false)

  const existing = conversations.find((c) => c.vendorId === vendorId)

  function handleRequestConsent(e: React.FormEvent) {
    e.preventDefault()
    if (!customerName.trim()) return

    const conv = messageStore.createConversation({
      vendorId,
      vendorName,
      customerName: customerName.trim(),
    })

    if (body.trim()) {
      messageStore.sendMessage({
        conversationId: conv.id,
        fromName: customerName.trim(),
        toName: vendorName,
        body: body.trim(),
      })
    }

    setCustomerName("")
    setBody("")
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  function handleGrantConsent() {
    if (existing) messageStore.grantConsent(existing.id)
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <MessageCircle className="h-4 w-4" />
        Messages
      </h3>

      <div className="mb-4 flex items-start gap-2 rounded-lg bg-secondary px-3 py-2.5">
        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Messaging requires mutual consent. Both parties must agree before a
          conversation is opened.
        </p>
      </div>

      {existing?.consentGiven ? (
        <p className="text-sm text-emerald-400">
          Consent granted. Conversation is open with {existing.customerName}.
        </p>
      ) : existing ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-foreground">
            Pending consent from {existing.customerName}
          </p>
          <button
            onClick={handleGrantConsent}
            className="flex h-10 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Grant Consent
          </button>
        </div>
      ) : (
        <form onSubmit={handleRequestConsent} className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">
              Your Name
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Name"
              className="h-10 w-full rounded-lg border border-border bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">
              Message (optional)
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Hi, I have a question..."
              rows={2}
              className="w-full resize-none rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="flex h-10 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            {sent ? "Request Sent!" : "Request to Message"}
          </button>
        </form>
      )}
    </div>
  )
}
