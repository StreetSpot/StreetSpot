/** Default map center: Manning, SC (StreetSpot home base) */
export const DEFAULT_MAP_CENTER: [number, number] = [33.6952, -80.2109]
export const DEFAULT_MAP_ZOOM = 13

export function getUserPosition(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(null)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  })
}
