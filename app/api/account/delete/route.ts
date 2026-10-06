import { NextRequest } from "next/server"
import { errorResponse, requireUser } from "@/lib/supabase-admin"

export async function POST(request: NextRequest) {
  try {
    await requireUser(request)
    return Response.json({
      ok: false,
      code: "ACCOUNT_DELETION_NOT_CONFIGURED",
      message: "Account deletion is unavailable until the backend data ownership and deletion policy are configured.",
    }, { status: 503 })
  } catch (error) {
    return errorResponse(error)
  }
}

export function GET() {
  return Response.json({ ok: false, message: "Use POST to request account deletion." }, { status: 405, headers: { Allow: "POST" } })
}
