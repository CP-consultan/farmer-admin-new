'use client'

import { useState, useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'

interface Pest {
  id: string
  scientific_name: string
  common_name_en: string | null
  common_name_ur: string | null
}

interface ScientificNameSearchProps {
  value: string
  onChange: (scientificName: string, pestId?: string) => void
  placeholder?: string
  label?: string
}

export default function ScientificNameSearch({
  value,
  onChange,
  placeholder = 'Search scientific name...',
  label = 'Scientific Name'
}: ScientificNameSearchProps) {
  const [searchTerm, setSearchTerm] = useState(value)
  const [suggestions, setSuggestions] = useState<Pest[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Keep internal state in sync with prop
  useEffect(() => {
    setSearchTerm(value)
  }, [value])

  // Fetch suggestions from pests table (scientific names only, but also show common names in dropdown)
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchTerm || searchTerm.length < 2) {
        setSuggestions([])
        return
      }

      setLoading(true)
      const { createClient } = await import('@/utils/supabase/client')
      const supabase = createClient()

      const { data } = await supabase
        .from('pests')
        .select('id, scientific_name, common_name_en, common_name_ur')
        .ilike('scientific_name', `%${searchTerm}%`)
        .limit(10)

      setSuggestions(data || [])
      setLoading(false)
    }

    const timeoutId = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const handleSelect = (pest: Pest) => {
    setSearchTerm(pest.scientific_name)
    onChange(pest.scientific_name, pest.id)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchTerm(newValue)
    // If the input no longer matches any selected pest, clear the selection
    onChange(newValue)
  }

  const handleInputEvent = (e: React.FormEvent<HTMLInputElement>) => {
    const selected = (e.target as HTMLInputElement).value
    const match = suggestions.find(s => s.scientific_name === selected)
    if (match) {
      handleSelect(match)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (searchTerm.trim()) {
        const exactMatch = suggestions.find(s => s.scientific_name === searchTerm.trim())
        if (exactMatch) {
          handleSelect(exactMatch)
        } else {
          // Treat as new scientific name
          onChange(searchTerm.trim())
        }
      }
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onInput={handleInputEvent}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          list="scientific-name-suggestions"
          autoComplete="off"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
        <datalist id="scientific-name-suggestions">
          {suggestions.map(pest => (
            <option key={pest.id} value={pest.scientific_name}>
              {pest.scientific_name}
              {pest.common_name_en && ` (${pest.common_name_en})`}
              {pest.common_name_ur && ` [${pest.common_name_ur}]`}
            </option>
          ))}
        </datalist>
      </div>
    </div>
  )
}
