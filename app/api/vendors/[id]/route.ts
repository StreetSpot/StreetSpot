import { NextRequest } from "next/server"
import { errorResponse, requireUser, supabaseFetch } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const isValidCoordinate = (latitude: number, longitude: number) =>
  Number.isFinite(latitude) && latitude >= -90 && latitude <= 90 &&
  Number.isFinite(longitude) && longitude >= -180 && longitude <= 180
const isValidClosingTime = (value: string) => /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request)
    const { id } = await context.params
    if (!uuidPattern.test(id)) return Response.json({ ok: false, code: "INVALID_VENDOR_ID" }, { status: 400 })
    const body = await request.json().catch(() => null) as Record<string, unknown> | null
    if (!body || typeof body !== "object" || Array.isArray(body)) return Response.json({ ok: false, code: "INVALID_JSON" }, { status: 400 })
    if (typeof body.isLive !== "boolean") return Response.json({ ok: false, code: "LIVE_STATUS_REQUIRED" }, { status: 400 })
    const isLive = body.isLive
    const closingTime = typeof body.closingTime === "string" ? body.closingTime : ""
    const description = typeof body.description === "string" ? body.description.trim() : ""
    const lat = typeof body.lat === "number" ? body.lat : Number.NaN
    const lng = typeof body.lng === "number" ? body.lng : Number.NaN
    if (!isValidClosingTime(closingTime) || description.length > 2000 || (isLive && !isValidCoordinate(lat, lng))) {
      return Response.json({ ok: false, code: "INVALID_VENDOR_UPDATE" }, { status: 400 })
    }
    const ownedRows = await supabaseFetch<Array<{ seed_id: string | null }>>(
      `vendors?id=eq.${encodeURIComponent(id)}&owner_id=eq.${encodeURIComponent(user.id)}&select=seed_id&limit=1`, {}, user.accessToken,
    )
    if (!ownedRows[0]) return Response.json({ ok: false, code: "VENDOR_NOT_FOUND" }, { status: 404 })
    if (isLive && description.length < 20) return Response.json({ ok: false, code: "DESCRIPTION_REQUIRED", error: "Add an accurate business description of at least 20 characters before going live." }, { status: 400 })
    if (isLive && ownedRows[0].seed_id && description.toLowerCase().includes("unclaimed candidate")) return Response.json({ ok: false, code: "PROFILE_SETUP_REQUIRED", error: "Replace the catalog placeholder with an accurate business description before going live." }, { status: 400 })
    await supabaseFetch<boolean>("rpc/set_vendor_live", {
      method: "POST",
      body: JSON.stringify({ p_vendor_id: id, p_is_live: isLive, p_lat: Number.isFinite(lat) ? lat : null, p_lng: Number.isFinite(lng) ? lng : null, p_closing_time: closingTime, p_description: description }),
    }, user.accessToken)
    let isPremium = false
    let name: string | undefined
    try {
      const rows = await supabaseFetch<Array<{ is_premium: boolean; name: string }>>(
        `vendors?id=eq.${encodeURIComponent(id)}&owner_id=eq.${encodeURIComponent(user.id)}&select=is_premium,name&limit=1`, {}, user.accessToken,
      )
      isPremium = rows[0]?.is_premium === true
      name = rows[0]?.name
    } catch {}
    return Response.json({ ok: true, vendor: { id, name, isPremium, isLive, description, closingTime, ...(isLive ? { lat, lng } : {}) } }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    return errorResponse(error)
  }
}
