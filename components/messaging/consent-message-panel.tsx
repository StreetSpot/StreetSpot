"use client"

import { useState } from "react"
import { MessageCircle, Shield, Send } from "lucide-react"
import {
  messageStore,
  useConversations,
  useMessages,
} from "@/lib/message-store"

interface ConsentMessagePanelProps {
  vendorId: string
  vendorName: string
}

/** Customer-side: request consent + chat once granted */
export function ConsentMessagePanel({
  vendorId,
  vendorName,
}: ConsentMessagePanelProps) {
  const conversations = useConversations()
  const allMessages = useMessages()
  const [customerName, setCustomerName] = useState("")
  const [body, setBody] = useState("")
  const [reply, setReply] = useState("")
  const [sent, setSent] = useState(false)

  const existing = conversations.find((c) => c.vendorId === vendorId)
  const msgs = existing
    ? allMessages.filter((m) => m.conversationId === existing.id)
    : []

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

    setBody("")
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  function handleSendReply() {
    if (!existing || !reply.trim() || !existing.consentGiven) return
    messageStore.sendMessage({
      conversationId: existing.id,
      fromName: existing.customerName,
      toName: vendorName,
      body: reply.trim(),
    })
    setReply("")
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <MessageCircle className="h-3.5 w-3.5" />
        Message {vendorName}
      </h3>

      <div className="mb-3 flex items-start gap-2 rounded-lg bg-secondary px-2.5 py-2">
        <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Mutual consent required. Vendor must approve before chat opens.
        </p>
      </div>

      {existing?.consentGiven ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-emerald-400">Chat open</p>
          {msgs.length > 0 && (
            <div className="max-h-28 space-y-1 overflow-y-auto">
              {msgs.map((m) => (
                <p
                  key={m.id}
                  className="rounded bg-secondary px-2 py-1 text-[11px] text-foreground"
                >
                  <span className="font-medium text-muted-foreground">
                    {m.fromName}:
                  </span>{" "}
                  {m.body}
                </p>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type a message..."
              className="h-9 flex-1 rounded-lg border border-border bg-input px-3 text-xs"
            />
            <button
              onClick={handleSendReply}
              className="flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-primary-foreground"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : existing ? (
        <p className="text-xs text-amber-400">
          Request sent as {existing.customerName}. Waiting for vendor approval.
        </p>
      ) : (
        <form onSubmit={handleRequestConsent} className="flex flex-col gap-2">
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Your name"
            className="h-9 w-full rounded-lg border border-border bg-input px-3 text-xs"
            required
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Optional first message..."
            rows={2}
            className="w-full resize-none rounded-lg border border-border bg-input px-3 py-2 text-xs"
          />
          <button
            type="submit"
            className="flex h-9 w-full items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground"
          >
            {sent ? "Request sent!" : "Request to message"}
          </button>
        </form>
      )}
    </div>
  )
}
