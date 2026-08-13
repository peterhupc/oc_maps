import { CATEGORY_GROUPS } from '../utils/categoryMap'
import type { FilterState } from '../types/parking'

interface FilterPanelProps {
  filters: FilterState
  onChange: (f: FilterState) => void
}

export default function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const toggleCategory = (cat: string) => {
    const cats = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat]
    onChange({ ...filters, categories: cats })
  }

  return (
    <div className="filter-panel">
      <div className="filter-row">
        <label>
          搜尋半徑：{filters.radiusKm}km
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

      <label className="filter-check">
        <input
          type="checkbox"
          checked={filters.openNow}
          onChange={(e) => onChange({ ...filters, openNow: e.target.checked })}
        />
        僅顯示開放中
      </label>

      <div className="filter-groups">
        {CATEGORY_GROUPS.map((group) => (
          <details key={group.key} className="filter-group" open>
            <summary>{group.label}</summary>
            <div className="filter-cats">
              {group.items.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={filters.categories.includes(cat) ? 'cat active' : 'cat'}
                  onClick={() => toggleCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}