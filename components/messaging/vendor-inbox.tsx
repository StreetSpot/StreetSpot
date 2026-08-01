"use client"

import { useState } from "react"
import { MessageCircle, Shield, Check, Send } from "lucide-react"
import {
  messageStore,
  useConversations,
  useMessages,
} from "@/lib/message-store"

interface VendorInboxProps {
  vendorId: string
  vendorName: string
}

/** Vendor-side: grant consent + reply once both parties agree */
export function VendorInbox({ vendorId, vendorName }: VendorInboxProps) {
  const conversations = useConversations()
  const allMessages = useMessages()
  const [replyBody, setReplyBody] = useState("")
  const [activeId, setActiveId] = useState<string | null>(null)

  const mine = conversations.filter((c) => c.vendorId === vendorId)

  function handleGrant(id: string) {
    messageStore.grantConsent(id)
  }

  function handleReply(convId: string, customerName: string) {
    if (!replyBody.trim()) return
    messageStore.sendMessage({
      conversationId: convId,
      fromName: vendorName,
      toName: customerName,
      body: replyBody.trim(),
    })
    setReplyBody("")
  }

  return (
    <div className="mb-6 rounded-xl border border-border bg-card p-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <MessageCircle className="h-4 w-4" />
        Messages
      </h3>

      <div className="mb-4 flex items-start gap-2 rounded-lg bg-secondary px-3 py-2.5">
        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Customers can request to message you. You must grant consent before
          either side can chat. No spam — mutual agreement only.
        </p>
      </div>

      {mine.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No message requests yet. When a customer requests contact, it shows
          up here.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {mine.map((conv) => {
            const msgs = allMessages.filter(
              (m) => m.conversationId === conv.id
            )
            const isOpen = activeId === conv.id
            return (
              <div
                key={conv.id}
                className="rounded-lg border border-border bg-secondary/50 p-3"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {conv.customerName}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {conv.consentGiven
                        ? "Consent granted — chat open"
                        : "Waiting for your consent"}
                    </p>
                  </div>
                  {!conv.consentGiven ? (
                    <button
                      onClick={() => handleGrant(conv.id)}
                      className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                    >
                      <Check className="h-3 w-3" />
                      Grant
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveId(isOpen ? null : conv.id)}
                      className="text-xs font-medium text-primary"
                    >
                      {isOpen ? "Hide" : "Open chat"}
                    </button>
                  )}
                </div>

                {msgs.length > 0 && (
                  <div className="mb-2 max-h-32 space-y-1 overflow-y-auto">
                    {msgs.map((m) => (
                      <p
                        key={m.id}
                        className="rounded bg-background/60 px-2 py-1 text-xs text-foreground"
                      >
                        <span className="font-medium text-muted-foreground">
                          {m.fromName}:
                        </span>{" "}
                        {m.body}
                      </p>
                    ))}
                  </div>
                )}

                {conv.consentGiven && isOpen && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      placeholder="Reply..."
                      className="h-9 flex-1 rounded-lg border border-border bg-input px-3 text-xs"
                    />
                    <button
                      onClick={() => handleReply(conv.id, conv.customerName)}
                      className="flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-primary-foreground"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
