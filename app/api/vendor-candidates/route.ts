import { NextResponse } from "next/server"
import { SEEDED_CLAIMABLE_VENDORS } from "@/lib/claimable-vendors"
import { errorResponse, supabaseFetch } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

type PublicCatalogRow = {
  seed_id: string
  vendor_id: string
  name: string
  description: string
  category: string
  claim_status: "CLAIMED" | "PENDING_VERIFICATION" | "UNCLAIMED"
  latitude: number | null
  longitude: number | null
}

export async function GET() {
  try {
    const seedIds = SEEDED_CLAIMABLE_VENDORS.map(vendor => vendor.id)
    const catalog = await supabaseFetch<PublicCatalogRow[]>("rpc/get_public_seeded_vendor_catalog", {
      method: "POST",
      body: JSON.stringify({ p_seed_ids: seedIds }),
    })
    const bySeed = new Map(catalog.map(row => [row.seed_id, row]))
    const vendors = SEEDED_CLAIMABLE_VENDORS.map(candidate => {
      const row = bySeed.get(candidate.id)
      const latitude = row && typeof row.latitude === "number"
        && Number.isFinite(row.latitude) && row.latitude >= -90 && row.latitude <= 90
        ? row.latitude
        : undefined
      const longitude = row && typeof row.longitude === "number"
        && Number.isFinite(row.longitude) && row.longitude >= -180 && row.longitude <= 180
        ? row.longitude
        : undefined
      const status = row?.claim_status ?? "UNCLAIMED"
      return {
        ...candidate,
        ...(candidate.isFixedLocation ? { lat: latitude, lng: longitude } : {}),
        claimed: status !== "UNCLAIMED",
        claimStatus: status,
      }
    })
    return NextResponse.json({ ok: true, vendors }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    return errorResponse(error)
  }
}
