import { NextRequest } from "next/server"
import { errorResponse, requireUser, supabaseFetch } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

type Purchase = {
  id: string
  tier: "invite" | "hosted" | "signature"
  status: "paid" | "refunded" | "disputed"
  guest_limit: number
  stripe_checkout_session_id: string
  created_at: string
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request)
    const purchases = await supabaseFetch<Purchase[]>(
      `event_hosting_purchases?user_id=eq.${encodeURIComponent(user.id)}&event_id=is.null&status=eq.paid&select=id,tier,status,guest_limit,stripe_checkout_session_id,created_at&order=created_at.desc`
    )
    return Response.json({ ok: true, purchases }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    return errorResponse(error)
  }
}
