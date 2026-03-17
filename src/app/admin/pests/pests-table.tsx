'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCw, ChevronUp, ChevronDown, Search } from 'lucide-react'
import EditableCell from './editable-cell'
import { DeleteButton } from './delete-button'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function PestsTable({ initialPests }: { initialPests: any[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [pests, setPests] = useState(initialPests)
  const [search, setSearch] = useState('')
  const [sortColumn, setSortColumn] = useState<string>('scientific_name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [refreshingId, setRefreshingId] = useState<string | null>(null)
  const [refreshingSciId, setRefreshingSciId] = useState<string | null>(null)
  const [statusMap, setStatusMap] = useState<Record<string, 'pending' | 'match' | 'mismatch'>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setPests(initialPests)
    setLoading(false)
  }, [initialPests])

  useEffect(() => {
    const checkAllNames = async () => {
      for (const pest of pests) {
        if (statusMap[pest.id]) continue
        setStatusMap(prev => ({ ...prev, [pest.id]: 'pending' }))
        try {
          const res = await fetch(`/api/itis?name=${encodeURIComponent(pest.scientific_name)}`)
          const data = await res.json()
          if (res.ok && data.commonName) {
            setStatusMap(prev => ({ ...prev, [pest.id]: 'match' }))
          } else {
            setStatusMap(prev => ({ ...prev, [pest.id]: 'mismatch' }))
          }
        } catch {
          setStatusMap(prev => ({ ...prev, [pest.id]: 'mismatch' }))
        }
        await new Promise(r => setTimeout(r, 300))
      }
    }
    if (!loading) checkAllNames()
  }, [pests, loading])

  const filteredPests = pests.filter(pest =>
    pest.scientific_name.toLowerCase().includes(search.toLowerCase()) ||
    (pest.common_name_en && pest.common_name_en.toLowerCase().includes(search.toLowerCase())) ||
    (pest.common_name_ur && pest.common_name_ur.includes(search)) ||
    pest.category.toLowerCase().includes(search.toLowerCase())
  )

  const sortedPests = [...filteredPests].sort((a, b) => {
    const aVal = a[sortColumn] || ''
    const bVal = b[sortColumn] || ''
    if (sortDirection === 'asc') return aVal.localeCompare(bVal)
    return bVal.localeCompare(aVal)
  })

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const updatePestLocally = (id: string, updates: Partial<any>) => {
    setPests(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  const handleSave = async (id: string, field: string, newValue: string) => {
    const original = pests.find(p => p.id === id)
    updatePestLocally(id, { [field]: newValue })
    const { error } = await supabase.from('pests').update({ [field]: newValue }).eq('id', id)
    if (error) {
      updatePestLocally(id, { [field]: original?.[field] })
      alert('Error: ' + error.message)
    }
  }

  const fetchAndUpdateCommonName = async (id: string, scientificName: string) => {
    setRefreshingId(id)
    try {
      const res = await fetch(`/api/itis?name=${encodeURIComponent(scientificName)}`)
      const data = await res.json()
      if (res.ok && data.commonName) {
        updatePestLocally(id, { common_name_en: data.commonName })
        await supabase.from('pests').update({ common_name_en: data.commonName }).eq('id', id)
        setStatusMap(prev => ({ ...prev, [id]: 'match' }))
      } else {
        alert('Could not fetch common name')
      }
    } catch (err) {
      alert('Network error')
    } finally {
      setRefreshingId(null)
    }
  }

  const refreshScientificName = async (id: string, currentName: string) => {
    setRefreshingSciId(id)
    try {
      const res = await fetch(`/api/itis?name=${encodeURIComponent(currentName)}`)
      const data = await res.json()
      if (!res.ok || !data.commonName) {
        alert('No match found')
        setStatusMap(prev => ({ ...prev, [id]: 'mismatch' }))
        return
      }
      updatePestLocally(id, { common_name_en: data.commonName })
      await supabase.from('pests').update({ common_name_en: data.commonName }).eq('id', id)
      setStatusMap(prev => ({ ...prev, [id]: 'match' }))
    } catch (err) {
      alert('Network error')
    } finally {
      setRefreshingSciId(null)
    }
  }

  const getRowClass = (id: string, index: number) => {
    const base = index % 2 === 0 ? 'bg-muted/20' : '' // subtle striping
    const status = statusMap[id]
    if (status === 'match') return cn(base, 'bg-green-50/50 dark:bg-green-900/10')
    if (status === 'mismatch') return cn(base, 'bg-red-50/50 dark:bg-red-900/10')
    if (status === 'pending') return cn(base, 'bg-yellow-50/50 dark:bg-yellow-900/10')
    return base
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="rounded-md border">
          <div className="p-4 space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <span className="text-sm text-muted-foreground">{filteredPests.length} records</span>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16 text-center">Sr. No.</TableHead>
              <TableHead onClick={() => handleSort('scientific_name')} className="cursor-pointer">
                Scientific Name {sortColumn === 'scientific_name' && (sortDirection === 'asc' ? <ChevronUp className="inline h-4 w-4 ml-1" /> : <ChevronDown className="inline h-4 w-4 ml-1" />)}
              </TableHead>
              <TableHead onClick={() => handleSort('common_name_en')} className="cursor-pointer">
                Common Name (En) {sortColumn === 'common_name_en' && (sortDirection === 'asc' ? <ChevronUp className="inline h-4 w-4 ml-1" /> : <ChevronDown className="inline h-4 w-4 ml-1" />)}
              </TableHead>
              <TableHead onClick={() => handleSort('common_name_ur')} className="cursor-pointer">
                Common Name (Ur) {sortColumn === 'common_name_ur' && (sortDirection === 'asc' ? <ChevronUp className="inline h-4 w-4 ml-1" /> : <ChevronDown className="inline h-4 w-4 ml-1" />)}
              </TableHead>
              <TableHead onClick={() => handleSort('category')} className="cursor-pointer">
                Category {sortColumn === 'category' && (sortDirection === 'asc' ? <ChevronUp className="inline h-4 w-4 ml-1" /> : <ChevronDown className="inline h-4 w-4 ml-1" />)}
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {sortedPests.map((pest, index) => (
                <motion.tr
                  key={pest.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn('hover:bg-muted/50 transition-colors', getRowClass(pest.id, index))}
                >
                  <TableCell className="text-center text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <EditableCell
                        value={pest.scientific_name}
                        onSave={(newVal) => handleSave(pest.id, 'scientific_name', newVal)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => refreshScientificName(pest.id, pest.scientific_name)}
                        disabled={refreshingSciId === pest.id}
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      >
                        <RefreshCw className={`h-4 w-4 ${refreshingSciId === pest.id ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <EditableCell
                        value={pest.common_name_en || ''}
                        onSave={(newVal) => handleSave(pest.id, 'common_name_en', newVal)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => fetchAndUpdateCommonName(pest.id, pest.scientific_name)}
                        disabled={refreshingId === pest.id}
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      >
                        <RefreshCw className={`h-4 w-4 ${refreshingId === pest.id ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      value={pest.common_name_ur || ''}
                      onSave={(newVal) => handleSave(pest.id, 'common_name_ur', newVal)}
                    />
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      value={pest.category}
                      onSave={(newVal) => handleSave(pest.id, 'category', newVal)}
                      type="select"
                    />
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/pests/${pest.id}/edit`}>Edit</Link>
                    </Button>
                    <DeleteButton id={pest.id} />
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
            {sortedPests.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No pests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
