export interface AvailabilityLot {
  id: string
  city: string
  name: string
  address: string
  lat: number
  lng: number
  total: number | null
  available: number | null
  priceText: string
  serviceTime: string
}

export interface ParkingPlace {
  place_id: string
  name: string
  location: { lat: number; lng: number }
  types: string[]
  rating: number
  user_ratings_total: number
  opening_hours?: { open_now: boolean; weekday_text: string[] }
  photos?: string[]
  availability?: AvailabilityLot | null
}

export interface FilterState {
  center: { lat: number; lng: number } | null
  radiusKm: number
  categories: string[]
  openNow: boolean
}

export type SortOption = 'distance' | 'availability' | 'default'

export interface SortOrigin {
  lat: number
  lng: number
}