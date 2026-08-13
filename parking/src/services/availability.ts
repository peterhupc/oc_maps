import type { AvailabilityLot, ParkingPlace } from '../types/parking'

interface AvailabilityPayload {
  updatedAt: string
  count: number
  lots: AvailabilityLot[]
}

let cachePromise: Promise<AvailabilityLot[]> | null = null

export function getAvailabilityLots(): Promise<AvailabilityLot[]> {
  if (!cachePromise) {
    cachePromise = fetch(`${import.meta.env.BASE_URL}data/availability.json`)
      .then((r) => (r.ok ? (r.json() as Promise<AvailabilityPayload>) : null))
      .then((j) => j?.lots ?? [])
      .catch((err) => {
        console.warn('載入即時車位資料失敗：', err)
        cachePromise = null
        return []
      })
  }
  return cachePromise
}

function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

// 名稱正規化：去空白、括號內容與「停車場」尾綴，供模糊比對
function normName(s: string): string {
  return s
    .replace(/\s+/g, '')
    .replace(/[（(][^）)]*[）)]/g, '')
    .replace(/地下停車場$/g, '')
    .replace(/停車場$/g, '')
    .replace(/公有$/g, '')
}

function nameScore(a: string, b: string): number {
  const na = normName(a)
  const nb = normName(b)
  if (!na || !nb) return 0
  if (na === nb) return 2
  if (na.includes(nb) || nb.includes(na)) return 1
  return 0
}

const MAX_MATCH_DIST_M = 300
const NAME_SCORE_WEIGHT = 1000

// 依「名稱相似 + 距離」模糊比對：候選需在 300m 內，score = 名稱分*1000 - 距離(m)
export function findAvailabilityLot(
  place: ParkingPlace,
  lots: AvailabilityLot[]
): AvailabilityLot | null {
  const pos = place.location
  let best: { lot: AvailabilityLot; score: number } | null = null

  for (const lot of lots) {
    const distM = haversineKm(pos, { lat: lot.lat, lng: lot.lng }) * 1000
    if (distM > MAX_MATCH_DIST_M) continue
    const score = nameScore(place.name, lot.name) * NAME_SCORE_WEIGHT - distM
    if (!best || score > best.score) best = { lot, score }
  }

  // 距離很近（<150m）但名稱分 0 也接受（避免漏掉官方資料命名差異大的場）
  if (best && best.score > -150) return best.lot
  return null
}