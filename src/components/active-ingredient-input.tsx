'use client'

import { useState, useEffect, useRef } from 'react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  const [open, setOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState(value)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setSearchTerm(value)
  }, [value])

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
        if (Array.isArray(data)) {
          setSuggestions(data.map(item => item.name))
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

  const fetchModeOfAction = async (ingredient: string) => {
    try {
      const response = await fetch(`/api/mode-of-action?ingredient=${encodeURIComponent(ingredient)}`)
      const data = await response.json()
      if (data.mode_of_action) {
        onModeOfActionFetched?.(data.mode_of_action)
      }
    } catch (error) {
      console.error('Error fetching mode of action:', error)
    }
  }

  const handleSelect = (selectedValue: string) => {
    console.log('Selected ingredient:', selectedValue)
    onChange(selectedValue)
    setSearchTerm(selectedValue)
    setOpen(false)
    fetchModeOfAction(selectedValue)
    onSelect?.(selectedValue)
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            onClick={() => setOpen(true)}
          >
            {value || placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[--radix-popover-trigger-width] p-0" 
          align="start" 
          sideOffset={5}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command>
            <CommandInput
              placeholder={placeholder}
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="h-9"
              ref={inputRef}
            />
            <CommandList>
              <CommandEmpty>
                {loading ? 'Searching...' : 'No active ingredients found.'}
              </CommandEmpty>
              <CommandGroup>
                {suggestions.map((suggestion) => (
                  <CommandItem
                    key={suggestion}
                    value={suggestion}
                    onSelect={() => handleSelect(suggestion)}
                    className="cursor-pointer hover:bg-accent"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === suggestion ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {suggestion}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
