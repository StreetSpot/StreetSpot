import { NextRequest, NextResponse } from "next/server"
import { errorResponse, requireUser } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request)
    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email ?? "", role: user.role ?? "user" } }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    return errorResponse(error)
  }
}
