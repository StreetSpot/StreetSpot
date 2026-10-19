import { createHmac, timingSafeEqual } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"

const AGENT_COOKIE = "streetspot_agent_access"
const ACCESS_COOKIE = "streetspot_access_token"
const REFRESH_COOKIE = "streetspot_refresh_token"
const SESSION_MAX_AGE = 60 * 60 * 24 * 30

function expectedAgentToken(secret: string) {
  return createHmac("sha256", secret).update("streetspot-agent-console-v1").digest("hex")
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left)
  const b = Buffer.from(right)
  return a.length === b.length && timingSafeEqual(a, b)
}

function isAgentPath(pathname: string) {
  return pathname === "/agents" ||
    (pathname.startsWith("/agents/") && pathname !== "/agents/login") ||
    pathname === "/api/agents" ||
    (pathname.startsWith("/api/agents/") && pathname !== "/api/agents/auth" && pathname !== "/api/agents/a2a")
}

function isAccountPrivatePath(pathname: string) {
  return pathname === "/host/invitations" || pathname.startsWith("/host/invitations/") ||
    pathname === "/vendor-studio" || pathname.startsWith("/vendor-studio/")
}

function accountUrl(request: NextRequest) {
  const loginUrl = new URL("/account", request.url)
  loginUrl.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search)
  return loginUrl
}

async function validSupabaseSession(request: NextRequest) {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const apiKey = process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !apiKey) return null

  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value
  if (accessToken) {
    try {
      const response = await fetch(`${url}/auth/v1/user`, {
        headers: { apikey: apiKey, Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      })
      if (response.ok) return NextResponse.next()
    } catch {
      // Try the refresh token below.
    }
  }

  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value
  if (!refreshToken) return null
  try {
    const response = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { apikey: apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
      signal: AbortSignal.timeout(7000),
    })
    if (!response.ok) return null
    const session = await response.json() as { access_token?: unknown; refresh_token?: unknown; expires_in?: unknown }
    if (typeof session.access_token !== "string" || typeof session.refresh_token !== "string") return null
    const next = NextResponse.next()
    const cookieOptions = { httpOnly: true, secure: request.nextUrl.protocol === "https:", sameSite: "lax" as const, path: "/" }
    const expiresIn = typeof session.expires_in === "number" ? Math.max(60, Math.min(session.expires_in, 86400)) : 3600
    next.cookies.set(ACCESS_COOKIE, session.access_token, { ...cookieOptions, maxAge: expiresIn })
    next.cookies.set(REFRESH_COOKIE, session.refresh_token, { ...cookieOptions, maxAge: SESSION_MAX_AGE })
    return next
  } catch {
    return null
  }
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (pathname === "/" && request.headers.get("accept")?.toLowerCase().includes("text/markdown")) {
    return NextResponse.rewrite(new URL("/agent-markdown", request.url))
  }

  if (isAgentPath(pathname)) {
    const secret = process.env.STREETSPOT_AGENT_ACCESS_PASSWORD
    const token = request.cookies.get(AGENT_COOKIE)?.value
    const valid = Boolean(secret && token && safeEqual(token, expectedAgentToken(secret)))
    if (valid) return NextResponse.next()
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { ok: false, code: "AGENT_ACCESS_REQUIRED", message: "Sign in to the StreetSpot operations console." },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      )
    }
    const loginUrl = new URL("/agents/login", request.url)
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAccountPrivatePath(pathname)) {
    const response = await validSupabaseSession(request)
    if (response) return response
    return NextResponse.redirect(accountUrl(request))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/agents/:path*", "/api/agents/:path*", "/host/invitations/:path*", "/vendor-studio/:path*"],
}
