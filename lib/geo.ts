export interface Coordinates { lat: number; lng: number }

export function hasValidCoordinates(value: Pick<Coordinates, "lat" | "lng">): boolean {
  return Number.isFinite(value.lat) && Number.isFinite(value.lng) &&
    value.lat >= -90 && value.lat <= 90 && value.lng >= -180 && value.lng <= 180
}
