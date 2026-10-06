import { NextRequest } from "next/server"
import { errorResponse, requireUser, supabaseAuthAdmin, supabaseFetch } from "@/lib/supabase-admin"

const id = (value: string) => encodeURIComponent(value)
const safeId = (value: string) => /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(value)

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request)
    let body: Record<string, unknown>
    try {
      const value: unknown = await request.json()
      if (!value || typeof value !== "object" || Array.isArray(value)) return Response.json({ ok: false, code: "INVALID_JSON" }, { status: 400 })
      body = value as Record<string, unknown>
    } catch { return Response.json({ ok: false, code: "INVALID_JSON" }, { status: 400 }) }
    const vendorId = typeof body.vendorId === "string" ? body.vendorId : ""
    const note = typeof body.note === "string" ? body.note.trim() : null
    if (!safeId(vendorId)) return Response.json({ ok: false, code: "VENDOR_ID_REQUIRED" }, { status: 400 })
    if (note && note.length > 2000) return Response.json({ ok: false, code: "NOTE_TOO_LONG" }, { status: 400 })
    const vendor = await supabaseFetch<{ id: string; owner_id: string | null }[]>(`vendors?id=eq.${id(vendorId)}&select=id,owner_id`)
    if (!vendor.length) return Response.json({ ok: false, code: "VENDOR_NOT_FOUND" }, { status: 404 })
    if (vendor[0].owner_id) return Response.json({ ok: false, code: "VENDOR_ALREADY_CLAIMED" }, { status: 409 })
    const existing = await supabaseFetch<unknown[]>(`vendor_claims?vendor_id=eq.${id(vendorId)}&claimant_id=eq.${id(user.id)}&status=in.(pending,approved)&select=id,status&limit=1`)
    if (existing.length) return Response.json({ ok: false, code: "CLAIM_ALREADY_EXISTS", claim: existing[0] }, { status: 409 })
    const claims = await supabaseFetch<unknown[]>("vendor_claims", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify({ vendor_id: vendorId, claimant_id: user.id, status: "pending", note }) })
    return Response.json({ ok: true, claim: claims?.[0] ?? null }, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireUser(request)
    const adminUser = await supabaseAuthAdmin(`users/${encodeURIComponent(user.id)}`) as { app_metadata?: { role?: string } }
    const role = adminUser.app_metadata?.role
    if (role !== "admin" && role !== "staff") return Response.json({ ok: false, code: "FORBIDDEN" }, { status: 403 })
    let body: Record<string, unknown>
    try {
      const value: unknown = await request.json()
      if (!value || typeof value !== "object" || Array.isArray(value)) return Response.json({ ok: false, code: "INVALID_JSON" }, { status: 400 })
      body = value as Record<string, unknown>
    } catch { return Response.json({ ok: false, code: "INVALID_JSON" }, { status: 400 }) }
    const claimId = typeof body.claimId === "string" ? body.claimId : ""
    const status = body.status === "approved" || body.status === "rejected" ? body.status : ""
    if (!safeId(claimId) || !status) return Response.json({ ok: false, code: "INVALID_CLAIM_UPDATE" }, { status: 400 })
    const claims = await supabaseFetch<{ id: string; vendor_id: string; claimant_id: string; status: string }[]>(`vendor_claims?id=eq.${id(claimId)}&select=id,vendor_id,claimant_id,status&limit=1`)
    const claim = claims[0]
    if (!claim) return Response.json({ ok: false, code: "CLAIM_NOT_FOUND" }, { status: 404 })
    if (claim.status !== "pending") return Response.json({ ok: false, code: "CLAIM_ALREADY_REVIEWED" }, { status: 409 })
    if (status === "approved") {
      return Response.json({ ok: false, code: "CLAIM_APPROVAL_NOT_CONFIGURED", message: "Atomic ownership transfer is not configured for this backend." }, { status: 503 })
    }
    const updated = await supabaseFetch<unknown[]>(`vendor_claims?id=eq.${id(claimId)}&status=eq.pending`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ status, reviewed_at: new Date().toISOString() }) })
    if (!updated.length) return Response.json({ ok: false, code: "CLAIM_ALREADY_REVIEWED" }, { status: 409 })
    return Response.json({ ok: true, claim: updated?.[0] ?? null })
  } catch (error) {
    return errorResponse(error)
  }
}
