import { useState } from 'react'
import { Search } from 'lucide-react'

interface SearchBarProps {
  onSearch: (address: string) => void
  loading: boolean
}

export default function SearchBar({ onSearch, loading }: SearchBarProps) {
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
        placeholder="輸入地址或地點，例如：台北車站"
        aria-label="搜尋地址"
      />
      <button type="submit" disabled={loading} aria-label="搜尋">
        <Search size={18} />
      </button>
    </form>
  )
}