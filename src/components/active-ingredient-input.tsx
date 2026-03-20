'use client'

import { useState, useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'

interface ActiveIngredientInputProps {
  value: string
  onChange: (value: string) => void
  onModeOfActionFetched?: (modeOfAction: string) => void
  onSelect?: (ingredient: string) => void
  label?: string
  placeholder?: string
  category?: string
}

export default function ActiveIngredientInput({
  value,
  onChange,
  onModeOfActionFetched,
  onSelect,
  label = 'Active Ingredient',
  placeholder = 'Search active ingredients...',
  category
}: ActiveIngredientInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync internal state with prop value
  useEffect(() => {
    setSearchTerm(value)
  }, [value])

  // Fetch suggestions from API (should use PubChem)
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchTerm || searchTerm.length < 2) {
        setSuggestions([])
        return
      }

      setLoading(true)
      try {
        const url = new URL('/api/active-ingredients', window.location.origin)
        url.searchParams.set('q', searchTerm)
        if (category) url.searchParams.set('category', category)

        const response = await fetch(url)
        const data = await response.json()
        console.log('Suggestions API response:', data)

        if (Array.isArray(data)) {
          // Extract names from { name: ... } objects or direct strings
          const names = data.map(item => (typeof item === 'string' ? item : item.name)).filter(Boolean)
          setSuggestions(names)
        } else {
          setSuggestions([])
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error)
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm, category])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchTerm(newValue)
    onChange(newValue)
  }

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    // This fires when the user selects a suggestion from the datalist
    const selected = e.target.value
    console.log('Selected from datalist:', selected)
    if (selected && selected !== searchTerm) {
      setSearchTerm(selected)
      onChange(selected)
      if (onSelect) {
        onSelect(selected)
      }
      if (onModeOfActionFetched) {
        fetchModeOfAction(selected)
      }
    }
  }

  const fetchModeOfAction = async (ingredient: string) => {
    try {
      const response = await fetch(`/api/mode-of-action?ingredient=${encodeURIComponent(ingredient)}`)
      const data = await response.json()
      console.log('Mode of action response:', data)
      if (data.mode_of_action) {
        onModeOfActionFetched?.(data.mode_of_action)
      }
    } catch (error) {
      console.error('Error fetching mode of action:', error)
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
          onInput={handleSelect}
          placeholder={placeholder}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          list="ingredient-suggestions"
          autoComplete="off"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
        <datalist id="ingredient-suggestions">
          {suggestions.map((suggestion, idx) => (
            <option key={idx} value={suggestion} />
          ))}
        </datalist>
      </div>
    </div>
  )
}
