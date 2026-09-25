import { NextRequest } from "next/server"
import { errorResponse, requireUser, supabaseFetch } from "@/lib/supabase-admin"

type SpotRow = {
  id: string
  claimed: boolean
  claimed_by: string | null
  claimed_at: string | null
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request)
    const body = (await request.json()) as Record<string, unknown>
    const spotId = typeof body.spotId === "string" ? body.spotId.trim() : ""
    if (!spotId) return Response.json({ ok: false, message: "Missing spot id." }, { status: 400 })

    const [spot] = await supabaseFetch<SpotRow[]>(
      `community_spots?id=eq.${encodeURIComponent(spotId)}&select=id,claimed,claimed_by,claimed_at`,
    )
    if (!spot) return Response.json({ ok: false, message: "Spot not found." }, { status: 404 })
    if (spot.claimed) return Response.json({ ok: false, message: "Spot is already claimed." }, { status: 409 })

    const [updated] = await supabaseFetch<SpotRow[]>(
      `community_spots?id=eq.${encodeURIComponent(spotId)}&claimed=eq.false`,
      {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ claimed: true, claimed_by: user.id, claimed_at: new Date().toISOString() }),
      },
    )
    if (!updated) return Response.json({ ok: false, message: "Spot was claimed by another user." }, { status: 409 })
    return Response.json({ ok: true, spot: updated })
  } catch (error) {
    return errorResponse(error)
  }
}
