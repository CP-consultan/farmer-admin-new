'use client'

import { useState, useEffect, useRef } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { createClient } from '@/utils/supabase/client'

interface CropComboboxProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function CropCombobox({ value, onChange, placeholder = "Search crop...", disabled = false }: CropComboboxProps) {
  const [open, setOpen] = useState(false)
  const [crops, setCrops] = useState<{ id: string; name: string; name_ur: string | null }[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const supabase = createClient()
  const searchTimeout = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }

    if (!search) {
      setCrops([])
      return
    }

    searchTimeout.current = setTimeout(async () => {
      setLoading(true)
      const { data } = await supabase
        .from('crops')
        .select('id, name, name_ur')
        .ilike('name', `%${search}%`)
        .order('name')
        .limit(10)
      setCrops(data || [])
      setLoading(false)
    }, 300)

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current)
      }
    }
  }, [search, supabase])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
          disabled={disabled}
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Type crop name..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {loading && <CommandItem disabled>Loading...</CommandItem>}
            {!loading && crops.length === 0 && search && (
              <CommandEmpty>No crop found.</CommandEmpty>
            )}
            <CommandGroup>
              {crops.map((crop) => (
                <CommandItem
                  key={crop.id}
                  value={crop.name}
                  onSelect={(currentValue) => {
                    onChange(currentValue)
                    setOpen(false)
                    setSearch('')
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === crop.name ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{crop.name}</span>
                    {crop.name_ur && (
                      <span className="text-xs text-muted-foreground">{crop.name_ur}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
              {/* Allow user to enter a new name */}
              {search && !crops.some(c => c.name.toLowerCase() === search.toLowerCase()) && (
                <CommandItem
                  value={search}
                  onSelect={() => {
                    onChange(search)
                    setOpen(false)
                    setSearch('')
                  }}
                >
                  <span className="text-muted-foreground">Use "</span>{search}<span className="text-muted-foreground">" as new crop</span>
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
