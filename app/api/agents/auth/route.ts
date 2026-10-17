import { createHmac, timingSafeEqual } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const COOKIE_NAME = "streetspot_agent_access"
const MAX_AGE_SECONDS = 60 * 60 * 12

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left)
  const b = Buffer.from(right)
  return a.length === b.length && timingSafeEqual(a, b)
}

function makeToken(secret: string) {
  return createHmac("sha256", secret).update("streetspot-agent-console-v1").digest("hex")
}

export async function POST(request: NextRequest) {
  const secret = process.env.STREETSPOT_AGENT_ACCESS_PASSWORD
  if (!secret || secret.length < 24) {
    return NextResponse.json({ ok: false, error: "Agent console access is not configured on the server." }, { status: 503 })
  }

  const body = await request.json().catch(() => null) as { password?: unknown } | null
  const password = typeof body?.password === "string" ? body.password : ""
  if (!safeEqual(password, secret)) {
    return NextResponse.json({ ok: false, error: "The password was not accepted." }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(COOKIE_NAME, makeToken(secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  })
  response.headers.set("Cache-Control", "no-store")
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  })
  response.headers.set("Cache-Control", "no-store")
  return response
}
