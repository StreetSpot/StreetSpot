import { errorResponse, supabaseFetch } from "@/lib/supabase-admin"

export const dynamic = "force-dynamic"

const isValidCoordinate = (latitude: number, longitude: number) =>
  Number.isFinite(latitude) &&
  Number.isFinite(longitude) &&
  latitude >= -90 &&
  latitude <= 90 &&
  longitude >= -180 &&
  longitude <= 180

const isValidClosingTime = (value: string) =>
  /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)

interface VendorRow {
  id: string
  name: string
  description: string | null
  is_live: boolean
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
      "vendors?is_live=eq.true&select=id,name,description,is_live,closing_time,created_at,vendor_locations(latitude,longitude,is_live)&order=created_at.desc"
    )

    const vendors = rows
      .filter((vendor) => vendor.is_live)
      .map((vendor) => {
        const locations = Array.isArray(vendor.vendor_locations)
          ? vendor.vendor_locations
          : []
        const location = locations.find((item) => item.is_live)
        const createdAt = Date.parse(vendor.created_at)
        if (
          !location ||
          !isValidCoordinate(location.latitude, location.longitude) ||
          !isValidClosingTime(vendor.closing_time) ||
          !Number.isFinite(createdAt)
        ) {
          return null
        }
        return {
          id: vendor.id,
          name: vendor.name,
          description: vendor.description ?? "Street vendor",
          lat: location.latitude,
          lng: location.longitude,
          closingTime: vendor.closing_time,
          isLive: true,
          // A database flag is not proof of an active, paid Stripe subscription.
          isPremium: false,
          createdAt,
        }
      })
      .filter((vendor): vendor is NonNullable<typeof vendor> => vendor !== null)

    return Response.json({ vendors }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    return errorResponse(error)
  }
}
