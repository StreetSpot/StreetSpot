import { createHash, randomBytes } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { errorResponse, requireUser, supabaseFetch, supabaseServiceFetch } from "@/lib/supabase-admin"
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request)
    const { id } = await context.params
    if (!uuid.test(id)) return NextResponse.json({ ok: false, error: "Invalid event id." }, { status: 400 })
    const body = await request.json().catch(() => null) as { emails?: unknown } | null
    if (!Array.isArray(body?.emails) || body.emails.length < 1 || body.emails.length > 200) {
      return NextResponse.json({ ok: false, error: "Add between 1 and 200 guest email addresses." }, { status: 400 })
    }
    const emails = [...new Set(body.emails.filter((value): value is string => typeof value === "string").map(value => value.trim().toLowerCase()))]
    if (!emails.length || emails.some(email => !emailPattern.test(email) || email.length > 254)) {
      return NextResponse.json({ ok: false, error: "One or more guest email addresses are invalid." }, { status: 400 })
    }

    const events = await supabaseFetch<Array<{ id: string; status: string; starts_at: string }>>(
      `private_events?id=eq.${encodeURIComponent(id)}&host_id=eq.${encodeURIComponent(user.id)}&select=id,status,starts_at&limit=1`, {}, user.accessToken,
    )
    const event = events[0]
    if (!event) return NextResponse.json({ ok: false, error: "Event not found." }, { status: 404 })
    if (event.status !== "published") return NextResponse.json({ ok: false, error: "Publish the paid event before creating guest invitations." }, { status: 409 })
    if (Date.parse(event.starts_at) <= Date.now()) return NextResponse.json({ ok: false, error: "Past events cannot receive new invitations." }, { status: 400 })

    const purchases = await supabaseServiceFetch<Array<{ tier: string; status: string; guest_limit: number }>>(
      `event_hosting_purchases?event_id=eq.${encodeURIComponent(id)}&user_id=eq.${encodeURIComponent(user.id)}&status=eq.paid&select=tier,status,guest_limit&limit=1`,
    )
    const purchase = purchases[0]
    if (!purchase) return NextResponse.json({ ok: false, error: "A confirmed event-hosting payment is required." }, { status: 402 })

    const existing = await supabaseFetch<Array<{ id: string; invited_email: string; status: string }>>(
      `private_event_invites?event_id=eq.${encodeURIComponent(id)}&select=id,invited_email,status`, {}, user.accessToken,
    )
    const existingByEmail = new Map(existing.map(invite => [invite.invited_email.toLowerCase(), invite]))
    const activeCount = existing.filter(invite => invite.status === "invited" || invite.status === "accepted").length
    const newEmails = emails.filter(email => !existingByEmail.has(email))
    const reissueEmails = emails.filter(email => {
      const invite = existingByEmail.get(email)
      return invite?.status === "invited" || invite?.status === "revoked" || invite?.status === "declined"
    })
    const alreadyAccepted = emails.filter(email => existingByEmail.get(email)?.status === "accepted")
    if (!newEmails.length && !reissueEmails.length) {
      return NextResponse.json({ ok: true, invites: [], message: alreadyAccepted.length ? "Those guests have already accepted their invitations." : "No new invitation links were needed." })
    }
    if (activeCount + newEmails.length > purchase.guest_limit) {
      return NextResponse.json({ ok: false, error: `This package allows ${purchase.guest_limit} guests; ${activeCount} are already invited.` }, { status: 400 })
    }

    const expiresAt = new Date(Date.parse(event.starts_at) + 86400000).toISOString()
    const prepared = [...new Set([...newEmails, ...reissueEmails])].map(email => {
      const token = randomBytes(32).toString("base64url")
      return { email, token, tokenHash: createHash("sha256").update(token).digest("hex"), existing: existingByEmail.get(email) }
    })
    const created: string[] = []
    for (const item of prepared) {
      if (item.existing) {
        await supabaseFetch(`private_event_invites?id=eq.${encodeURIComponent(item.existing.id)}`, {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({ token_hash: item.tokenHash, status: "invited", invited_user_id: null, expires_at: expiresAt }),
        }, user.accessToken)
        created.push(item.email)
      } else {
        await supabaseFetch("private_event_invites", {
          method: "POST",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({ event_id: id, invited_email: item.email, token_hash: item.tokenHash, status: "invited", expires_at: expiresAt }),
        }, user.accessToken)
        created.push(item.email)
      }
    }
    const inviteLinks = prepared.filter(item => created.includes(item.email)).map(item => ({
      email: item.email,
      url: `https://streetspotapp.com/event-invite?token=${encodeURIComponent(item.token)}`,
    }))
    return NextResponse.json({ ok: true, invites: inviteLinks, expiresAt, alreadyAccepted }, { status: 201, headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } })
  } catch (error) {
    return errorResponse(error)
  }
}
