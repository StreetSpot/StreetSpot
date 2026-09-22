import { NextResponse } from "next/server"

/**
 * Account deletion is intentionally fail-closed until a durable auth/database
 * adapter is connected. This avoids claiming deletion or deleting the wrong
 * records based on a client-supplied identifier.
 */
export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      code: "ACCOUNT_DELETION_NOT_CONFIGURED",
      message:
        "Account deletion is not available until you are signed in with a connected account system. Use the ownership-confirmed request flow on /delete-account.",
    },
    { status: 501 },
  )
}

export function GET() {
  return NextResponse.json(
    { ok: false, message: "Use POST to request account deletion." },
    { status: 405, headers: { Allow: "POST" } },
  )
}
