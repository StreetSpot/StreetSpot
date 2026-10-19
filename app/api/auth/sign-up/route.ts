import { NextRequest, NextResponse } from "next/server"
import { getSupabaseConfig } from "@/lib/supabase-admin"
import { setSessionCookies, publicUser, type SupabaseSession } from "@/lib/supabase-auth"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as { email?: unknown; password?: unknown } | null
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""
  const password = typeof body?.password === "string" ? body.password : ""
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "Enter a valid email address." }, { status: 400 })
  }
  if (password.length < 8 || password.length > 256) {
    return NextResponse.json({ ok: false, error: "Use a password between 8 and 256 characters." }, { status: 400 })
  }

  try {
    const { url, apiKey } = getSupabaseConfig()
    const redirectTo = "https://streetspotapp.com/account?verified=1"
    const upstream = await fetch(`${url}/auth/v1/signup?redirect_to=${encodeURIComponent(redirectTo)}`, {
      method: "POST",
      headers: { apikey: apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    })
    const session = await upstream.json().catch(() => ({})) as SupabaseSession & { msg?: string; message?: string }
    if (!upstream.ok) {
      const message = upstream.status === 429
        ? "Too many sign-up attempts. Wait a little before trying again."
        : upstream.status === 422
          ? "That email may already be registered, or the password was rejected."
          : "We couldn't create the account. Check the details and try again."
      return NextResponse.json({ ok: false, error: message }, { status: upstream.status === 429 ? 429 : 400, headers: { "Cache-Control": "no-store" } })
    }
    if (typeof session.access_token === "string" && typeof session.refresh_token === "string") {
      const response = NextResponse.json({ ok: true, user: publicUser(session), confirmationRequired: false })
      setSessionCookies(response, session)
      return response
    }
    return NextResponse.json({
      ok: true,
      confirmationRequired: true,
      message: "Check your email for the verification link before signing in.",
    }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Supabase server configuration")) {
      return NextResponse.json({ ok: false, error: "Account services are not configured." }, { status: 503 })
    }
    return NextResponse.json({ ok: false, error: "Account services are temporarily unavailable." }, { status: 503 })
  }
}
