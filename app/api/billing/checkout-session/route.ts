import { NextRequest, NextResponse } from "next/server"
import { errorResponse, requireUser } from "@/lib/supabase-admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type CheckoutPlan = {
  priceEnv: string
  mode: "payment" | "subscription"
  tier: string
  category: "vendor" | "theme_studio"
  returnPath: string
}

const plans: Record<string, CheckoutPlan> = {
  bronze: { priceEnv: "STRIPE_PRICE_VENDOR_BRONZE", mode: "subscription", tier: "bronze", category: "vendor", returnPath: "/vendor-studio" },
  silver: { priceEnv: "STRIPE_PRICE_VENDOR_SILVER", mode: "subscription", tier: "silver", category: "vendor", returnPath: "/vendor-studio" },
  gold: { priceEnv: "STRIPE_PRICE_VENDOR_GOLD", mode: "subscription", tier: "gold", category: "vendor", returnPath: "/vendor-studio" },
  street_style: { priceEnv: "STRIPE_PRICE_THEME_STREET_STYLE", mode: "payment", tier: "street_style", category: "theme_studio", returnPath: "/themes" },
  creator: { priceEnv: "STRIPE_PRICE_THEME_CREATOR", mode: "subscription", tier: "creator", category: "theme_studio", returnPath: "/themes" },
  brand_studio: { priceEnv: "STRIPE_PRICE_THEME_BRAND_STUDIO", mode: "subscription", tier: "brand_studio", category: "theme_studio", returnPath: "/themes" },
}

export async function POST(request: NextRequest) {
  let user
  try {
    user = await requireUser(request)
  } catch (error) {
    if (error instanceof Response) return error
    return errorResponse(error)
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    return NextResponse.json({ ok: false, error: "Stripe Checkout is not configured." }, { status: 503 })
  }
  // This endpoint is for safe integration testing. Existing live Payment Links are unchanged.
  if (!secretKey.startsWith("sk_test_")) {
    return NextResponse.json({ ok: false, error: "Checkout Session testing requires a Stripe test-mode secret key." }, { status: 503 })
  }

  let body: { plan?: unknown }
  try {
    body = await request.json() as { plan?: unknown }
  } catch {
    return NextResponse.json({ ok: false, error: "A checkout plan is required." }, { status: 400 })
  }

  const planId = typeof body.plan === "string" ? body.plan : ""
  const plan = plans[planId]
  if (!plan) {
    return NextResponse.json({ ok: false, error: "Unknown Checkout Session plan." }, { status: 400 })
  }

  const priceId = process.env[plan.priceEnv]
  if (!priceId || !/^price_[A-Za-z0-9]+$/.test(priceId)) {
    return NextResponse.json({ ok: false, error: `Configure ${plan.priceEnv} with a Stripe test-mode Price ID.` }, { status: 503 })
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://streetspotapp.com").replace(/\/$/, "")
  const params = new URLSearchParams()
  params.set("mode", plan.mode)
  params.set("ui_mode", "hosted_page")
  params.set("success_url", `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`)
  params.set("cancel_url", `${siteUrl}${plan.returnPath}?checkout=cancelled`)
  params.set("line_items[0][price]", priceId)
  params.set("line_items[0][quantity]", "1")
  params.set("billing_address_collection", "required")
  params.set("phone_number_collection[enabled]", "false")
  params.set("automatic_tax[enabled]", "false")
  params.set("allow_promotion_codes", "false")
  params.set("submit_type", "auto")
  params.set("integration_identifier", "hosted_mobile_app_0001")
  params.set("origin_context", "mobile_app")
  params.set("client_reference_id", user.id)
  params.set("metadata[app]", "streetspot")
  if (plan.category === "vendor") {
    params.set("metadata[tier]", plan.tier)
  } else {
    params.set("metadata[category]", "theme_studio")
    params.set("metadata[tier]", plan.tier)
  }
  if (plan.mode === "subscription") params.set("payment_method_collection", "always")

  let stripeResponse: Response
  try {
    stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
      cache: "no-store",
    })
  } catch {
    return NextResponse.json({ ok: false, error: "Stripe could not be reached. No payment was created." }, { status: 502 })
  }

  const result = await stripeResponse.json() as { id?: string; url?: string | null; error?: { message?: string } }
  if (!stripeResponse.ok || typeof result.url !== "string" || !result.url.startsWith("https://checkout.stripe.com/")) {
    console.error("[stripe-checkout-session] Stripe rejected the test session request", {
      status: stripeResponse.status,
      type: result.error?.message ? "stripe_api_error" : "invalid_response",
    })
    return NextResponse.json({ ok: false, error: "Stripe could not create a test Checkout Session. Check Stripe test Price IDs and Checkout settings." }, { status: 502 })
  }

  return NextResponse.json({ ok: true, sessionId: result.id, url: result.url }, {
    headers: { "Cache-Control": "no-store" },
  })
}
