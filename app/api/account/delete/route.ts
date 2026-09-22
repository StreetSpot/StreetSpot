import { NextRequest } from "next/server"
import { errorResponse, requireUser, supabaseAuthAdmin, supabaseFetch } from "@/lib/supabase-admin"

const ownedTables = ["messages", "conversations", "vendor_claims", "favorites", "reviews", "events", "parking_saves", "travel_logs", "profiles"]

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request)
    for (const table of ownedTables) {
      try {
        await supabaseFetch(`${table}?user_id=eq.${encodeURIComponent(user.id)}`, { method: "DELETE", headers: { Prefer: "return=minimal" } })
      } catch (error) {
        if (!(error instanceof Error && error.message.includes("(404)"))) throw error
      }
    }
    await supabaseAuthAdmin(`users/${encodeURIComponent(user.id)}`, { method: "DELETE" })
    return Response.json({ ok: true, deletedUserId: user.id })
  } catch (error) {
    return errorResponse(error)
  }
}

export function GET() {
  return Response.json({ ok: false, message: "Use POST to request account deletion." }, { status: 405, headers: { Allow: "POST" } })
}
