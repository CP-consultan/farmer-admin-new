'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export interface Option {
  id: string
  label: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  label?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Select items...',
  label,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const toggleOption = (optionId: string) => {
    const newSelected = selected.includes(optionId)
      ? selected.filter(id => id !== optionId)
      : [...selected, optionId]
    onChange(newSelected)
  }

  const removeOption = (optionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(selected.filter(id => id !== optionId))
  }

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between h-auto min-h-10"
          >
            <div className="flex flex-wrap gap-1 items-center">
              {selected.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : (
                selected.map((id) => {
                  const option = options.find(opt => opt.id === id)
                  return option ? (
                    <Badge key={id} variant="secondary" className="mr-1 mb-1">
                      {option.label}
                      <X
                        className="ml-1 h-3 w-3 cursor-pointer"
                        onClick={(e) => removeOption(id, e)}
                      />
                    </Badge>
                  ) : null
                })
              )}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-4" align="start">
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {options.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`opt-${option.id}`}
                  checked={selected.includes(option.id)}
                  onChange={() => toggleOption(option.id)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label
                  htmlFor={`opt-${option.id}`}
                  className="text-sm cursor-pointer flex-1"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
