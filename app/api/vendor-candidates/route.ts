import { NextResponse } from "next/server"
import { SEEDED_CLAIMABLE_VENDORS } from "@/lib/claimable-vendors"
import { errorResponse, supabaseServiceFetch } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

type CandidateRow = { id: string; seed_id: string; owner_id: string | null }
type ClaimRow = { vendor_id: string; status: string }

export async function GET() {
  try {
    const seedIds = SEEDED_CLAIMABLE_VENDORS.map(vendor => vendor.id)
    const seedFilter = seedIds.map(value => encodeURIComponent(value)).join(",")
    const candidates = await supabaseServiceFetch<CandidateRow[]>(
      `vendors?seed_id=in.(${seedFilter})&select=id,seed_id,owner_id`,
    )
    const vendorIds = candidates.map(candidate => candidate.id)
    const claims = vendorIds.length
      ? await supabaseServiceFetch<ClaimRow[]>(`vendor_claims?vendor_id=in.(${vendorIds.join(",")})&status=eq.pending&select=vendor_id,status`)
      : []
    const vendorBySeed = new Map(candidates.map(candidate => [candidate.seed_id, candidate]))
    const pendingVendorIds = new Set(claims.map(claim => claim.vendor_id))
    const vendors = SEEDED_CLAIMABLE_VENDORS.map(candidate => {
      const row = vendorBySeed.get(candidate.id)
      const status = !row ? "UNCLAIMED"
        : row.owner_id ? "CLAIMED"
          : pendingVendorIds.has(row.id) ? "PENDING_VERIFICATION" : "UNCLAIMED"
      return { ...candidate, claimed: status !== "UNCLAIMED", claimStatus: status }
    })
    return NextResponse.json({ ok: true, vendors }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    return errorResponse(error)
  }
}
