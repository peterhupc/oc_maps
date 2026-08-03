import { useTranslation } from 'react-i18next'
import type { FoodPlace } from '../types/food'

interface PlaceListProps {
  places: FoodPlace[]
  loading: boolean
  error: string | null
  favorites: string[]
  onToggleFavorite: (id: string) => void
  onSelect: (place: FoodPlace) => void
}

export default function PlaceList({
  places,
  loading,
  error,
  favorites,
  onToggleFavorite,
  onSelect,
}: PlaceListProps) {
  const { t } = useTranslation()

  if (loading) {
    return <div className="list-status">{t('list.loading')}</div>
  }

  if (error) {
    return <div className="list-status error">{error}</div>
  }

  if (places.length === 0) {
    return <div className="list-status">{t('list.empty')}</div>
  }

  return (
    <ul className="place-list">
      {places.map((place) => (
        <li key={place.place_id} className="place-card" onClick={() => onSelect(place)}>
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
            className={`fav-btn ${favorites.includes(place.place_id) ? 'active' : ''}`}
            aria-label={t('list.favorites')}
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite(place.place_id)
            }}
          >
            {favorites.includes(place.place_id) ? '★' : '☆'}
          </button>
        </li>
      ))}
    </ul>
  )
}
