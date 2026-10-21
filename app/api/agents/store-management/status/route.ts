import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const stripeSecret = process.env.STRIPE_SECRET_KEY || ""
  const testPriceVariables = [
    "STRIPE_PRICE_VENDOR_BRONZE",
    "STRIPE_PRICE_VENDOR_SILVER",
    "STRIPE_PRICE_VENDOR_GOLD",
    "STRIPE_PRICE_THEME_STREET_STYLE",
    "STRIPE_PRICE_THEME_CREATOR",
    "STRIPE_PRICE_THEME_BRAND_STUDIO",
  ]
  const testPricesConfigured = testPriceVariables.every((name) => /^price_[A-Za-z0-9]+$/.test(process.env[name] || ""))
  const supabaseReady = Boolean((process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) && process.env.SUPABASE_SERVICE_ROLE_KEY)
  const webhookReady = Boolean(process.env.STRIPE_WEBHOOK_SECRET)
  const syncReady = Boolean(process.env.STREETSPOT_STRIPE_SYNC_SECRET && supabaseReady)
  const googlePlayCredentials = Boolean(process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON || process.env.ANDROID_PUBLISHER_SERVICE_ACCOUNT_JSON)
  const googleAdsCredentials = Boolean(process.env.GOOGLE_ADS_DEVELOPER_TOKEN && process.env.GOOGLE_ADS_CLIENT_ID && process.env.GOOGLE_ADS_CLIENT_SECRET && process.env.GOOGLE_ADS_REFRESH_TOKEN)
  const aiGatewayConfigured = process.env.STREETSPOT_ENABLE_PAID_AI === "true" && Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN)

  return NextResponse.json({
    ok: true,
    integrations: {
      livePaymentLinks: true,
      stripeWebhook: webhookReady,
      entitlementSync: syncReady,
      testCheckout: stripeSecret.startsWith("sk_test_") && testPricesConfigured,
      testCheckoutMissing: [
        ...(!stripeSecret.startsWith("sk_test_") ? ["STRIPE_SECRET_KEY (test-mode key)"] : []),
        ...(!testPricesConfigured ? testPriceVariables.filter((name) => !/^price_[A-Za-z0-9]+$/.test(process.env[name] || "")) : []),
      ],
      googlePlayPublishing: googlePlayCredentials,
      googleAdsApi: googleAdsCredentials,
      aiGateway: aiGatewayConfigured,
    },
    note: "Only configuration status is returned. Secret values are never exposed.",
  }, { headers: { "Cache-Control": "no-store" } })
}
