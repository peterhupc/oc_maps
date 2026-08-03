import { useTranslation } from 'react-i18next'
import { CATEGORIES } from '../utils/categoryMap'
import type { FilterState } from '../types/food'

interface FilterPanelProps {
  filters: FilterState
  onChange: (f: FilterState) => void
}

const PRICES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
]

export default function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const { t } = useTranslation()

  const toggleCategory = (cat: string) => {
    const cats = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat]
    onChange({ ...filters, categories: cats })
  }

  const setPrice = (range: [number, number]) => {
    onChange({ ...filters, priceRange: range })
  }

  return (
    <div className="filter-panel">
      <div className="filter-row">
        <label>
          {t('filter.radius')}: {filters.radiusKm}km
        </label>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={filters.radiusKm}
          onChange={(e) => onChange({ ...filters, radiusKm: Number(e.target.value) })}
        />
      </div>

      <div className="filter-row">
        <label>
          {t('filter.minRating')}: {filters.minRating.toFixed(1)}
        </label>
        <input
          type="range"
          min={0}
          max={5}
          step={0.5}
          value={filters.minRating}
          onChange={(e) => onChange({ ...filters, minRating: Number(e.target.value) })}
        />
      </div>

      <div className="filter-row">
        <span>{t('filter.price')}:</span>
        <div className="price-btns">
          {PRICES.map((range) => (
            <button
              key={range.join('-')}
              type="button"
              className={filters.priceRange[0] === range[0] && filters.priceRange[1] === range[1] ? 'active' : ''}
              onClick={() => setPrice(range)}
            >
              {'$'.repeat(range[0])}
            </button>
          ))}
        </div>
      </div>

      <label className="filter-check">
        <input
          type="checkbox"
          checked={filters.openNow}
          onChange={(e) => onChange({ ...filters, openNow: e.target.checked })}
        />
        {t('filter.openNow')}
      </label>

      <div className="filter-cats">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={filters.categories.includes(cat) ? 'cat active' : 'cat'}
            onClick={() => toggleCategory(cat)}
          >
            {t(`categories.${cat}`)}
          </button>
        ))}
      </div>
    </div>
  )
}
