import type { ParkingPlace, SortOption, SortOrigin } from '../types/parking'

interface Ranked<T> {
  place: T
  dist: number
}

function haversineKm(a: SortOrigin, b: { lat: number; lng: number }): number {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function sortPlaces<T extends ParkingPlace>(
  places: T[],
  sort: SortOption,
  origin: SortOrigin
): T[] {
  if (sort === 'default') return [...places]

  const ranked: Ranked<T>[] = places.map((place) => ({
    place,
    dist: haversineKm(origin, place.location),
  }))

  const distCmp = (a: Ranked<T>, b: Ranked<T>): number => a.dist - b.dist

  const ratingCmp = (a: Ranked<T>, b: Ranked<T>): number => {
    if (a.place.rating === 0 && b.place.rating === 0) return 0
    if (a.place.rating === 0) return 1
    if (b.place.rating === 0) return -1
    return b.place.rating - a.place.rating
  }

  const availabilityCmp = (a: Ranked<T>, b: Ranked<T>): number => {
    const aa = a.place.availability?.available ?? null
    const ba = b.place.availability?.available ?? null
    if (aa != null && ba != null) return ba - aa || distCmp(a, b)
    if (aa != null) return -1
    if (ba != null) return 1
    return distCmp(a, b) || ratingCmp(a, b)
  }

  const compare: (a: Ranked<T>, b: Ranked<T>) => number =
    sort === 'distance'
      ? (a, b) => distCmp(a, b) || ratingCmp(a, b)
      : (a, b) => availabilityCmp(a, b)

  return ranked.sort(compare).map((r) => r.place)
}