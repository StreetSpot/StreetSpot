import { NextRequest, NextResponse } from "next/server"
import { errorResponse, requireUser, supabaseFetch, supabaseServiceFetch } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

const paymentLinks: Record<string, { url: string; audience: "vendor" | "theme" | "host" }> = {
  bronze: { url: "https://buy.stripe.com/7sYdRb77I9hCdzSf281VK07", audience: "vendor" },
  silver: { url: "https://buy.stripe.com/bJe7sNcs28dy3ZibPW1VK08", audience: "vendor" },
  gold: { url: "https://buy.stripe.com/14A8wR77IdxScvObPW1VK09", audience: "vendor" },
  street_style: { url: "https://buy.stripe.com/bJe6oJeAa51m9jCaLS1VK04", audience: "theme" },
  creator: { url: "https://buy.stripe.com/00wdRb2RsgK4anGbPW1VK05", audience: "theme" },
  brand_studio: { url: "https://buy.stripe.com/7sY00lajU2TeeDWcU01VK06", audience: "theme" },
  event_invite: { url: "https://buy.stripe.com/3cI4gBfEegK4cvOcU01VK0a", audience: "host" },
  event_hosted: { url: "https://buy.stripe.com/6oUaEZ1NogK41Ra1bi1VK0b", audience: "host" },
  event_signature: { url: "https://buy.stripe.com/28EdRbbnY65q7bu07e1VK0c", audience: "host" },
}
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(request: NextRequest) {
  const plan = request.nextUrl.searchParams.get("plan") ?? ""
  const selected = paymentLinks[plan]
  if (!selected) return NextResponse.json({ ok: false, error: "Unknown checkout plan." }, { status: 404 })
  const eventId = request.nextUrl.searchParams.get("eventId") ?? ""
  if (selected.audience === "host" && !uuidPattern.test(eventId)) {
    return NextResponse.json({ ok: false, error: "Create an event draft before purchasing event hosting." }, { status: 400 })
  }

  let user
  try {
    user = await requireUser(request)
  } catch (error) {
    if (error instanceof Response && error.status !== 401) return error
    if (!(error instanceof Response)) return errorResponse(error)
    const next = selected.audience === "vendor" ? `/api/billing/checkout?plan=${encodeURIComponent(plan)}` : selected.audience === "host" ? "/host/invitations" : "/themes"
    const login = new URL("/account", request.url)
    login.searchParams.set("next", next)
    return NextResponse.redirect(login, 302)
  }

  if (selected.audience === "vendor") {
    const entitlements = await supabaseFetch<Array<{ feature: string; status: string; current_period_end: string | null }>>(
      `account_entitlements?user_id=eq.${encodeURIComponent(user.id)}&select=feature,status,current_period_end`, {}, user.accessToken,
    )
    const now = Date.now()
    const hasVendorPlan = entitlements.some(item =>
      ["vendor_bronze", "vendor_silver", "vendor_gold"].includes(item.feature) &&
      ((item.status === "active" && (!item.current_period_end || Date.parse(item.current_period_end) > now)) ||
        (item.status === "past_due" && Boolean(item.current_period_end) && Date.parse(item.current_period_end!) > now))
    )
    if (hasVendorPlan) {
      const dashboard = new URL("/vendor-studio", request.url)
      dashboard.searchParams.set("billing", "active")
      return NextResponse.redirect(dashboard, 303)
    }
  }

  if (selected.audience === "host") {
    const events = await supabaseFetch<Array<{ id: string; status: string; starts_at: string }>>(
      `private_events?id=eq.${encodeURIComponent(eventId)}&host_id=eq.${encodeURIComponent(user.id)}&select=id,status,starts_at&limit=1`,
      {},
      user.accessToken,
    )
    if (!events[0] || events[0].status !== "draft") {
      return NextResponse.json({ ok: false, error: "Only your own unpublished event draft can be checked out." }, { status: 404 })
    }
    if (Date.parse(events[0].starts_at) <= Date.now()) {
      return NextResponse.json({ ok: false, error: "Past events cannot be checked out." }, { status: 400 })
    }
    const existing = await supabaseServiceFetch<Array<{ id: string }>>(
      `event_hosting_purchases?event_id=eq.${encodeURIComponent(eventId)}&status=eq.paid&select=id&limit=1`,
    )
    if (existing[0]) return NextResponse.json({ ok: false, error: "This event already has a confirmed hosting purchase." }, { status: 409 })
  }

  const checkout = new URL(selected.url)
  checkout.searchParams.set("client_reference_id", selected.audience === "host" ? `${user.id}:${eventId}` : user.id)
  if (user.email) checkout.searchParams.set("prefilled_email", user.email)
  checkout.searchParams.set("utm_source", "streetspotapp")
  checkout.searchParams.set("utm_medium", "in_app")
  checkout.searchParams.set("utm_campaign", selected.audience === "vendor" ? "vendor_subscription" : selected.audience === "host" ? "event_hosting" : "theme_studio")
  const response = NextResponse.redirect(checkout, 302)
  response.headers.set("Cache-Control", "no-store")
  return response
}
