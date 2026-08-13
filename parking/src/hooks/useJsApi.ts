import { useEffect, useState } from 'react'
import { loadMaps } from '../services/mapsLoader'

export function useJsApi(): { loaded: boolean; error: string | null } {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    loadMaps()
      .then(() => {
        if (!cancelled) setLoaded(true)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { loaded, error }
}