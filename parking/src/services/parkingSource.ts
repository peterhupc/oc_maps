import type { ParkingPlace } from '../types/parking'
import { categoriesToQueries } from '../utils/categoryMap'
import { loadMaps } from './mapsLoader'
import { getCachedPlace, setPlace } from './cache'
import { findAvailabilityLot, getAvailabilityLots } from './availability'

export interface FetchOptions {
  center: { lat: number; lng: number }
  radiusKm: number
  categories: string[]
  openNow: boolean
}

const PHOTO_MAX_WIDTH = 400
const MAX_KEYWORD_QUERIES = 8

async function withPlaceService<T>(
  cb: (svc: google.maps.places.PlacesService) => Promise<T>
): Promise<T> {
  const maps = await loadMaps()
  const div = document.createElement('div')
  const svc = new maps.places.PlacesService(div)
  return cb(svc)
}

function textSearch(
  svc: google.maps.places.PlacesService,
  opts: google.maps.places.TextSearchRequest
): Promise<google.maps.places.PlaceResult[]> {
  return new Promise((resolve, reject) => {
    svc.textSearch(opts, (results, status) => {
      if (status === 'OK') resolve(results ?? [])
      else if (status === 'ZERO_RESULTS') resolve([])
      else reject(new Error(`Places textSearch 失敗：${status}`))
    })
  })
}

function placeDetails(
  svc: google.maps.places.PlacesService,
  placeId: string
): Promise<google.maps.places.PlaceResult | null> {
  return new Promise((resolve) => {
    svc.getDetails(
      { placeId, fields: ['place_id', 'name', 'formatted_address', 'photos', 'opening_hours', 'website'] },
      (result, status) => {
        resolve(status === 'OK' && result ? result : null)
      }
    )
  })
}

function photoUrls(photos: google.maps.places.PlacePhoto[] | string[] | undefined): string[] {
  if (!photos) return []
  return photos
    .map((p) => (typeof p === 'string' ? p : p.getUrl({ maxWidth: PHOTO_MAX_WIDTH })))
    .slice(0, 3)
}

export async function fetchParkingPlaces(opts: FetchOptions): Promise<ParkingPlace[]> {
  const lots = await getAvailabilityLots()

  const results = await withPlaceService(async (svc) => {
    const queries = categoriesToQueries(opts.categories)

    const base: google.maps.places.TextSearchRequest = {
      location: opts.center,
      radius: Math.round(opts.radiusKm * 1000),
      type: 'parking',
    }

    const keywords =
      queries.length > 0 && queries.length <= MAX_KEYWORD_QUERIES ? queries : ['停車場']
    const all: google.maps.places.PlaceResult[] = []
    for (const kw of keywords) {
      try {
        const res = await textSearch(svc, { ...base, query: kw })
        all.push(...res)
      } catch (err) {
        console.warn('搜尋失敗：', kw, err)
      }
    }
    return all
  })

  const seen = new Set<string>()
  const out: ParkingPlace[] = []

  for (const r of results) {
    const id = r.place_id ?? ''
    if (!id || seen.has(id)) continue
    seen.add(id)

    const cached = await getCachedPlace(id)
    const detail =
      cached?.photos?.length || cached?.opening_hours
        ? cached
        : await withPlaceService((s) => placeDetails(s, id)).catch(() => null)

    const openNow = detail?.opening_hours?.open_now ?? false
    if (opts.openNow && !openNow) continue

    const place: ParkingPlace = {
      place_id: id,
      name: r.name ?? id,
      location: {
        lat: r.geometry?.location?.lat() ?? opts.center.lat,
        lng: r.geometry?.location?.lng() ?? opts.center.lng,
      },
      types: r.types ?? [],
      rating: r.rating ?? 0,
      user_ratings_total: r.user_ratings_total ?? 0,
      opening_hours: detail?.opening_hours
        ? { open_now: openNow, weekday_text: detail.opening_hours.weekday_text ?? [] }
        : undefined,
      photos: photoUrls(detail?.photos),
    }
    place.availability = findAvailabilityLot(place, lots)

    await setPlace(place)
    out.push(place)
  }

  return out
}