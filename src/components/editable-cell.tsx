'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface EditableCellProps {
  value: string | null
  rowId: string
  table: string        // Supabase table name
  column: string        // Column to update
  type?: 'text' | 'select'
  options?: string[]    // For select type
  onUpdate?: () => void // Optional callback after successful update
  className?: string
}

export function EditableCell({ 
  value, 
  rowId, 
  table, 
  column, 
  type = 'text', 
  options = [], 
  onUpdate,
  className = ''
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value || '')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const selectRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isEditing && type === 'text' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing, type])

  const handleDoubleClick = () => {
    setIsEditing(true)
    setEditValue(value || '')
  }

  const handleBlur = async () => {
    if (loading) return
    if (editValue === (value || '')) {
      setIsEditing(false)
      return
    }

    setLoading(true)
    try {
      const { createClient } = await import('@/utils/supabase/client')
      const supabase = createClient()
      const { error } = await supabase
        .from(table)
        .update({ [column]: editValue || null })
        .eq('id', rowId)

      if (error) throw error
      onUpdate?.()
    } catch (error) {
      console.error('Error updating cell:', error)
      alert('Failed to update. Check console.')
    } finally {
      setLoading(false)
      setIsEditing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setEditValue(value || '')
    }
  }

  if (isEditing) {
    if (type === 'select') {
      return (
        <Select
          value={editValue}
          onValueChange={(val) => setEditValue(val)}
          onOpenChange={(open) => {
            if (!open) handleBlur()
          }}
        >
          <SelectTrigger ref={selectRef} className="h-8 w-full">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    return (
      <Input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        disabled={loading}
        className="h-8"
      />
    )
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className={`cursor-pointer hover:bg-muted/50 px-2 py-1 rounded ${className} ${loading ? 'opacity-50' : ''}`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : value || '—'}
    </div>
  )
}
