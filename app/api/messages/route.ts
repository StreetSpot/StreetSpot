import { NextRequest } from "next/server"
import { errorResponse, requireUser, supabaseFetch } from "@/lib/supabase-admin"

const id = (value: string) => encodeURIComponent(value)
const safeId = (value: string) => /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(value)

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request)
    const conversationId = request.nextUrl.searchParams.get("conversationId")
    if (conversationId && !safeId(conversationId)) return Response.json({ ok: false, code: "INVALID_CONVERSATION_ID" }, { status: 400 })
    const query = conversationId
      ? `messages?conversation_id=eq.${id(conversationId)}&or=(sender_id.eq.${id(user.id)},recipient_id.eq.${id(user.id)})&select=*&order=created_at.asc`
      : `messages?or=(sender_id.eq.${id(user.id)},recipient_id.eq.${id(user.id)})&select=*&order=created_at.desc&limit=100`
    const messages = await supabaseFetch<unknown[]>(query)
    if (conversationId) {
      await supabaseFetch(`messages?conversation_id=eq.${id(conversationId)}&recipient_id=eq.${id(user.id)}&read_at=is.null`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ read_at: new Date().toISOString() }) })
    }
    return Response.json({ ok: true, messages })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request)
    let body: Record<string, unknown>
    try {
      const value: unknown = await request.json()
      if (!value || typeof value !== "object" || Array.isArray(value)) return Response.json({ ok: false, code: "INVALID_JSON" }, { status: 400 })
      body = value as Record<string, unknown>
    } catch { return Response.json({ ok: false, code: "INVALID_JSON" }, { status: 400 }) }
    const conversationId = typeof body.conversationId === "string" ? body.conversationId : ""
    const recipientId = typeof body.recipientId === "string" ? body.recipientId : ""
    const content = typeof body.content === "string" ? body.content.trim() : ""
    if (!safeId(conversationId) || !safeId(recipientId) || !content || content.length > 5000 || recipientId === user.id) return Response.json({ ok: false, code: "INVALID_MESSAGE" }, { status: 400 })
    const conversation = await supabaseFetch<Record<string, unknown>[]>(`conversations?id=eq.${id(conversationId)}&select=*&limit=1`)
    if (!conversation.length) return Response.json({ ok: false, code: "CONVERSATION_NOT_FOUND" }, { status: 404 })
    const participantFields = Object.entries(conversation[0])
      .filter(([key]) => /(?:participant|member|sender|recipient|customer|owner|user).*?(?:id|ids)$/i.test(key))
      .map(([, value]) => value)
      .flatMap((value) => Array.isArray(value) ? value : [value])
      .filter((value): value is string => typeof value === "string")
    if (!participantFields.includes(user.id) || !participantFields.includes(recipientId)) {
      return Response.json({ ok: false, code: "CONVERSATION_ACCESS_DENIED" }, { status: 403 })
    }
    const rows = await supabaseFetch<unknown[]>("messages", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify({ conversation_id: conversationId, sender_id: user.id, recipient_id: recipientId, content }) })
    await supabaseFetch(`conversations?id=eq.${id(conversationId)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ updated_at: new Date().toISOString(), last_message_at: new Date().toISOString() }) })
    return Response.json({ ok: true, message: rows?.[0] ?? null }, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}
