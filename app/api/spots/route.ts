import { NextRequest } from "next/server"
import { errorResponse, requireUser, supabaseFetch } from "@/lib/supabase-admin"
import type { SpotType } from "@/lib/community-store"

export const dynamic = "force-dynamic"

type SpotRow = {
  id: string
  name: string
  type: SpotType
  description: string | null
  latitude: number
  longitude: number
  event_date: string | null
  is_active: boolean
  claimed: boolean
  created_at: string
  updated_at: string
}

const spotTypes = new Set<SpotType>([
  "skate_park","skate_spot","food_truck","food_cart","popup_cart","pop_up","local_business",
  "street_artist","traveling_business","parking_saver","discovered_gem","vendor","artisan",
  "event","market","fair","block_party","flea_market","food_vendor","community","yard_sale",
  "party","charity","graduation","other",
])
const isSkateType = (type: SpotType) => type === "skate_park" || type === "skate_spot"

function toPublicSpot(row: SpotRow) {
  const createdAt = Date.parse(row.created_at)
  const claimed = row.claimed || isSkateType(row.type)
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    description: row.description ?? "",
    lat: row.latitude,
    lng: row.longitude,
    createdBy: "community",
    ...(row.event_date ? { eventDate: row.event_date } : {}),
    isActive: row.is_active,
    claimed,
    claimStatus: claimed ? "CLAIMED" as const : "UNCLAIMED" as const,
    createdAt: Number.isFinite(createdAt) ? createdAt : Date.now(),
  }
}

export async function GET() {
  try {
    const rows = await supabaseFetch<SpotRow[]>(
      "community_spots?is_active=eq.true&select=id,name,type,description,latitude,longitude,event_date,is_active,claimed,created_at,updated_at&order=created_at.desc&limit=500"
    )
    return Response.json({ spots: rows.map(toPublicSpot) }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request)
    const body = await request.json().catch(() => null) as Record<string, unknown> | null
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return Response.json({ ok: false, code: "INVALID_JSON" }, { status: 400 })
    }
    const name = typeof body.name === "string" ? body.name.trim() : ""
    const type = typeof body.type === "string" ? body.type as SpotType : null
    const description = typeof body.description === "string" ? body.description.trim() : ""
    const latitude = typeof body.lat === "number" ? body.lat : Number.NaN
    const longitude = typeof body.lng === "number" ? body.lng : Number.NaN
    const eventDate = typeof body.eventDate === "string" && body.eventDate.trim() ? body.eventDate : null
    if (name.length < 1 || name.length > 120 || !type || !spotTypes.has(type)) {
      return Response.json({ ok: false, code: "INVALID_SPOT" }, { status: 400 })
    }
    if (description.length > 2000 || !Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      return Response.json({ ok: false, code: "INVALID_SPOT_DETAILS" }, { status: 400 })
    }
    if (eventDate && !Number.isFinite(Date.parse(eventDate))) {
      return Response.json({ ok: false, code: "INVALID_EVENT_DATE" }, { status: 400 })
    }
    const rows = await supabaseFetch<SpotRow[]>("community_spots", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        name, type, description, latitude, longitude,
        created_by: user.id,
        event_date: eventDate,
        is_active: true,
      }),
    }, user.accessToken)
    return Response.json({ ok: true, spot: rows[0] ? toPublicSpot(rows[0]) : null }, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}
