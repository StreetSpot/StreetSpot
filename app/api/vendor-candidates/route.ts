import { NextResponse } from "next/server"
import { SEEDED_CLAIMABLE_VENDORS } from "@/lib/claimable-vendors"
import { errorResponse, supabaseServiceFetch } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

type ClaimStatusRow = { seed_id: string; claim_status: "CLAIMED" | "PENDING_VERIFICATION" | "UNCLAIMED" }

export async function GET() {
  try {
    const seedIds = SEEDED_CLAIMABLE_VENDORS.map(vendor => vendor.id)
    const statuses = await supabaseServiceFetch<ClaimStatusRow[]>("rpc/get_seeded_vendor_claim_status", {
      method: "POST",
      body: JSON.stringify({ p_seed_ids: seedIds }),
    })
    const statusBySeed = new Map(statuses.map(row => [row.seed_id, row.claim_status]))
    const vendors = SEEDED_CLAIMABLE_VENDORS.map(candidate => {
      const status = statusBySeed.get(candidate.id) ?? "UNCLAIMED"
      return { ...candidate, claimed: status !== "UNCLAIMED", claimStatus: status }
    })
    return NextResponse.json({ ok: true, vendors }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    return errorResponse(error)
  }
}
