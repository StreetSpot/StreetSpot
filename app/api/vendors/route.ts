import { NextRequest } from "next/server"
import { errorResponse, requireUser, supabaseFetch } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

const isValidCoordinate = (latitude: number, longitude: number) =>
  Number.isFinite(latitude) && latitude >= -90 && latitude <= 90 &&
  Number.isFinite(longitude) && longitude >= -180 && longitude <= 180
const isValidClosingTime = (value: string) => /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)

interface VendorRow {
  id: string
  name: string
  description: string | null
  is_live: boolean
  is_premium: boolean
  closing_time: string
  created_at: string
  vendor_locations: Array<{ latitude: number; longitude: number; is_live: boolean }>
}

function toPublicVendor(vendor: VendorRow) {
  const locations = Array.isArray(vendor.vendor_locations) ? vendor.vendor_locations : []
  const location = locations.find((item) => item.is_live)
  const createdAt = Date.parse(vendor.created_at)
  if (!location || !isValidCoordinate(location.latitude, location.longitude) || !isValidClosingTime(vendor.closing_time) || !Number.isFinite(createdAt)) return null
  return {
    id: vendor.id,
    name: vendor.name,
    description: vendor.description ?? "Street vendor",
    lat: location.latitude,
    lng: location.longitude,
    closingTime: vendor.closing_time,
    isLive: true,
    isPremium: vendor.is_premium === true,
    createdAt,
  }
}

export async function GET() {
  try {
    const rows = await supabaseFetch<VendorRow[]>(
      "vendors?is_live=eq.true&select=id,name,description,is_live,is_premium,closing_time,created_at,vendor_locations(latitude,longitude,is_live)&order=created_at.desc"
    )
    const vendors = rows.filter((vendor) => vendor.is_live)
      .map(toPublicVendor)
      .filter((vendor): vendor is NonNullable<typeof vendor> => vendor !== null)
    return Response.json({ vendors }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request)
    const body = await request.json().catch(() => null) as Record<string, unknown> | null
    if (!body || typeof body !== "object" || Array.isArray(body)) return Response.json({ ok: false, code: "INVALID_JSON" }, { status: 400 })
    const name = typeof body.name === "string" ? body.name.trim() : ""
    const description = typeof body.description === "string" ? body.description.trim() : ""
    const category = typeof body.category === "string" ? body.category.trim().slice(0, 80) : "vendor"
    const closingTime = typeof body.closingTime === "string" ? body.closingTime : ""
    const lat = typeof body.lat === "number" ? body.lat : Number.NaN
    const lng = typeof body.lng === "number" ? body.lng : Number.NaN
    if (description.length < 20) return Response.json({ ok: false, code: "DESCRIPTION_REQUIRED", error: "Add an accurate business description of at least 20 characters before publishing." }, { status: 400 })
    if (name.length < 1 || name.length > 160 || description.length > 2000 || category.length > 80 || !isValidClosingTime(closingTime) || !isValidCoordinate(lat, lng)) {
      return Response.json({ ok: false, code: "INVALID_VENDOR" }, { status: 400 })
    }
    const id = await supabaseFetch<string>("rpc/publish_vendor", {
      method: "POST",
      body: JSON.stringify({ p_name: name, p_description: description, p_category: category, p_lat: lat, p_lng: lng, p_closing_time: closingTime }),
    }, user.accessToken)
    let isPremium = false
    try {
      const rows = await supabaseFetch<Array<{ is_premium: boolean }>>(
        `vendors?id=eq.${encodeURIComponent(id)}&owner_id=eq.${encodeURIComponent(user.id)}&select=is_premium&limit=1`, {}, user.accessToken,
      )
      isPremium = rows[0]?.is_premium === true
    } catch {}
    return Response.json({
      ok: true,
      vendor: { id, name, description: description || "Street vendor", lat, lng, closingTime, isLive: true, isPremium, createdAt: Date.now() },
    }, { status: 201, headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    return errorResponse(error)
  }
}
