import { NextRequest } from "next/server"
import { errorResponse, requireUser, supabaseFetch } from "@/lib/supabase-admin"

const SPOT_TYPES = new Set([
  "skate_park", "skate_spot", "food_truck", "popup_cart", "vendor", "artisan",
  "event", "market", "fair", "block_party", "flea_market", "food_vendor",
  "community", "yard_sale", "party", "charity", "graduation", "other",
])

type SpotRow = {
  id: string
  name: string
  type: string
  description: string | null
  lat: number
  lng: number
  created_by: string
  event_date: string | null
  is_active: boolean
  claimed: boolean
  claimed_by: string | null
  claimed_at: string | null
  created_at: string
  updated_at: string
}

function asSpot(row: SpotRow) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    description: row.description ?? "",
    lat: row.lat,
    lng: row.lng,
    createdBy: row.created_by,
    eventDate: row.event_date ?? undefined,
    isActive: row.is_active,
    claimed: row.claimed,
    claimedBy: row.claimed_by ?? undefined,
    claimedAt: row.claimed_at ? Date.parse(row.claimed_at) : undefined,
    createdAt: Date.parse(row.created_at),
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const type = searchParams.get("type")
    const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? 100) || 100, 1), 200)
    const offset = Math.max(Number(searchParams.get("offset") ?? 0) || 0, 0)
    const filters = ["is_active=eq.true"]
    if (type && SPOT_TYPES.has(type)) filters.push(`type=eq.${encodeURIComponent(type)}`)
    const rows = await supabaseFetch<SpotRow[]>(
      `community_spots?select=*&${filters.join("&")}&order=created_at.desc&limit=${limit}&offset=${offset}`,
      { headers: { Prefer: "count=exact" } },
    )
    return Response.json({ ok: true, spots: rows.map(asSpot), limit, offset })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request)
    const body = (await request.json()) as Record<string, unknown>
    const name = typeof body.name === "string" ? body.name.trim() : ""
    const type = typeof body.type === "string" ? body.type : ""
    const description = typeof body.description === "string" ? body.description.trim() : ""
    const lat = typeof body.lat === "number" ? body.lat : Number(body.lat)
    const lng = typeof body.lng === "number" ? body.lng : Number(body.lng)
    const eventDate = typeof body.eventDate === "string" && body.eventDate ? body.eventDate : null
    if (!name || name.length > 160 || !SPOT_TYPES.has(type) || !Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return Response.json({ ok: false, message: "Invalid spot details." }, { status: 400 })
    }
    const [row] = await supabaseFetch<SpotRow[]>("community_spots", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        name, type, description, lat, lng, event_date: eventDate,
        created_by: user.id, is_active: true,
        claimed: type === "skate_park" || type === "skate_spot",
      }),
    })
    return Response.json({ ok: true, spot: asSpot(row) }, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireUser(request)
    const id = request.nextUrl.searchParams.get("id")
    if (!id) return Response.json({ ok: false, message: "Missing spot id." }, { status: 400 })
    await supabaseFetch(`community_spots?id=eq.${encodeURIComponent(id)}&created_by=eq.${encodeURIComponent(user.id)}`, { method: "DELETE" })
    return Response.json({ ok: true })
  } catch (error) {
    return errorResponse(error)
  }
}
