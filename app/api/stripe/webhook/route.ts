import { createHmac, timingSafeEqual } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { supabaseServiceFetch } from "@/lib/supabase-admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type StripeEvent = {
  id?: unknown
  type?: unknown
  data?: { object?: Record<string, unknown> }
}

const knownPaymentLinks: Record<string, string> = {
  plink_1UReP2RqYQhupz6BuQnGOn2V: "vendor_bronze",
  plink_1UReP4RqYQhupz6BwvCYpcdE: "vendor_silver",
  plink_1URePARqYQhupz6BmO5D5JfN: "vendor_gold",
  plink_1UReNwRqYQhupz6B9xJdRtRz: "theme_street_style",
  plink_1UReNyRqYQhupz6B9eqVW6cH: "theme_creator",
  plink_1UReO0RqYQhupz6BkTD1VR1x: "theme_brand_studio",
  plink_1URgFxRqYQhupz6BILuhiyCw: "event_hosting_invite",
  plink_1URgG0RqYQhupz6Bf1xvQVwK: "event_hosting_hosted",
  plink_1URgG5RqYQhupz6B4wtYg0cj: "event_hosting_signature",
}
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function safeEqualHex(left: string, right: string) {
  if (!/^[a-f0-9]{64}$/i.test(left) || !/^[a-f0-9]{64}$/i.test(right)) return false
  const a = Buffer.from(left, "hex")
  const b = Buffer.from(right, "hex")
  return a.length === b.length && timingSafeEqual(a, b)
}

function verifyStripeSignature(rawBody: string, header: string, secret: string) {
  const values = header.split(",").map((item) => item.trim())
  const timestamp = values.find((item) => item.startsWith("t="))?.slice(2)
  const signatures = values.filter((item) => item.startsWith("v1=")).map((item) => item.slice(3))
  if (!timestamp || !/^\d+$/.test(timestamp) || signatures.length === 0) return false
  const seconds = Number(timestamp)
  if (!Number.isFinite(seconds) || Math.abs(Date.now() / 1000 - seconds) > 300) return false
  const expected = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex")
  return signatures.some((signature) => safeEqualHex(signature, expected))
}

function objectId(value: unknown): string | null {
  if (typeof value === "string") return value
  if (value && typeof value === "object" && "id" in value && typeof value.id === "string") return value.id
  return null
}

function stripePeriodEnd(value: unknown): string | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null
  return new Date(value * 1000).toISOString()
}

function featureFromSession(session: Record<string, unknown>): string | null {
  const paymentLink = typeof session.payment_link === "string" ? session.payment_link : ""
  if (knownPaymentLinks[paymentLink]) return knownPaymentLinks[paymentLink]
  const metadata = session.metadata && typeof session.metadata === "object" ? session.metadata as Record<string, unknown> : {}
  const tier = typeof metadata.tier === "string" ? metadata.tier.toLowerCase() : ""
  if (metadata.app === "streetspot" && ["bronze", "silver", "gold"].includes(tier)) return `vendor_${tier}`
  if (metadata.category === "theme_studio" && ["street_style", "creator", "brand_studio"].includes(tier)) return `theme_${tier}`
  return null
}

function parseClientReference(value: unknown): { userId: string; eventId: string | null } | null {
  if (typeof value !== "string") return null
  const [userId, eventId, ...extra] = value.split(":")
  if (extra.length || !uuidPattern.test(userId)) return null
  if (eventId !== undefined && !uuidPattern.test(eventId)) return null
  return { userId, eventId: eventId ?? null }
}

async function recordEventPurchase(stripeEventId: string, session: Record<string, unknown>, userId: string, eventId: string, feature: string) {
  const eventRows = await supabaseServiceFetch<Array<{ id: string; host_id: string; status: string }>>(
    `private_events?id=eq.${encodeURIComponent(eventId)}&select=id,host_id,status&limit=1`,
  )
  const event = eventRows[0]
  if (!event || event.host_id !== userId || event.status !== "draft") return

  const tier = feature === "event_hosting_invite" ? "invite" : feature === "event_hosting_hosted" ? "hosted" : "signature"
  const guestLimit = tier === "invite" ? 1 : tier === "hosted" ? 50 : 200
  const sessionId = typeof session.id === "string" ? session.id : null
  const paymentIntentId = objectId(session.payment_intent)
  if (!sessionId) throw new Error("Stripe checkout session id is missing")
  await supabaseServiceFetch("event_hosting_purchases?on_conflict=event_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({
      event_id: eventId,
      user_id: userId,
      tier,
      status: "paid",
      guest_limit: guestLimit,
      stripe_checkout_session_id: sessionId,
      stripe_payment_intent_id: paymentIntentId,
      stripe_event_id: stripeEventId,
      updated_at: new Date().toISOString(),
    }),
  })
}

