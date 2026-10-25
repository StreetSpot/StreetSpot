import { NextRequest } from "next/server"
import { errorResponse, requireUser, supabaseFetch } from "@/lib/supabase-admin"

const id = (value: string) => encodeURIComponent(value)
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const seedPattern = /^seed-[a-z0-9-]{1,120}$/

export const dynamic = "force-dynamic"

type SeedClaimStatus = "CLAIMED" | "PENDING_VERIFICATION" | "UNCLAIMED"

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
    const seedCandidate = seedPattern.test(vendorId)
    if (!uuidPattern.test(vendorId) && !seedCandidate) return Response.json({ ok: false, code: "VENDOR_ID_REQUIRED" }, { status: 400 })
    if (note && note.length > 2000) return Response.json({ ok: false, code: "NOTE_TOO_LONG" }, { status: 400 })

    let resolvedVendorId = vendorId
    let seedClaimStatus: SeedClaimStatus | null = null
    let ownerId: string | null = null

    if (seedCandidate) {
      const candidates = await supabaseFetch<Array<{ seed_id: string; vendor_id: string; claim_status: SeedClaimStatus }>>(
        "rpc/get_public_seeded_vendor_catalog",
        { method: "POST", body: JSON.stringify({ p_seed_ids: [vendorId] }) },
        user.accessToken,
      )
      if (!candidates[0]) return Response.json({ ok: false, code: "VENDOR_NOT_FOUND" }, { status: 404 })
      seedClaimStatus = candidates[0].claim_status
      if (seedClaimStatus === "CLAIMED") return Response.json({ ok: false, code: "VENDOR_ALREADY_CLAIMED" }, { status: 409 })
      resolvedVendorId = candidates[0].vendor_id
    } else {
      const vendor = await supabaseFetch<Array<{ id: string; owner_id: string | null }>>(
        `vendors?id=eq.${id(vendorId)}&select=id,owner_id&limit=1`, {}, user.accessToken,
      )
      if (!vendor[0]) return Response.json({ ok: false, code: "VENDOR_NOT_FOUND" }, { status: 404 })
      ownerId = vendor[0].owner_id
    }
    if (ownerId) return Response.json({ ok: false, code: "VENDOR_ALREADY_CLAIMED" }, { status: 409 })

    const existing = await supabaseFetch<Array<{ id: string; status: string }>>(
      `vendor_claims?vendor_id=eq.${id(resolvedVendorId)}&claimant_id=eq.${id(user.id)}&status=in.(pending,approved)&select=id,status&limit=1`,
      {}, user.accessToken,
    )
    if (existing.length) return Response.json({ ok: false, code: "CLAIM_ALREADY_EXISTS", claim: existing[0] }, { status: 409 })

    if (seedCandidate && seedClaimStatus === "PENDING_VERIFICATION") {
      return Response.json({ ok: false, code: "CLAIM_PENDING_REVIEW" }, { status: 409 })
    }

    const claims = await supabaseFetch<Array<{ id: string; status: string }>>("vendor_claims", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ vendor_id: resolvedVendorId, claimant_id: user.id, status: "pending", note }),
    }, user.accessToken)
    return Response.json({ ok: true, claim: claims?.[0] ?? null }, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireUser(request)
    const role = user.role
    if (role !== "admin" && role !== "staff") return Response.json({ ok: false, code: "FORBIDDEN" }, { status: 403 })
    let body: Record<string, unknown>
    try {
      const value: unknown = await request.json()
      if (!value || typeof value !== "object" || Array.isArray(value)) return Response.json({ ok: false, code: "INVALID_JSON" }, { status: 400 })
      body = value as Record<string, unknown>
    } catch { return Response.json({ ok: false, code: "INVALID_JSON" }, { status: 400 }) }
    const claimId = typeof body.claimId === "string" ? body.claimId : ""
    const status = body.status === "approved" || body.status === "rejected" ? body.status : ""
    if (!uuidPattern.test(claimId) || !status) return Response.json({ ok: false, code: "INVALID_CLAIM_UPDATE" }, { status: 400 })
    const claims = await supabaseFetch<Array<{ id: string; vendor_id: string; claimant_id: string; status: string }>>(
      `vendor_claims?id=eq.${id(claimId)}&select=id,vendor_id,claimant_id,status&limit=1`, {}, user.accessToken,
    )
    const claim = claims[0]
    if (!claim) return Response.json({ ok: false, code: "CLAIM_NOT_FOUND" }, { status: 404 })
    if (claim.status !== "pending") return Response.json({ ok: false, code: "CLAIM_ALREADY_REVIEWED" }, { status: 409 })
    if (status === "approved") {
      await supabaseFetch<boolean>("rpc/approve_vendor_claim", {
        method: "POST",
        body: JSON.stringify({ p_claim_id: claimId }),
      }, user.accessToken)
      return Response.json({ ok: true, claim: { ...claim, status: "approved", reviewed_at: new Date().toISOString() } })
    }
    const updated = await supabaseFetch<Array<Record<string, unknown>>>(
      `vendor_claims?id=eq.${id(claimId)}&status=eq.pending`,
      { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ status, reviewed_at: new Date().toISOString() }) },
      user.accessToken,
    )
    if (!updated.length) return Response.json({ ok: false, code: "CLAIM_ALREADY_REVIEWED" }, { status: 409 })
    return Response.json({ ok: true, claim: updated[0] })
  } catch (error) {
    return errorResponse(error)
  }
}
