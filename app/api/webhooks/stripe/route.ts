import { createHmac, timingSafeEqual } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { supabaseFetch } from "@/lib/supabase-admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type StripeEvent = {
  id: string
  type: string
  data?: { object?: Record<string, unknown> }
}

const PAYMENT_LINK_EVENT_TIERS: Record<string, "invite" | "hosted" | "signature"> = {
  plink_1URgFxRqYQhupz6BILuhiyCw: "invite",
  plink_1URgG0RqYQhupz6Bf1xvQVwK: "hosted",
  plink_1URgG5RqYQhupz6B4wtYg0cj: "signature",
}

const PAYMENT_LINK_FEATURES: Record<string, string> = {
  plink_1UReP2RqYQhupz6BuQnGOn2V: "vendor_bronze",
  plink_1UReP4RqYQhupz6BwvCYpcdE: "vendor_silver",
  plink_1URePARqYQhupz6BmO5D5JfN: "vendor_gold",
  plink_1UReNyRqYQhupz6B9eqVW6cH: "theme_creator",
  plink_1UReO0RqYQhupz6BkTD1VR1x: "theme_brand_studio",
}

function verifySignature(rawBody: string, signatureHeader: string, secret: string) {
  const values = signatureHeader.split(",").map((part) => part.trim().split("=", 2))
  const timestamp = values.find(([key]) => key === "t")?.[1]
  const signatures = values.filter(([key]) => key === "v1").map(([, value]) => value)
  if (!timestamp || !/^\d+$/.test(timestamp) || signatures.length === 0) return false
  const age = Math.abs(Date.now() / 1000 - Number(timestamp))
  if (!Number.isFinite(age) || age > 300) return false
  const expected = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest()
  return signatures.some((signature) => {
    if (!/^[a-f0-9]{64}$/i.test(signature)) return false
    const supplied = Buffer.from(signature, "hex")
    return supplied.length === expected.length && timingSafeEqual(supplied, expected)
  })
}

function stringId(value: unknown): string | null {
  if (typeof value === "string" && value.length > 0) return value
  if (value && typeof value === "object" && "id" in value && typeof value.id === "string") return value.id
  return null
}

function periodEnd(value: unknown): string | null {
  return typeof value === "number" && Number.isFinite(value)
    ? new Date(value * 1000).toISOString()
    : null
}

function entitlementStatus(value: unknown): "active" | "inactive" | "past_due" | "canceled" {
  if (value === "active" || value === "trialing") return "active"
  if (value === "past_due") return "past_due"
  if (value === "canceled") return "canceled"
  return "inactive"
}

