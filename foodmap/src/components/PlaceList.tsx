import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { FoodPlace, SortOption, SortOrigin } from '../types/food'
import type { FavoriteItem } from '../hooks/useFavorites'
import { sortPlaces } from '../utils/sortPlaces'

export type ListView = 'all' | 'favorites'

interface PlaceListProps {
  places: FoodPlace[]
  favorites: FavoriteItem[]
  view: ListView
  onViewChange: (v: ListView) => void
  loading: boolean
  error: string | null
  onToggleFavorite: (place: FoodPlace) => void
  onSelect: (place: FoodPlace) => void
  onPhotoError?: (place: FoodPlace) => void
  sort: SortOption
  onSortChange: (s: SortOption) => void
  distanceOrigin: SortOrigin
}

function PlaceCard({
  place,
  isFav,
  onToggleFavorite,
  onSelect,
  onPhotoError,
}: {
  place: FoodPlace
  isFav: boolean
  onToggleFavorite: (place: FoodPlace) => void
  onSelect: (place: FoodPlace) => void
  onPhotoError?: (place: FoodPlace) => void
}) {
  const { t } = useTranslation()
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const photo = place.photos?.[0] ?? null
  const showImg = photo != null && photo !== failedUrl
  return (
    <li className="place-card" onClick={() => onSelect(place)}>
      {showImg ? (
        <img
          src={photo}
          alt={place.name}
          loading="lazy"
          onError={() => {
            setFailedUrl(photo)
            onPhotoError?.(place)
          }}
        />
      ) : (
        <div className="no-photo">{t('list.noPhotos')}</div>
      )}
      <div className="place-info">
        <div className="place-name">{place.name}</div>
        <div className="place-meta">
          {place.rating > 0 && <span>★ {place.rating.toFixed(1)}</span>}
          {place.price_level != null && <span>{'$'.repeat(place.price_level + 1)}</span>}
          {place.opening_hours?.open_now != null && (
            <span className={place.opening_hours.open_now ? 'open' : 'closed'}>
              {place.opening_hours.open_now ? t('list.open') : t('list.closed')}
            </span>
          )}
        </div>
      </div>
      <button
        className={`fav-btn ${isFav ? 'active' : ''}`}
        aria-label={t('list.favorites')}
        onClick={(e) => {
          e.stopPropagation()
          onToggleFavorite(place)
        }}
      >
        {isFav ? '★' : '☆'}
      </button>
    </li>
  )
}

export default function PlaceList({
  places,
  favorites,
  view,
  onViewChange,
  loading,
  error,
  onToggleFavorite,
  onSelect,
  onPhotoError,
  sort,
  onSortChange,
  distanceOrigin,
}: PlaceListProps) {
  const { t } = useTranslation()

  const sortedPlaces = useMemo(
    () => sortPlaces(places, sort, distanceOrigin),
    [places, sort, distanceOrigin]
  )
  const sortedFavorites = useMemo(
    () => sortPlaces(favorites, sort, distanceOrigin),
    [favorites, sort, distanceOrigin]
  )

  return (
    <div className="place-list-wrap">
      <div className="list-tabs">
        <button
          type="button"
          className={view === 'all' ? 'active' : ''}
          onClick={() => onViewChange('all')}
        >
          {t('list.tabAll')}
        </button>
        <button
          type="button"
          className={view === 'favorites' ? 'active' : ''}
          onClick={() => onViewChange('favorites')}
        >
          {t('list.tabFavorites')}
          {favorites.length > 0 ? ` (${favorites.length})` : ''}
        </button>
      </div>

      <div className="sort-bar">
        <select
          value={sort}
          aria-label={t('sort.label')}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
        >
          <option value="default">{t('sort.default')}</option>
          <option value="distance">{t('sort.distance')}</option>
          <option value="rating">{t('sort.rating')}</option>
          <option value="price_asc">{t('sort.priceAsc')}</option>
          <option value="price_desc">{t('sort.priceDesc')}</option>
        </select>
        {sort !== 'default' && (
          <button
            type="button"
            className="sort-reset"
            onClick={() => onSortChange('default')}
          >
            {t('sort.backToDefault')}
          </button>
        )}
      </div>

      {view === 'all' ? (
        loading ? (
          <div className="list-status">{t('list.loading')}</div>
        ) : error ? (
          <div className="list-status error">{error}</div>
        ) : places.length === 0 ? (
          <div className="list-status">{t('list.empty')}</div>
        ) : (
          <ul className="place-list">
            {sortedPlaces.map((place) => (
              <PlaceCard
                key={place.place_id}
                place={place}
                isFav={favorites.some((f) => f.place_id === place.place_id)}
                onToggleFavorite={onToggleFavorite}
                onSelect={onSelect}
                onPhotoError={onPhotoError}
              />
            ))}
          </ul>
        )
      ) : favorites.length === 0 ? (
        <div className="list-status">{t('list.favEmpty')}</div>
      ) : (
        <ul className="place-list">
          {sortedFavorites.map((place) => (
            <PlaceCard
              key={place.place_id}
              place={place}
              isFav
              onToggleFavorite={onToggleFavorite}
              onSelect={onSelect}
              onPhotoError={onPhotoError}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
