import { NextRequest } from "next/server"
import { errorResponse, requireUser, supabaseFetch } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request)
    const entitlements = await supabaseFetch<Array<{
      feature: string
      status: "active" | "inactive" | "past_due" | "canceled"
      current_period_end: string | null
      updated_at: string
    }>>(
      `account_entitlements?user_id=eq.${encodeURIComponent(user.id)}&select=feature,status,current_period_end,updated_at&order=updated_at.desc`,
      {},
      user.accessToken,
    )
    const now = Date.now()
    const active = entitlements.filter((item) => {
      if (item.status === "active") return !item.current_period_end || Date.parse(item.current_period_end) > now
      return item.status === "past_due" && Boolean(item.current_period_end) && Date.parse(item.current_period_end!) > now
    })
    const pastDueFeatures = active.filter(item => item.status === "past_due").map(item => item.feature)
    return Response.json({ ok: true, entitlements, activeFeatures: active.map((item) => item.feature), pastDueFeatures }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    return errorResponse(error)
  }
}
