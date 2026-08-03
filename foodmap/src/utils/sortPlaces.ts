import type { FoodPlace, SortOption, SortOrigin } from '../types/food'

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

export function sortPlaces<T extends FoodPlace>(
  places: T[],
  sort: SortOption,
  origin: SortOrigin
): T[] {
  if (sort === 'default') return [...places]

  const ranked: Ranked<T>[] = places.map((place) => ({
    place,
    dist: haversineKm(origin, place.location),
  }))

  const ratingCmp = (a: Ranked<T>, b: Ranked<T>): number => {
    if (a.place.rating === 0 && b.place.rating === 0) return 0
    if (a.place.rating === 0) return 1
    if (b.place.rating === 0) return -1
    return b.place.rating - a.place.rating
  }

  const priceCmp = (a: Ranked<T>, b: Ranked<T>): number => {
    const pa = a.place.price_level
    const pb = b.place.price_level
    if (pa == null && pb == null) return 0
    if (pa == null) return 1
    if (pb == null) return -1
    return sort === 'price_asc' ? pa - pb : pb - pa
  }

  const distCmp = (a: Ranked<T>, b: Ranked<T>): number => a.dist - b.dist

  const compare: (a: Ranked<T>, b: Ranked<T>) => number =
    sort === 'rating'
      ? (a, b) => ratingCmp(a, b) || distCmp(a, b)
      : sort === 'distance'
        ? (a, b) => distCmp(a, b) || ratingCmp(a, b)
        : (a, b) => priceCmp(a, b) || ratingCmp(a, b) || distCmp(a, b)

  return ranked.sort(compare).map((r) => r.place)
}
