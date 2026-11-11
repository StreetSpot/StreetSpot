import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const USER_AGENT = "StreetSpot/1.0 (https://streetspotapp.com; support@streetspotapp.com)"
const NOMINATIM = "https://nominatim.openstreetmap.org"
const cache = new Map<string, { expiresAt: number; body: unknown }>()
let lastRequestAt = 0

type Place = { label: string; latitude: number; longitude: number }

function invalid(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message, results: [] as Place[] }, { status })
}

async function nominatim(url: string) {
  const now = Date.now()
  const cached = cache.get(url)
  if (cached && cached.expiresAt > now) return cached.body
  const wait = 1100 - (now - lastRequestAt)
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait))
  lastRequestAt = Date.now()
  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": USER_AGENT },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) throw new Error(`Nominatim failed (${response.status})`)
  const body: unknown = await response.json()
  cache.set(url, { expiresAt: Date.now() + 10 * 60 * 1000, body })
  if (cache.size > 200) {
    const first = cache.keys().next().value
    if (first) cache.delete(first)
  }
  return body
}

function asPlace(value: unknown): Place | null {
  if (!value || typeof value !== "object") return null
  const item = value as { display_name?: unknown; lat?: unknown; lon?: unknown }
  const latitude = Number(item.lat)
  const longitude = Number(item.lon)
  if (typeof item.display_name !== "string" || !item.display_name.trim()) return null
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) return null
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) return null
  return { label: item.display_name.trim().slice(0, 200), latitude, longitude }
}

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q")?.trim() ?? ""
    const lat = request.nextUrl.searchParams.get("lat")
    const lon = request.nextUrl.searchParams.get("lon")
    if (lat != null || lon != null) {
      const latitude = Number(lat)
      const longitude = Number(lon)
      if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
        return invalid("That location could not be looked up.")
      }
      const url = `${NOMINATIM}/reverse?format=jsonv2&lat=${encodeURIComponent(String(latitude))}&lon=${encodeURIComponent(String(longitude))}&addressdetails=0`
      const place = asPlace(await nominatim(url))
      return NextResponse.json(
        { ok: true, results: place ? [place] : [] },
        { headers: { "Cache-Control": "private, max-age=300" } },
      )
    }
    if (query.length < 3) return invalid("Type at least 3 characters to search for a venue.")
    if (query.length > 200) return invalid("That address search is too long.")
    const url = `${NOMINATIM}/search?format=jsonv2&limit=5&addressdetails=0&q=${encodeURIComponent(query)}`
    const body = await nominatim(url)
    const results = Array.isArray(body) ? body.flatMap((item) => {
      const place = asPlace(item)
      return place ? [place] : []
    }) : []
    return NextResponse.json({ ok: true, results }, { headers: { "Cache-Control": "private, max-age=300" } })
  } catch (error) {
    const timeout = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")
    return NextResponse.json({
      ok: false,
      error: timeout ? "Address search timed out. Try again in a moment." : "Address search is temporarily unavailable. Try again, or use your location if you are at the venue.",
      results: [],
    }, { status: 503, headers: { "Retry-After": "5" } })
  }
}
