import { NextRequest } from "next/server"
import { errorResponse, requireUser, supabaseFetch } from "@/lib/supabase-admin"

const id = (value: string) => encodeURIComponent(value)

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request)
    const conversationId = request.nextUrl.searchParams.get("conversationId")
    const query = conversationId
      ? `messages?conversation_id=eq.${id(conversationId)}&select=*&order=created_at.asc`
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
    const body = await request.json()
    const conversationId = typeof body.conversationId === "string" ? body.conversationId : ""
    const recipientId = typeof body.recipientId === "string" ? body.recipientId : ""
    const content = typeof body.content === "string" ? body.content.trim() : ""
    if (!conversationId || !recipientId || !content || content.length > 5000 || recipientId === user.id) return Response.json({ ok: false, code: "INVALID_MESSAGE" }, { status: 400 })
    const rows = await supabaseFetch<unknown[]>("messages", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify({ conversation_id: conversationId, sender_id: user.id, recipient_id: recipientId, content }) })
    await supabaseFetch(`conversations?id=eq.${id(conversationId)}`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ updated_at: new Date().toISOString(), last_message_at: new Date().toISOString() }) })
    return Response.json({ ok: true, message: rows?.[0] ?? null }, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}
