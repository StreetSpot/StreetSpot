import { NextRequest, NextResponse } from "next/server"
import { getSupabaseConfig } from "@/lib/supabase-admin"
import { setSessionCookies, publicUser, type SupabaseSession } from "@/lib/supabase-auth"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as { email?: unknown; password?: unknown } | null
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""
  const password = typeof body?.password === "string" ? body.password : ""
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 1 || password.length > 256) {
    return NextResponse.json({ ok: false, error: "Enter a valid email and password." }, { status: 400 })
  }

  try {
    const { url, apiKey } = getSupabaseConfig()
    const upstream = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    })
    if (!upstream.ok) return NextResponse.json({ ok: false, error: "Email or password was not accepted." }, { status: 401, headers: { "Cache-Control": "no-store" } })
    const session = await upstream.json() as SupabaseSession
    if (typeof session.access_token !== "string" || typeof session.refresh_token !== "string") {
      return NextResponse.json({ ok: false, error: "The account needs email verification before sign-in." }, { status: 403 })
    }
    const response = NextResponse.json({ ok: true, user: publicUser(session) })
    setSessionCookies(response, session)
    return response
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Supabase server configuration")) {
      return NextResponse.json({ ok: false, error: "Account services are not configured." }, { status: 503 })
    }
    return NextResponse.json({ ok: false, error: "Account services are temporarily unavailable." }, { status: 503 })
  }
}
