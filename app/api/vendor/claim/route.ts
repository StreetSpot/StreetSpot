import { NextRequest } from "next/server"
import { errorResponse, requireUser, supabaseAuthAdmin, supabaseFetch } from "@/lib/supabase-admin"

const id = (value: string) => encodeURIComponent(value)

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request)
    const body = await request.json()
    const vendorId = typeof body.vendorId === "string" ? body.vendorId : ""
    const note = typeof body.note === "string" ? body.note.trim().slice(0, 2000) : null
    if (!vendorId) return Response.json({ ok: false, code: "VENDOR_ID_REQUIRED" }, { status: 400 })
    const vendor = await supabaseFetch<unknown[]>(`vendors?id=eq.${id(vendorId)}&select=id,owner_id`)
    if (!vendor.length) return Response.json({ ok: false, code: "VENDOR_NOT_FOUND" }, { status: 404 })
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
    const body = await request.json()
    const claimId = typeof body.claimId === "string" ? body.claimId : ""
    const status = body.status === "approved" || body.status === "rejected" ? body.status : ""
    if (!claimId || !status) return Response.json({ ok: false, code: "INVALID_CLAIM_UPDATE" }, { status: 400 })
    const claims = await supabaseFetch<{ id: string; vendor_id: string; claimant_id: string }[]>(`vendor_claims?id=eq.${id(claimId)}&select=id,vendor_id,claimant_id&limit=1`)
    const claim = claims[0]
    if (!claim) return Response.json({ ok: false, code: "CLAIM_NOT_FOUND" }, { status: 404 })
    const updated = await supabaseFetch<unknown[]>(`vendor_claims?id=eq.${id(claimId)}&claimant_id=eq.${id(user.id)}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ status, reviewed_at: new Date().toISOString() }) })
    if (status === "approved") await supabaseFetch(`vendors?id=eq.${id(claim.vendor_id)}&owner_id=is.null`, { method: "PATCH", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ owner_id: user.id }) })
    return Response.json({ ok: true, claim: updated?.[0] ?? null })
  } catch (error) {
    return errorResponse(error)
  }
}
