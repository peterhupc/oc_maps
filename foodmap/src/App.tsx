import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MapPinned } from 'lucide-react'
import type { FilterState, FoodPlace } from './types/food'
import { CATEGORIES } from './utils/categoryMap'
import MapView from './components/MapView'
import SearchBar from './components/SearchBar'
import FilterPanel from './components/FilterPanel'
import PlaceList from './components/PlaceList'
import { useFoodSearch } from './hooks/useFoodSearch'
import { useJsApi } from './hooks/useJsApi'
import { useFavorites } from './hooks/useFavorites'
import { geocodeAddress } from './services/geocode'

const DEFAULT_CENTER = { lat: 25.033, lng: 121.565 } // 台北

export default function App() {
  const { t } = useTranslation()
  const { loaded: mapsLoaded, error: mapsError } = useJsApi()
  const { places, loading, error, search } = useFoodSearch()
  const { favorites, toggle } = useFavorites()

  const [center, setCenter] = useState(DEFAULT_CENTER)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    center: null,
    radiusKm: 3,
    categories: [...CATEGORIES],
    minRating: 3,
    priceRange: [0, 4],
    openNow: false,
  })

  const handleSearch = useCallback(
    async (address: string) => {
      const loc = await geocodeAddress(address)
      if (!loc) return
      const next: FilterState = { ...filters, center: loc }
      setCenter(loc)
      setFilters(next)
      await search(next)
    },
    [filters, search]
  )

  const handleFilterChange = useCallback(
    (next: FilterState) => {
      setFilters(next)
      if (next.center) void search(next)
    },
    [search]
  )

  const handleSelect = useCallback((place: FoodPlace) => {
    setSelectedId(place.place_id)
  }, [])

  const onMapMove = useCallback((c: { lat: number; lng: number }) => {
    setCenter(c)
  }, [])

  const allLoading = loading || !mapsLoaded

  return (
    <div className="app">
      <header className="header">
        <h1>
          <MapPinned size={22} />
          {t('app.title')}
        </h1>
        <span className="subtitle">{t('app.subtitle')}</span>
      </header>

      <SearchBar onSearch={handleSearch} loading={allLoading} />

      {mapsError && <div className="banner error">{mapsError}</div>}

      <div className="layout">
        <aside className="sidebar">
          <FilterPanel filters={filters} onChange={handleFilterChange} />
          <PlaceList
            places={places}
            loading={loading}
            error={error}
            favorites={favorites}
            onToggleFavorite={toggle}
            onSelect={handleSelect}
          />
        </aside>

        <main className="map-pane">
          <MapView
            center={center}
            places={places}
            selectedId={selectedId}
            onSelect={handleSelect}
            onCenterChange={onMapMove}
          />
        </main>
      </div>
    </div>
  )
}
