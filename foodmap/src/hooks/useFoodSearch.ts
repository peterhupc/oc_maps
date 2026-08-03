import { useCallback, useRef, useState } from 'react'
import type { FilterState, FoodPlace } from '../types/food'
import { fetchFoodPlaces } from '../services/foodSource'

export interface UseFoodSearchResult {
  places: FoodPlace[]
  loading: boolean
  error: string | null
  lastSearchAt: number | null
  search: (filters: FilterState) => Promise<void>
}

export function useFoodSearch(): UseFoodSearchResult {
  const [places, setPlaces] = useState<FoodPlace[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastSearchAt, setLastSearchAt] = useState<number | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const search = useCallback(async (filters: FilterState) => {
    if (!filters.center) return

    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac

    setLoading(true)
    setError(null)
    try {
      const result = await fetchFoodPlaces({
        center: filters.center,
        radiusKm: filters.radiusKm,
        categories: filters.categories,
        minRating: filters.minRating,
        priceRange: filters.priceRange,
        openNow: filters.openNow,
      })
      if (ac.signal.aborted) return
      setPlaces(result)
      setLastSearchAt(Date.now())
    } catch (err) {
      if (ac.signal.aborted) return
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      if (!ac.signal.aborted) setLoading(false)
    }
  }, [])

  return { places, loading, error, lastSearchAt, search }
}
