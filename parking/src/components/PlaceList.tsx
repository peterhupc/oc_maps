import { useMemo } from 'react'
import type { ParkingPlace, SortOption, SortOrigin } from '../types/parking'
import type { FavoriteItem } from '../hooks/useFavorites'
import { sortPlaces } from '../utils/sortPlaces'

export type ListView = 'all' | 'favorites'

interface PlaceListProps {
  places: ParkingPlace[]
  favorites: FavoriteItem[]
  view: ListView
  onViewChange: (v: ListView) => void
  loading: boolean
  error: string | null
  onToggleFavorite: (place: ParkingPlace) => void
  onSelect: (place: ParkingPlace) => void
  sort: SortOption
  onSortChange: (s: SortOption) => void
  distanceOrigin: SortOrigin
}

function truncate(s: string, n = 18): string {
  return s.length > n ? `${s.slice(0, n)}…` : s
}

function availabilityLabel(place: ParkingPlace): string | null {
  const a = place.availability
  if (!a) return null
  if (a.available != null && a.total != null) return `剩餘 ${a.available}/${a.total} 位`
  if (a.available != null) return `剩餘 ${a.available} 位`
  return null
}

function PlaceCard({
  place,
  isFav,
  onToggleFavorite,
  onSelect,
}: {
  place: ParkingPlace
  isFav: boolean
  onToggleFavorite: (place: ParkingPlace) => void
  onSelect: (place: ParkingPlace) => void
}) {
  const availLabel = availabilityLabel(place)
  const avail = place.availability?.available ?? null
  return (
    <li className="place-card" onClick={() => onSelect(place)}>
      {place.photos?.[0] ? (
        <img src={place.photos[0]} alt={place.name} loading="lazy" />
      ) : (
        <div className="no-photo">停車場</div>
      )}
      <div className="place-info">
        <div className="place-name">{place.name}</div>
        <div className="place-meta">
          {availLabel && (
            <span className={avail != null && avail <= 0 ? 'closed' : 'open'}>{availLabel}</span>
          )}
          {place.availability?.priceText && (
            <span className="price" title={place.availability.priceText}>
              {truncate(place.availability.priceText)}
            </span>
          )}
          {place.opening_hours?.open_now != null && (
            <span className={place.opening_hours.open_now ? 'open' : 'closed'}>
              {place.opening_hours.open_now ? '開放中' : '已關閉'}
            </span>
          )}
        </div>
      </div>
      <button
        className={`fav-btn ${isFav ? 'active' : ''}`}
        aria-label="收藏"
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
  sort,
  onSortChange,
  distanceOrigin,
}: PlaceListProps) {
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
          全部
        </button>
        <button
          type="button"
          className={view === 'favorites' ? 'active' : ''}
          onClick={() => onViewChange('favorites')}
        >
          收藏{favorites.length > 0 ? ` (${favorites.length})` : ''}
        </button>
      </div>

      <div className="sort-bar">
        <select
          value={sort}
          aria-label="排序"
          onChange={(e) => onSortChange(e.target.value as SortOption)}
        >
          <option value="default">預設排序</option>
          <option value="distance">距離最近</option>
          <option value="availability">剩餘車位最多</option>
        </select>
        {sort !== 'default' && (
          <button type="button" className="sort-reset" onClick={() => onSortChange('default')}>
            還原
          </button>
        )}
      </div>

      {view === 'all' ? (
        loading ? (
          <div className="list-status">搜尋中…</div>
        ) : error ? (
          <div className="list-status error">{error}</div>
        ) : places.length === 0 ? (
          <div className="list-status">此範圍內沒有找到停車場</div>
        ) : (
          <ul className="place-list">
            {sortedPlaces.map((place) => (
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
        <div className="list-status">還沒有收藏的停車場</div>
      ) : (
        <ul className="place-list">
          {sortedFavorites.map((place) => (
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