export interface FoodPlace {
  place_id: string
  name: string
  location: { lat: number; lng: number }
  types: string[]
  rating: number
  user_ratings_total: number
  price_level?: 0 | 1 | 2 | 3 | 4
  opening_hours?: { open_now: boolean; weekday_text: string[] }
  photos?: string[]
  blogger_refs?: BloggerRef[]
}

export interface BloggerRef {
  title: string
  url: string
  source: 'ptt' | 'pixnet' | 'ifoodie' | 'custom'
  published_at: string
  excerpt: string
  image_url?: string
}

export interface FilterState {
  center: { lat: number; lng: number } | null
  radiusKm: number
  categories: string[]
  minRating: number
  priceRange: [number, number]
  openNow: boolean
}

export type SortOption = 'distance' | 'rating' | 'price_asc' | 'price_desc' | 'default'

export interface SortOrigin {
  lat: number
  lng: number
}
