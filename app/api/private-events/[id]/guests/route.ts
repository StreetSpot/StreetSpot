import { NextRequest, NextResponse } from "next/server"
import { errorResponse, requireUser, supabaseFetch, supabaseServiceFetch } from "@/lib/supabase-admin"
export const dynamic = "force-dynamic"
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function verifyDraft(eventId: string, userId: string, accessToken: string) {
  const rows = await supabaseFetch<Array<{ id: string; status: string }>>(
    `private_events?id=eq.${encodeURIComponent(eventId)}&host_id=eq.${encodeURIComponent(userId)}&select=id,status&limit=1`, {}, accessToken,
  )
  return rows[0] ?? null
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request)
    const { id } = await context.params
    if (!uuid.test(id)) return NextResponse.json({ ok: false, error: "Invalid event id." }, { status: 400 })
    const event = await verifyDraft(id, user.id, user.accessToken)
    if (!event) return NextResponse.json({ ok: false, error: "Event not found." }, { status: 404 })
    const drafts = await supabaseServiceFetch<Array<{ emails: string[] }>>(
      `private_event_guest_drafts?event_id=eq.${encodeURIComponent(id)}&user_id=eq.${encodeURIComponent(user.id)}&select=emails&limit=1`,
    )
    return NextResponse.json({ ok: true, emails: drafts[0]?.emails ?? [] }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) { return errorResponse(error) }
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request)
    const { id } = await context.params
    if (!uuid.test(id)) return NextResponse.json({ ok: false, error: "Invalid event id." }, { status: 400 })
    const body = await request.json().catch(() => null) as { emails?: unknown; plan?: unknown } | null
    if (!Array.isArray(body?.emails) || body.emails.length > 200) return NextResponse.json({ ok: false, error: "Send a guest email list with no more than 200 addresses." }, { status: 400 })
    const emails = [...new Set(body.emails.filter((value): value is string => typeof value === "string").map(value => value.trim().toLowerCase()))]
    if (emails.some(email => !emailPattern.test(email) || email.length > 254)) return NextResponse.json({ ok: false, error: "One or more guest email addresses are invalid." }, { status: 400 })
    const plan = typeof body.plan === "string" ? body.plan : ""
    const limit = plan === "invite" ? 1 : plan === "hosted" ? 50 : plan === "signature" ? 200 : 200
    if (emails.length > limit) return NextResponse.json({ ok: false, error: `The selected package allows up to ${limit} guest(s).` }, { status: 400 })
    const event = await verifyDraft(id, user.id, user.accessToken)
    if (!event || event.status !== "draft") return NextResponse.json({ ok: false, error: "Only your own unpublished event draft can store a guest list." }, { status: 404 })
    await supabaseServiceFetch("private_event_guest_drafts?on_conflict=event_id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ event_id: id, user_id: user.id, emails, updated_at: new Date().toISOString() }),
    })
    return NextResponse.json({ ok: true, count: emails.length }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) { return errorResponse(error) }
}
