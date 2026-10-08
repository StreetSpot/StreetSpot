import { errorResponse, supabaseFetch } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

interface VendorRow {
  id: string
  name: string
  description: string | null
  is_live: boolean
  is_premium: boolean
  closing_time: string
  created_at: string
  vendor_locations: Array<{
    latitude: number
    longitude: number
    is_live: boolean
  }>
}

export async function GET() {
  try {
    const rows = await supabaseFetch<VendorRow[]>(
      "vendors?is_live=eq.true&select=id,name,description,is_live,is_premium,closing_time,created_at,vendor_locations(latitude,longitude,is_live)&order=created_at.desc"
    )

    const vendors = rows
      .filter((vendor) => vendor.is_live)
      .map((vendor) => {
        const location = vendor.vendor_locations.find((item) => item.is_live)
        if (!location) return null
        return {
          id: vendor.id,
          name: vendor.name,
          description: vendor.description ?? "Street vendor",
          lat: location.latitude,
          lng: location.longitude,
          closingTime: vendor.closing_time,
          isLive: true,
          isPremium: vendor.is_premium,
          createdAt: Date.parse(vendor.created_at),
        }
      })
      .filter((vendor): vendor is NonNullable<typeof vendor> => vendor !== null)

    return Response.json({ vendors }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    return errorResponse(error)
  }
}
