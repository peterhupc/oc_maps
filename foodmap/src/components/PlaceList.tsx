import { useTranslation } from 'react-i18next'
import type { FoodPlace } from '../types/food'
import type { FavoriteItem } from '../hooks/useFavorites'

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
}

function PlaceCard({
  place,
  isFav,
  onToggleFavorite,
  onSelect,
}: {
  place: FoodPlace
  isFav: boolean
  onToggleFavorite: (place: FoodPlace) => void
  onSelect: (place: FoodPlace) => void
}) {
  const { t } = useTranslation()
  return (
    <li className="place-card" onClick={() => onSelect(place)}>
      {place.photos?.[0] ? (
        <img src={place.photos[0]} alt={place.name} loading="lazy" />
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
}: PlaceListProps) {
  const { t } = useTranslation()

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

      {view === 'all' ? (
        loading ? (
          <div className="list-status">{t('list.loading')}</div>
        ) : error ? (
          <div className="list-status error">{error}</div>
        ) : places.length === 0 ? (
          <div className="list-status">{t('list.empty')}</div>
        ) : (
          <ul className="place-list">
            {places.map((place) => (
              <PlaceCard
                key={place.place_id}
                place={place}
                isFav={favorites.some((f) => f.place_id === place.place_id)}
                onToggleFavorite={onToggleFavorite}
                onSelect={onSelect}
              />
            ))}
          </ul>
        )
      ) : favorites.length === 0 ? (
        <div className="list-status">{t('list.favEmpty')}</div>
      ) : (
        <ul className="place-list">
          {favorites.map((place) => (
            <PlaceCard
              key={place.place_id}
              place={place}
              isFav
              onToggleFavorite={onToggleFavorite}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
