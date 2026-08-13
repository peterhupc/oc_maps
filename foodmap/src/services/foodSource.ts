import type { FoodPlace } from '../types/food'
import { categoriesToQueries } from '../utils/categoryMap'
import { loadMaps } from './mapsLoader'
import { getCachedPlace, setPlace } from './cache'

export interface FetchOptions {
  center: { lat: number; lng: number }
  radiusKm: number
  categories: string[]
  minRating: number
  priceRange: [number, number]
  openNow: boolean
}

const PHOTO_MAX_WIDTH = 400

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

function priceLevel(v: number | undefined): 0 | 1 | 2 | 3 | 4 | undefined {
  return v === undefined || (v >= 0 && v <= 4) ? (v as 0 | 1 | 2 | 3 | 4 | undefined) : undefined
}

// 重新向 Places API 抓取最新照片 URL（舊的 photo_reference 會過期）
export async function refreshPlacePhotos(placeId: string): Promise<string[]> {
  const detail = await withPlaceService((s) => placeDetails(s, placeId)).catch(() => null)
  return photoUrls(detail?.photos)
}

const MAX_KEYWORD_QUERIES = 8

export async function fetchFoodPlaces(opts: FetchOptions): Promise<FoodPlace[]> {
  const results = await withPlaceService(async (svc) => {
    const queries = categoriesToQueries(opts.categories)

    const base: google.maps.places.TextSearchRequest = {
      location: opts.center,
      radius: Math.round(opts.radiusKm * 1000),
      type: 'restaurant',
    }

    const keywords =
      queries.length > 0 && queries.length <= MAX_KEYWORD_QUERIES ? queries : ['美食', '小吃', '餐廳']
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
  const out: FoodPlace[] = []

  for (const r of results) {
    const id = r.place_id ?? ''
    if (!id || seen.has(id)) continue
    seen.add(id)

    const rating = r.rating ?? 0
    if (rating < opts.minRating) continue
    if (r.price_level != null && (r.price_level < opts.priceRange[0] || r.price_level > opts.priceRange[1])) continue

    const cached = await getCachedPlace(id)
    const detail =
      cached?.photos?.length || cached?.opening_hours
        ? cached
        : await withPlaceService((s) => placeDetails(s, id)).catch(() => null)

    const openNow = detail?.opening_hours?.open_now ?? false
    if (opts.openNow && !openNow) continue

    const place: FoodPlace = {
      place_id: id,
      name: r.name ?? id,
      location: {
        lat: r.geometry?.location?.lat() ?? opts.center.lat,
        lng: r.geometry?.location?.lng() ?? opts.center.lng,
      },
      types: r.types ?? [],
      rating,
      user_ratings_total: r.user_ratings_total ?? 0,
      price_level: priceLevel(r.price_level),
      opening_hours: detail?.opening_hours
        ? { open_now: openNow, weekday_text: detail.opening_hours.weekday_text ?? [] }
        : undefined,
      photos: photoUrls(detail?.photos),
    }

    await setPlace(place)
    out.push(place)
  }

  return out
}
