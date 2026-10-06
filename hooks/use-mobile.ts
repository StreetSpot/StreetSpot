import { useSyncExternalStore } from 'react'

const MOBILE_QUERY = '(max-width: 767px)'
const subscribe = (callback: () => void) => {
  const media = window.matchMedia(MOBILE_QUERY)
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}
const getSnapshot = () => window.matchMedia(MOBILE_QUERY).matches

export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