async function sync(payload: Record<string, unknown>) {
  const sharedSecret = process.env.STREETSPOT_STRIPE_SYNC_SECRET
  if (!sharedSecret) throw new Error("Stripe entitlement sync is not configured")
  await supabaseServiceFetch<boolean>("rpc/sync_stripe_entitlement", {
    method: "POST",
    body: JSON.stringify({
      p_shared_secret: sharedSecret,
      p_event_id: payload.eventId,
      p_action: payload.action,
      p_user_id: payload.userId ?? null,
      p_feature: payload.feature ?? null,
      p_status: payload.status ?? null,
      p_customer_id: payload.customerId ?? null,
      p_subscription_id: payload.subscriptionId ?? null,
      p_period_end: payload.periodEnd ?? null,
    }),
  })
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const signature = request.headers.get("stripe-signature")
  if (!webhookSecret || !signature) {
    return NextResponse.json({ ok: false, error: "Webhook configuration is missing." }, { status: 503 })
  }

  const rawBody = await request.text()
  if (!verifyStripeSignature(rawBody, signature, webhookSecret)) {
    return NextResponse.json({ ok: false, error: "Invalid Stripe signature." }, { status: 400 })
  }

  let event: StripeEvent
  try {
    event = JSON.parse(rawBody) as StripeEvent
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid event payload." }, { status: 400 })
  }
  if (typeof event.id !== "string" || typeof event.type !== "string" || !event.data?.object) {
    return NextResponse.json({ ok: false, error: "Incomplete event payload." }, { status: 400 })
  }

  const object = event.data.object
  try {
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded" || event.type === "checkout.session.async_payment_failed") {
      const reference = parseClientReference(object.client_reference_id)
      const feature = featureFromSession(object)
      const mode = object.mode === "subscription" ? "subscription" : "payment"
      const paid = object.payment_status === "paid" || object.payment_status === "no_payment_required"
      if (!feature || !reference || !paid || event.type === "checkout.session.async_payment_failed") {
        await sync({ eventId: event.id, action: "ignore" })
      } else if (feature.startsWith("event_hosting_")) {
        if (mode !== "payment" || !paid || !reference.eventId) {
          await sync({ eventId: event.id, action: "ignore" })
        } else {
          await recordEventPurchase(event.id, object, reference.userId, reference.eventId, feature)
        }
      } else {
        await sync({
          eventId: event.id,
          action: "upsert",
          userId: reference.userId,
          feature,
          status: "active",
          customerId: objectId(object.customer),
          subscriptionId: mode === "subscription" ? objectId(object.subscription) : null,
        })
      }
    } else if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const statusValue = typeof object.status === "string" ? object.status : ""
      const status = statusValue === "active" ? "active"
        : statusValue === "past_due" ? "past_due"
          : statusValue === "canceled" ? "canceled" : "inactive"
      const subscriptionId = typeof object.id === "string" ? object.id : null
      if (subscriptionId) {
        await sync({
          eventId: event.id,
          action: "subscription_status",
          status,
          customerId: objectId(object.customer),
          subscriptionId,
          periodEnd: stripePeriodEnd(object.current_period_end),
        })
      } else {
        await sync({ eventId: event.id, action: "ignore" })
      }
    } else if (event.type === "invoice.paid" || event.type === "invoice.payment_failed") {
      const subscriptionId = objectId(object.subscription)
      if (subscriptionId) {
        await sync({
          eventId: event.id,
          action: "subscription_status",
          status: event.type === "invoice.paid" ? "active" : "past_due",
          customerId: objectId(object.customer),
          subscriptionId,
        })
      } else {
        await sync({ eventId: event.id, action: "ignore" })
      }
    } else if (event.type === "charge.refunded" || event.type === "charge.dispute.created") {
      const paymentIntentId = objectId(object.payment_intent)
      const shouldRevoke = event.type === "charge.dispute.created" || object.refunded === true
      if (paymentIntentId && shouldRevoke) {
        const status = event.type === "charge.dispute.created" ? "disputed" : "refunded"
        const affected = await supabaseServiceFetch<Array<{ event_id: string }>>(
          `event_hosting_purchases?stripe_payment_intent_id=eq.${encodeURIComponent(paymentIntentId)}&status=eq.paid`,
          {
            method: "PATCH",
            headers: { Prefer: "return=representation" },
            body: JSON.stringify({ status, updated_at: new Date().toISOString() }),
          },
        )
        for (const purchase of affected ?? []) {
          await supabaseServiceFetch(`private_events?id=eq.${encodeURIComponent(purchase.event_id)}`, {
            method: "PATCH",
            headers: { Prefer: "return=minimal" },
            body: JSON.stringify({ status: "canceled", updated_at: new Date().toISOString() }),
          })
        }
      }
    }
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[stripe-webhook] entitlement sync failed", error)
    return NextResponse.json({ ok: false, error: "Entitlement processing failed; Stripe can retry this event." }, { status: 500 })
  }
}
