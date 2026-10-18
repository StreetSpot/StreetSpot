import { createHash, randomBytes } from "node:crypto"
import { NextRequest } from "next/server"
import { errorResponse, requireUser, supabaseFetch } from "@/lib/supabase-admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const EVENT_TYPES = new Set(["Wedding", "Graduation", "Birthday", "Baby Shower", "Anniversary", "Family Gathering", "Private Party", "Other"])
const STYLES = new Set(["elegant", "celebration", "street"])
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const encode = (value: string) => encodeURIComponent(value)

type Purchase = {
  id: string
  tier: "invite" | "hosted" | "signature"
  status: string
  guest_limit: number
  event_id: string | null
}

type CreatedEvent = { id: string; title: string; starts_at: string; venue_label: string }

export async function POST(request: NextRequest) {
  let createdEventId: string | null = null
  let purchaseId: string | null = null
  try {
    const user = await requireUser(request)
    const body = await request.json().catch(() => null) as Record<string, unknown> | null
    if (!body) return Response.json({ ok: false, code: "INVALID_JSON" }, { status: 400 })

    const requestedPurchaseId = typeof body.purchaseId === "string" ? body.purchaseId : ""
    const title = typeof body.title === "string" ? body.title.trim() : ""
    const eventType = typeof body.eventType === "string" ? body.eventType : ""
    const hostName = typeof body.hostName === "string" ? body.hostName.trim() : ""
    const startsAt = typeof body.startsAt === "string" ? body.startsAt : ""
    const venueLabel = typeof body.venueLabel === "string" ? body.venueLabel.trim() : ""
    const latitude = body.latitude
    const longitude = body.longitude
    const invitationStyle = typeof body.invitationStyle === "string" ? body.invitationStyle : "celebration"
    const invitationMessage = typeof body.invitationMessage === "string" ? body.invitationMessage.trim() : ""
    const guestEmails = Array.isArray(body.guestEmails)
      ? [...new Set(body.guestEmails.filter((value): value is string => typeof value === "string").map((value) => value.trim().toLowerCase()).filter(Boolean))]
      : []

    if (!UUID.test(requestedPurchaseId) || !title || title.length > 120 || !EVENT_TYPES.has(eventType) ||
        hostName.length > 100 || !venueLabel || venueLabel.length > 200 ||
        !startsAt || !Number.isFinite(Date.parse(startsAt)) || Date.parse(startsAt) <= Date.now() ||
        typeof latitude !== "number" || !Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
        typeof longitude !== "number" || !Number.isFinite(longitude) || longitude < -180 || longitude > 180 ||
        !STYLES.has(invitationStyle) || invitationMessage.length > 1000 ||
        guestEmails.length < 1 || guestEmails.some((email) => email.length > 254 || !EMAIL.test(email))) {
      return Response.json({ ok: false, code: "INVALID_EVENT_DETAILS", message: "Check the event details, future date, location permission, and at least one valid guest email." }, { status: 400 })
    }

    const purchases = await supabaseFetch<Purchase[]>(
      `event_hosting_purchases?id=eq.${encode(requestedPurchaseId)}&user_id=eq.${encode(user.id)}&event_id=is.null&status=eq.paid&select=id,tier,status,guest_limit,event_id&limit=1`
    )
    const purchase = purchases[0]
    if (!purchase) return Response.json({ ok: false, code: "PAID_PACKAGE_NOT_AVAILABLE", message: "No unused paid package was found for this account. Complete checkout first or refresh this page." }, { status: 402 })
    purchaseId = purchase.id
    if (guestEmails.length > purchase.guest_limit) {
      return Response.json({ ok: false, code: "GUEST_LIMIT_EXCEEDED", message: `This package allows up to ${purchase.guest_limit} invited guest(s).` }, { status: 400 })
    }

    const events = await supabaseFetch<CreatedEvent[]>("private_events", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        host_id: user.id, title, event_type: eventType, host_name: hostName,
        starts_at: new Date(startsAt).toISOString(), venue_label: venueLabel,
        latitude, longitude, invitation_style: invitationStyle,
        invitation_message: invitationMessage, status: "published", is_private: true,
      }),
    })
    const event = events[0]
    if (!event?.id) throw new Error("Private event could not be created")
    createdEventId = event.id

    const linked = await supabaseFetch<{ id: string }[]>(
      `event_hosting_purchases?id=eq.${encode(purchase.id)}&user_id=eq.${encode(user.id)}&event_id=is.null&status=eq.paid`,
      { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ event_id: event.id, updated_at: new Date().toISOString() }) }
    )
    if (!linked.length) throw new Error("Paid package was already used")

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    const invitations = guestEmails.map((email) => {
      const token = randomBytes(32).toString("base64url")
      return { invited_email: email, token, token_hash: createHash("sha256").update(token).digest("hex") }
    })
    await supabaseFetch("private_event_invites", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(invitations.map((invite) => ({
        event_id: event.id, invited_email: invite.invited_email,
        token_hash: invite.token_hash, expires_at: expiresAt,
      }))),
    })

    const origin = new URL(request.url).origin
    return Response.json({
      ok: true,
      event: { id: event.id, title: event.title, startsAt: event.starts_at, venueLabel: event.venue_label, isPrivate: true },
      inviteLinks: invitations.map((invite) => ({ email: invite.invited_email, url: `${origin}/host/invite/${invite.token}`, expiresAt })),
      message: "Private event created. Share each invite link only with its selected guest; email delivery is not configured.",
    }, { status: 201, headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    if (createdEventId) {
      try {
        await supabaseFetch(`private_event_invites?event_id=eq.${encode(createdEventId)}`, { method: "DELETE" })
        await supabaseFetch(`private_events?id=eq.${encode(createdEventId)}`, { method: "DELETE" })
        if (purchaseId) {
          await supabaseFetch(`event_hosting_purchases?id=eq.${encode(purchaseId)}&event_id=eq.${encode(createdEventId)}`, {
            method: "PATCH", body: JSON.stringify({ event_id: null, updated_at: new Date().toISOString() }),
          })
        }
      } catch { /* Leave the original error visible without exposing database details. */ }
    }
    return errorResponse(error)
  }
}