async function syncEntitlement(payload: Record<string, unknown>) {
  const sharedSecret = process.env.STREETSPOT_STRIPE_SYNC_SECRET
  if (!sharedSecret || sharedSecret.length < 24) {
    throw new Error("Stripe entitlement sync is not configured")
  }
  await supabaseFetch<boolean>("rpc/sync_stripe_entitlement", {
    method: "POST",
    body: JSON.stringify({ p_shared_secret: sharedSecret, ...payload }),
  })
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const signature = request.headers.get("stripe-signature")
  if (!webhookSecret || webhookSecret.length < 16 || !signature) {
    return NextResponse.json({ ok: false, error: "Webhook verification is not configured." }, { status: 503 })
  }

  const rawBody = await request.text()
  if (!verifySignature(rawBody, signature, webhookSecret)) {
    return NextResponse.json({ ok: false, error: "Invalid webhook signature." }, { status: 400 })
  }

  let event: StripeEvent
  try {
    event = JSON.parse(rawBody) as StripeEvent
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid event payload." }, { status: 400 })
  }
  if (!event.id || typeof event.type !== "string" || !event.data?.object) {
    return NextResponse.json({ ok: false, error: "Incomplete event payload." }, { status: 400 })
  }

  const object = event.data.object
  const customerId = stringId(object.customer)
  const subscriptionId = stringId(object.subscription)

  try {
    if ((event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") && object.mode === "payment") {
      const paymentLink = typeof object.payment_link === "string" ? object.payment_link : ""
      const tier = PAYMENT_LINK_EVENT_TIERS[paymentLink]
      const userId = typeof object.client_reference_id === "string" ? object.client_reference_id : ""
      const sessionId = typeof object.id === "string" ? object.id : ""
      const paymentIntentId = stringId(object.payment_intent)
      if (object.payment_status !== "paid") {
        await syncEntitlement({ p_event_id: event.id, p_action: "ignore" })
        return NextResponse.json({ ok: true, ignored: true, reason: "payment_not_complete" })
      }
      const validUserId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)
      if (tier && validUserId && sessionId) {
        const sharedSecret = process.env.STREETSPOT_STRIPE_SYNC_SECRET
        if (!sharedSecret || sharedSecret.length < 24) throw new Error("Stripe entitlement sync is not configured")
        await supabaseFetch<boolean>("rpc/record_stripe_event_purchase", {
          method: "POST",
          body: JSON.stringify({ p_shared_secret: sharedSecret, p_event_id: event.id, p_user_id: userId, p_tier: tier, p_checkout_session_id: sessionId, p_payment_intent_id: paymentIntentId }),
        })
        await supabaseFetch("conversion_events?on_conflict=event_key", {
          method: "POST",
          headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
          body: JSON.stringify({ event_name: "event_purchase_confirmed", event_key: event.id, properties: { tier }, source_path: "/host/invitations" }),
        })
        return NextResponse.json({ ok: true })
      }
      await syncEntitlement({ p_event_id: event.id, p_action: "ignore" })
      return NextResponse.json({ ok: true, ignored: true })
    }

    if (
      (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") &&
      object.mode === "subscription"
    ) {
      const paymentLink = typeof object.payment_link === "string" ? object.payment_link : ""
      const feature = PAYMENT_LINK_FEATURES[paymentLink]
      const userId = typeof object.client_reference_id === "string" ? object.client_reference_id : ""
      const subscription = stringId(object.subscription)
      const customer = stringId(object.customer)
      const validUserId = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)

      if (!feature || !validUserId || !subscription) {
        await syncEntitlement({ p_event_id: event.id, p_action: "ignore" })
        return NextResponse.json({ ok: true, ignored: true })
      }

      await syncEntitlement({
        p_event_id: event.id,
        p_action: "upsert",
        p_user_id: userId,
        p_feature: feature,
        p_status: "active",
        p_customer_id: customer,
        p_subscription_id: subscription,
        p_period_end: null,
      })
      return NextResponse.json({ ok: true })
    }

    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const subscription = object.id
      if (typeof subscription !== "string") {
        await syncEntitlement({ p_event_id: event.id, p_action: "ignore" })
        return NextResponse.json({ ok: true, ignored: true })
      }
      await syncEntitlement({
        p_event_id: event.id,
        p_action: "subscription_status",
        p_status: event.type === "customer.subscription.deleted" ? "canceled" : entitlementStatus(object.status),
        p_customer_id: customerId,
        p_subscription_id: subscription,
        p_period_end: periodEnd(object.current_period_end),
      })
      return NextResponse.json({ ok: true })
    }

    if (event.type === "invoice.payment_failed" && subscriptionId) {
      await syncEntitlement({
        p_event_id: event.id,
        p_action: "subscription_status",
        p_status: "past_due",
        p_customer_id: customerId,
        p_subscription_id: subscriptionId,
        p_period_end: null,
      })
      return NextResponse.json({ ok: true })
    }

    await syncEntitlement({ p_event_id: event.id, p_action: "ignore" })
    return NextResponse.json({ ok: true, ignored: true })
  } catch (error) {
    console.error("[stripe-webhook] Entitlement sync failed", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ ok: false, error: "Event processing failed." }, { status: 500 })
  }
}
