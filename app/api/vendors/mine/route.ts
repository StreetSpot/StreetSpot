import { NextRequest } from "next/server"
import { errorResponse, requireUser, supabaseFetch } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

type VendorRow = {
  id: string
  name: string
  description: string | null
  is_live: boolean
  is_premium: boolean
  seed_id: string | null
  closing_time: string
  created_at: string
  vendor_locations: Array<{ latitude: number; longitude: number; is_live: boolean }>
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request)
    const rows = await supabaseFetch<VendorRow[]>(
      `vendors?owner_id=eq.${encodeURIComponent(user.id)}&select=id,name,description,is_live,is_premium,seed_id,closing_time,created_at,vendor_locations(latitude,longitude,is_live)&order=created_at.desc&limit=20`,
      {},
      user.accessToken,
    )
    const vendors = rows.map((row) => {
      const location = Array.isArray(row.vendor_locations) ? row.vendor_locations[0] : undefined
      const lat = location?.latitude
      const lng = location?.longitude
      return {
        id: row.id,
        name: row.name,
        description: row.description ?? "",
        lat: typeof lat === "number" ? lat : 0,
        lng: typeof lng === "number" ? lng : 0,
        closingTime: row.closing_time,
        isLive: row.is_live && location?.is_live === true,
        isPremium: row.is_premium === true,
        isClaimedCandidate: Boolean(row.seed_id),
        createdAt: Date.parse(row.created_at) || Date.now(),
      }
    })
    return Response.json({ ok: true, vendors }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    return errorResponse(error)
  }
}
