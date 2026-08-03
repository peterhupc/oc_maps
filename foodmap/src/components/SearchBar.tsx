import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'

interface SearchBarProps {
  onSearch: (address: string) => void
  loading: boolean
}

export default function SearchBar({ onSearch, loading }: SearchBarProps) {
  const { t } = useTranslation()
  const [value, setValue] = useState('')

  const submit = () => {
    const trimmed = value.trim()
    if (trimmed) onSearch(trimmed)
  }

  return (
    <form
      className="search-bar"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t('search.placeholder')}
        aria-label={t('search.placeholder')}
      />
      <button type="submit" disabled={loading} aria-label={t('search.button')}>
        <Search size={18} />
      </button>
    </form>
  )
}
