import { createHmac, timingSafeEqual } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"

const COOKIE_NAME = "streetspot_agent_access"

function expectedToken(secret: string) {
  return createHmac("sha256", secret).update("streetspot-agent-console-v1").digest("hex")
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left)
  const b = Buffer.from(right)
  return a.length === b.length && timingSafeEqual(a, b)
}

export function proxy(request: NextRequest) {
  const secret = process.env.STREETSPOT_AGENT_ACCESS_PASSWORD
  const pathname = request.nextUrl.pathname
  if (pathname === "/" && request.headers.get("accept")?.toLowerCase().includes("text/markdown")) {
    return NextResponse.rewrite(new URL("/agent-markdown", request.url))
  }
  const protectedPath =
    pathname === "/agents" ||
    pathname.startsWith("/agents/") && pathname !== "/agents/login" ||
    pathname === "/vendor-studio" ||
    pathname.startsWith("/vendor-studio/") ||
    pathname === "/api/agents" ||
    pathname.startsWith("/api/agents/") && pathname !== "/api/agents/auth" && pathname !== "/api/agents/a2a"

  if (!protectedPath) return NextResponse.next()

  const token = request.cookies.get(COOKIE_NAME)?.value
  const valid = Boolean(secret && token && safeEqual(token, expectedToken(secret)))
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

export const config = {
  matcher: ["/", "/agents/:path*", "/vendor-studio/:path*", "/api/agents/:path*"],
}
