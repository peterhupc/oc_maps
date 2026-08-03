import { useCallback, useState } from 'react'

const KEY = 'foodmap_favorites'

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[]
    } catch {
      return []
    }
  })

  const toggle = useCallback((placeId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(placeId) ? prev.filter((id) => id !== placeId) : [...prev, placeId]
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const isFavorite = useCallback((placeId: string) => favorites.includes(placeId), [favorites])

  return { favorites, toggle, isFavorite }
}
