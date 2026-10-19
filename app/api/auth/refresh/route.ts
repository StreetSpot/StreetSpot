import { NextRequest, NextResponse } from "next/server"
import { getSupabaseConfig } from "@/lib/supabase-admin"
import { clearSessionCookies, setSessionCookies, publicUser, type SupabaseSession } from "@/lib/supabase-auth"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("streetspot_refresh_token")?.value
  if (!refreshToken) return NextResponse.json({ ok: false, error: "Sign in again to continue." }, { status: 401 })
  try {
    const { url, apiKey } = getSupabaseConfig()
    const upstream = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { apikey: apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    })
    if (!upstream.ok) {
      const response = NextResponse.json({ ok: false, error: "Your session expired. Sign in again." }, { status: 401 })
      clearSessionCookies(response)
      return response
    }
    const session = await upstream.json() as SupabaseSession
    const response = NextResponse.json({ ok: true, user: publicUser(session) })
    setSessionCookies(response, session)
    return response
  } catch {
    return NextResponse.json({ ok: false, error: "Account services are temporarily unavailable." }, { status: 503 })
  }
}
