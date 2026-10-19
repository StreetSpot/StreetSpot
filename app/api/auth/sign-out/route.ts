import { NextRequest, NextResponse } from "next/server"
import { getSupabaseConfig } from "@/lib/supabase-admin"
import { clearSessionCookies } from "@/lib/supabase-auth"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get("streetspot_access_token")?.value
  const response = NextResponse.json({ ok: true })
  clearSessionCookies(response)
  if (accessToken) {
    try {
      const { url, apiKey } = getSupabaseConfig()
      await fetch(`${url}/auth/v1/logout`, {
        method: "POST",
        headers: { apikey: apiKey, Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      })
    } catch {
      // Clear local session cookies even if the upstream logout endpoint is unavailable.
    }
  }
  return response
}
