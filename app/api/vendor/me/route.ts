import { NextRequest } from "next/server"
import { errorResponse, requireUser, supabaseFetch } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

type VendorRow = {
  id: string
  name: string
  description: string | null
  category: string | null
  is_live: boolean
  is_premium: boolean
  premium_tier: "bronze" | "silver" | "gold" | null
  closing_time: string
  created_at: string
  vendor_locations: Array<{ latitude: number; longitude: number; is_live: boolean }>
}

type EntitlementRow = {
  feature: string
  status: "active" | "inactive" | "past_due" | "canceled"
  current_period_end: string | null
}

const encode = (value: string) => encodeURIComponent(value)
const validCoordinate = (value: unknown, min: number, max: number) =>
  typeof value === "number" && Number.isFinite(value) && value >= min && value <= max
const validClosingTime = (value: unknown) =>
  typeof value === "string" && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)

function bearerToken(request: NextRequest) {
  return request.headers.get("authorization")?.match(/^Bearer\s+(\S+)$/i)?.[1] ?? ""
}

function activeTier(rows: EntitlementRow[]): "bronze" | "silver" | "gold" | "none" {
  const now = Date.now()
  const active = rows.filter((row) =>
    (row.status === "active" && (!row.current_period_end || Date.parse(row.current_period_end) > now)) ||
    (row.status === "past_due" && !!row.current_period_end && Date.parse(row.current_period_end) > now)
  )
  if (active.some((row) => row.feature === "vendor_gold")) return "gold"
  if (active.some((row) => row.feature === "vendor_silver")) return "silver"
  if (active.some((row) => row.feature === "vendor_bronze")) return "bronze"
  return "none"
}

async function loadOwnedVendor(userId: string) {
  const rows = await supabaseFetch<VendorRow[]>(
    `vendors?owner_id=eq.${encode(userId)}&select=id,name,description,category,is_live,is_premium,premium_tier,closing_time,created_at,vendor_locations(latitude,longitude,is_live)&order=created_at.desc&limit=1`
  )
  const row = rows[0]
  if (!row) return null
  const locations = Array.isArray(row.vendor_locations) ? row.vendor_locations : []
  const location = locations[0]
  if (!location) return null
  return {
    id: row.id, name: row.name, description: row.description ?? "", category: row.category ?? "vendor",
    isLive: row.is_live && location.is_live, isPremium: false, premiumTier: "none" as const,
    closingTime: row.closing_time, createdAt: Date.parse(row.created_at),
    lat: location.latitude, lng: location.longitude,
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request)
    const [vendor, entitlements] = await Promise.all([
      loadOwnedVendor(user.id),
      supabaseFetch<EntitlementRow[]>(
        `account_entitlements?user_id=eq.${encode(user.id)}&feature=in.(vendor_bronze,vendor_silver,vendor_gold)&select=feature,status,current_period_end`
      ),
    ])
    const tier = activeTier(entitlements)
    return Response.json({
      ok: true,
      user: { id: user.id, email: user.email ?? null },
      vendor: vendor ? { ...vendor, isPremium: tier !== "none", premiumTier: tier } : null,
      tier,
    }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request)
    const token = bearerToken(request)
    if (!token) return Response.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 })
    const body = await request.json().catch(() => null) as Record<string, unknown> | null
    const name = typeof body?.name === "string" ? body.name.trim() : ""
    const description = typeof body?.description === "string" ? body.description.trim() : ""
    const category = typeof body?.category === "string" ? body.category.trim().slice(0, 80) : "vendor"
    const latitude = body?.latitude
    const longitude = body?.longitude
    const closingTime = body?.closingTime
    if (!name || name.length > 160 || description.length < 20 || description.length > 2000 ||
        !validCoordinate(latitude, -90, 90) || !validCoordinate(longitude, -180, 180) ||
        !validClosingTime(closingTime)) {
      return Response.json({ ok: false, code: "INVALID_VENDOR_PROFILE", message: "Add a business name, an accurate description of at least 20 characters, a valid location, and a closing time." }, { status: 400 })
    }

    const entitlements = await supabaseFetch<EntitlementRow[]>(
      `account_entitlements?user_id=eq.${encode(user.id)}&feature=in.(vendor_bronze,vendor_silver,vendor_gold)&select=feature,status,current_period_end`
    )
    if (activeTier(entitlements) === "none") {
      return Response.json({ ok: false, code: "ACTIVE_SUBSCRIPTION_REQUIRED", message: "Choose a monthly Premier plan below before publishing your business live." }, { status: 402 })
    }
    const existing = await supabaseFetch<{ id: string }[]>(
      `vendors?owner_id=eq.${encode(user.id)}&select=id&limit=1`
    )
    if (existing[0]) {
      await supabaseFetch<boolean>("rpc/set_vendor_live", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          p_vendor_id: existing[0].id, p_is_live: true, p_lat: latitude, p_lng: longitude,
          p_closing_time: closingTime, p_description: description,
        }),
      })
    } else {
      await supabaseFetch<string>("rpc/publish_vendor", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          p_name: name, p_description: description, p_category: category,
          p_lat: latitude, p_lng: longitude, p_closing_time: closingTime,
        }),
      })
    }

    const [vendor, updatedEntitlements] = await Promise.all([
      loadOwnedVendor(user.id),
      supabaseFetch<EntitlementRow[]>(`account_entitlements?user_id=eq.${encode(user.id)}&feature=in.(vendor_bronze,vendor_silver,vendor_gold)&select=feature,status,current_period_end`),
    ])
    const tier = activeTier(updatedEntitlements)
    return Response.json({ ok: true, vendor: vendor ? { ...vendor, isPremium: tier !== "none", premiumTier: tier } : null, tier }, { status: 200, headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireUser(request)
    const token = bearerToken(request)
    if (!token) return Response.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 })
    const body = await request.json().catch(() => null) as Record<string, unknown> | null
    if (body?.isLive !== false) {
      return Response.json({ ok: false, code: "INVALID_STATUS_CHANGE" }, { status: 400 })
    }
    const existing = await supabaseFetch<{ id: string; description: string | null; closing_time: string }[]>(
      `vendors?owner_id=eq.${encode(user.id)}&select=id,description,closing_time&limit=1`
    )
    if (!existing[0]) return Response.json({ ok: false, code: "VENDOR_NOT_FOUND" }, { status: 404 })
    const locationRows = await supabaseFetch<{ latitude: number; longitude: number }[]>(
      `vendor_locations?vendor_id=eq.${encode(existing[0].id)}&select=latitude,longitude&limit=1`
    )
    const location = locationRows[0]
    if (!location) return Response.json({ ok: false, code: "VENDOR_LOCATION_NOT_FOUND" }, { status: 409 })
    await supabaseFetch<boolean>("rpc/set_vendor_live", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        p_vendor_id: existing[0].id, p_is_live: false, p_lat: location.latitude,
        p_lng: location.longitude, p_closing_time: existing[0].closing_time,
        p_description: existing[0].description ?? "",
      }),
    })
    return Response.json({ ok: true, isLive: false }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    return errorResponse(error)
  }
}
