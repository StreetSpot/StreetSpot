import { createHash } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { supabaseFetch } from "@/lib/supabase-admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const ALLOWED_EVENTS = new Set([
  "event_package_selected",
  "event_checkout_started",
  "event_package_available",
  "invitation_style_selected",
  "private_event_created",
  "private_invitation_opened",
])
const ALLOWED_TIERS = new Set(["invite", "hosted", "signature"])
const ALLOWED_STYLES = new Set(["elegant", "celebration", "street"])
const rateBuckets = new Map<string, { start: number; count: number }>()
const WINDOW_MS = 60_000
const MAX_EVENTS_PER_WINDOW = 30

function clientKey(request: NextRequest) {
  const ip = request.headers.get("x-real-ip")
    || request.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim()
    || "unknown"
  return createHash("sha256").update(ip).digest("hex")
}

function allowRate(request: NextRequest) {
  const now = Date.now()
  const key = clientKey(request)
  const current = rateBuckets.get(key)
  if (!current || now - current.start >= WINDOW_MS) {
    rateBuckets.set(key, { start: now, count: 1 })
    if (rateBuckets.size > 5000) {
      for (const [bucketKey, bucket] of rateBuckets) {
        if (now - bucket.start >= WINDOW_MS) rateBuckets.delete(bucketKey)
      }
    }
    return true
  }
  if (current.count >= MAX_EVENTS_PER_WINDOW) return false
  current.count += 1
  return true
}

function safeProperties(eventName: string, value: unknown): Record<string, string | number> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  const input = value as Record<string, unknown>
  const output: Record<string, string | number> = {}
  if ("tier" in input) {
    if (typeof input.tier !== "string" || !ALLOWED_TIERS.has(input.tier)) return null
    output.tier = input.tier
  }
  if ("style" in input) {
    if (typeof input.style !== "string" || !ALLOWED_STYLES.has(input.style)) return null
    output.style = input.style
  }
  if ("invitation_style" in input) {
    if (typeof input.invitation_style !== "string" || !ALLOWED_STYLES.has(input.invitation_style)) return null
    output.invitation_style = input.invitation_style
  }
  if ("guest_count" in input) {
    if (typeof input.guest_count !== "number" || !Number.isInteger(input.guest_count) || input.guest_count < 1 || input.guest_count > 200) return null
    output.guest_count = input.guest_count
  }
  const allowedKeys = eventName === "private_event_created"
    ? new Set(["tier", "guest_count", "invitation_style"])
    : eventName === "event_package_selected" || eventName === "event_checkout_started" || eventName === "event_package_available"
      ? new Set(["tier"])
      : new Set(["style"])
  const requiredKeys = eventName === "private_event_created"
    ? ["tier", "guest_count", "invitation_style"]
    : eventName === "event_package_selected" || eventName === "event_checkout_started" || eventName === "event_package_available"
      ? ["tier"]
      : ["style"]
  if (Object.keys(input).some((key) => !allowedKeys.has(key)) || requiredKeys.some((key) => !(key in output))) return null
  return output
}

function safeSourcePath(request: NextRequest) {
  const referer = request.headers.get("referer")
  let pathname = "/"
  if (referer) {
    try { pathname = new URL(referer).pathname } catch {}
  }
  if (/^\/host\/invite\/[^/]+\/?$/.test(pathname)) return "/host/invite/[token]"
  if (!pathname.startsWith("/") || pathname.startsWith("//")) return "/"
  return pathname.slice(0, 200)
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin")
  const referer = request.headers.get("referer")
  let sourceOrigin = origin
  if (!sourceOrigin && referer) {
    try { sourceOrigin = new URL(referer).origin } catch { sourceOrigin = null }
  }
  if (sourceOrigin !== "https://streetspotapp.com" && sourceOrigin !== "https://www.streetspotapp.com") {
    return NextResponse.json({ ok: false }, { status: 403 })
  }
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return NextResponse.json({ ok: false }, { status: 403 })
  }
  const length = Number(request.headers.get("content-length") || "0")
  if (length > 4096) return NextResponse.json({ ok: false }, { status: 413 })
  if (!allowRate(request)) return NextResponse.json({ ok: false }, { status: 429, headers: { "Retry-After": "60" } })

  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  if (!body || typeof body.eventName !== "string" || !ALLOWED_EVENTS.has(body.eventName)) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  const properties = safeProperties(body.eventName, body.properties)
  if (!properties) return NextResponse.json({ ok: false }, { status: 400 })

  try {
    await supabaseFetch("conversion_events", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ event_name: body.eventName, properties, source_path: safeSourcePath(request) }),
    })
    return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    console.error("[analytics-events] Conversion event insert failed", error instanceof Error ? error.message : "Unknown error")
    return NextResponse.json({ ok: false, code: "TRACKING_UNAVAILABLE" }, { status: 503, headers: { "Cache-Control": "no-store" } })
  }
}
