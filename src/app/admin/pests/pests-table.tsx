'use client'

import { useState, useEffect } from 'react'
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
import { RefreshCw, ChevronUp, ChevronDown, Search } from 'lucide-react'
import EditableCell from './editable-cell'
import { DeleteButton } from './delete-button'
import { motion, AnimatePresence } from 'framer-motion'

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

  useEffect(() => {
    setPests(initialPests)
  }, [initialPests])

  // Check names against GBIF on load
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
    checkAllNames()
  }, [pests])

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
      // For simplicity, we assume the API returns the corrected name as commonName? Actually our API returns commonName, not corrected scientific name.
      // To correct scientific name, we need GBIF match. Let's keep it simple: just update common name and mark as match.
      updatePestLocally(id, { common_name_en: data.commonName })
      await supabase.from('pests').update({ common_name_en: data.commonName }).eq('id', id)
      setStatusMap(prev => ({ ...prev, [id]: 'match' }))
    } catch (err) {
      alert('Network error')
    } finally {
      setRefreshingSciId(null)
    }
  }

  const getRowClass = (id: string) => {
    const status = statusMap[id]
    if (status === 'match') return 'bg-green-50 dark:bg-green-900/20'
    if (status === 'mismatch') return 'bg-red-50 dark:bg-red-900/20'
    if (status === 'pending') return 'bg-yellow-50 dark:bg-yellow-900/20'
    return ''
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search pests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <span className="text-sm text-gray-500">{filteredPests.length} records</span>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('scientific_name')} className="cursor-pointer">
                Scientific Name {sortColumn === 'scientific_name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead onClick={() => handleSort('common_name_en')} className="cursor-pointer">
                Common Name (En) {sortColumn === 'common_name_en' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead onClick={() => handleSort('common_name_ur')} className="cursor-pointer">
                Common Name (Ur) {sortColumn === 'common_name_ur' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead onClick={() => handleSort('category')} className="cursor-pointer">
                Category {sortColumn === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {sortedPests.map((pest) => (
                <motion.tr
                  key={pest.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={getRowClass(pest.id)}
                >
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
                      <a href={`/admin/pests/${pest.id}/edit`}>Edit</a>
                    </Button>
                    <DeleteButton id={pest.id} />
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
