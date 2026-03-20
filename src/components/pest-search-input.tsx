'use client'

import { useState, useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'

interface Pest {
  id: string
  scientific_name: string
  common_name_en: string | null
  common_name_ur: string | null
}

interface PestSearchInputProps {
  value: string          // currently selected pest ID
  onChange: (pestId: string) => void
  onScientificNameChange?: (scientificName: string) => void
  placeholder?: string
  label?: string
}

export default function PestSearchInput({
  value,
  onChange,
  onScientificNameChange,
  placeholder = 'Search by common name...',
  label = 'Select Pest'
}: PestSearchInputProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [suggestions, setSuggestions] = useState<Pest[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPest, setSelectedPest] = useState<Pest | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // When value (pestId) changes externally, fetch the pest to display its scientific name
  useEffect(() => {
    if (value && !selectedPest) {
      const fetchPest = async () => {
        const { createClient } = await import('@/utils/supabase/client')
        const supabase = createClient()
        const { data } = await supabase
          .from('pests')
          .select('id, scientific_name, common_name_en, common_name_ur')
          .eq('id', value)
          .single()
        if (data) {
          setSelectedPest(data)
          setSearchTerm(data.scientific_name) // show scientific name in input
        }
      }
      fetchPest()
    } else if (!value && selectedPest) {
      setSelectedPest(null)
      setSearchTerm('')
    }
  }, [value, selectedPest])

  // Fetch suggestions based on search term (common name or scientific name)
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
        .or(`scientific_name.ilike.%${searchTerm}%,common_name_en.ilike.%${searchTerm}%,common_name_ur.ilike.%${searchTerm}%`)
        .limit(10)

      setSuggestions(data || [])
      setLoading(false)
    }

    const timeoutId = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const handleSelect = (pest: Pest) => {
    setSelectedPest(pest)
    setSearchTerm(pest.scientific_name) // display scientific name in input
    onChange(pest.id)
    if (onScientificNameChange) onScientificNameChange(pest.scientific_name)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchTerm(newValue)
    // If the input no longer matches the selected pest, clear selection
    if (selectedPest && newValue !== selectedPest.scientific_name) {
      setSelectedPest(null)
      onChange('')
    }
  }

  const handleInputEvent = (e: React.FormEvent<HTMLInputElement>) => {
    const selected = (e.target as HTMLInputElement).value
    // Check if the selected value exactly matches a suggestion
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
          list="pest-suggestions"
          autoComplete="off"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
        <datalist id="pest-suggestions">
          {suggestions.map(pest => (
            <option key={pest.id} value={pest.scientific_name}>
              {pest.common_name_en || pest.common_name_ur || pest.scientific_name}
            </option>
          ))}
        </datalist>
      </div>
      {selectedPest && (
        <p className="text-xs text-muted-foreground">
          Selected: <span className="font-medium">{selectedPest.scientific_name}</span>
          {selectedPest.common_name_en && ` (${selectedPest.common_name_en})`}
          {selectedPest.common_name_ur && ` [${selectedPest.common_name_ur}]`}
        </p>
      )}
    </div>
  )
}
