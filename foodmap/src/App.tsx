import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MapPinned } from 'lucide-react'
import type { FilterState, FoodPlace, SortOption, SortOrigin } from './types/food'
import { CATEGORIES } from './utils/categoryMap'
import MapView from './components/MapView'
import SearchBar from './components/SearchBar'
import FilterPanel from './components/FilterPanel'
import PlaceList, { type ListView } from './components/PlaceList'
import { useFoodSearch } from './hooks/useFoodSearch'
import { useJsApi } from './hooks/useJsApi'
import { useFavorites } from './hooks/useFavorites'
import { geocodeAddress } from './services/geocode'

const DEFAULT_CENTER = { lat: 25.033, lng: 121.565 } // 台北
const MAP_MOVE_DEBOUNCE_MS = 600

export default function App() {
  const { t } = useTranslation()
  const { loaded: mapsLoaded, error: mapsError } = useJsApi()
  const { places, loading, error, search } = useFoodSearch()
  const { favorites, toggle, login, logout, user } = useFavorites()

  const [center, setCenter] = useState(DEFAULT_CENTER)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [listView, setListView] = useState<ListView>('all')
  const [sort, setSort] = useState<SortOption>('default')
  const [distanceOrigin, setDistanceOrigin] = useState<SortOrigin>(DEFAULT_CENTER)
  const [filters, setFilters] = useState<FilterState>({
    center: null,
    radiusKm: 3,
    categories: [...CATEGORIES],
    minRating: 3,
    priceRange: [0, 4],
    openNow: false,
  })

  const filtersRef = useRef(filters)
  filtersRef.current = filters
  const moveTimerRef = useRef<number | null>(null)

  const handleSearch = useCallback(
    async (address: string) => {
      const loc = await geocodeAddress(address)
      if (!loc) return
      setDistanceOrigin(loc)
      const next: FilterState = { ...filtersRef.current, center: loc }
      setCenter(loc)
      setFilters(next)
      setSelectedId(null)
      await search(next)
    },
    [search]
  )

  const handleFilterChange = useCallback(
    (next: FilterState) => {
      setFilters(next)
      setSelectedId(null)
      if (next.center) void search(next)
    },
    [search]
  )

  const handleSelect = useCallback((place: FoodPlace) => {
    setSelectedId(place.place_id)
  }, [])

  const onMapMove = useCallback(
    (c: { lat: number; lng: number }) => {
      const next: FilterState = { ...filtersRef.current, center: c }
      setFilters(next)
      setSelectedId(null)
      if (moveTimerRef.current) window.clearTimeout(moveTimerRef.current)
      moveTimerRef.current = window.setTimeout(() => void search(next), MAP_MOVE_DEBOUNCE_MS)
    },
    [search]
  )

  const allLoading = loading || !mapsLoaded

  // 首載：maps 就緒後自動以台北為中心搜尋一次（讓地圖一開始就有旗標）
  useEffect(() => {
    if (!mapsLoaded) return
    const next: FilterState = { ...filtersRef.current, center: DEFAULT_CENTER }
    setCenter(DEFAULT_CENTER)
    setFilters(next)
    void search(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapsLoaded])

  return (
    <div className="app">
      <header className="header">
        <div className="header-main">
          <h1>
            <MapPinned size={22} />
            {t('app.title')}
          </h1>
          <span className="subtitle">{t('app.subtitle')}</span>
        </div>
        {user ? (
          <button className="auth-btn" onClick={() => void logout()} title={t('auth.logout')}>
            {user.photoURL && <img src={user.photoURL} alt="" className="auth-avatar" />}
            <span>{user.displayName ?? user.email}</span>
          </button>
        ) : (
          <button className="auth-btn" onClick={() => void login()}>
            {t('auth.login')}
          </button>
        )}
      </header>

      <SearchBar onSearch={handleSearch} loading={allLoading} />

      {mapsError && <div className="banner error">{mapsError}</div>}

      <div className="layout">
        <aside className="sidebar">
          <FilterPanel filters={filters} onChange={handleFilterChange} />
          <PlaceList
            places={places}
            favorites={favorites}
            view={listView}
            onViewChange={setListView}
            loading={loading}
            error={error}
            onToggleFavorite={toggle}
            onSelect={handleSelect}
            sort={sort}
            onSortChange={setSort}
            distanceOrigin={distanceOrigin}
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
