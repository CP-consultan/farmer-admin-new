'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { DeleteButton } from './delete-button'
import EditableCell from './editable-cell'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RefreshCw, ChevronUp, ChevronDown, Search } from 'lucide-react'

export default function SearchablePestsTable({ pests: initialPests }: { pests: any[] }) {
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

  useEffect(() => {
    const checkAllNames = async () => {
      for (const pest of pests) {
        if (statusMap[pest.id]) continue
        setStatusMap(prev => ({ ...prev, [pest.id]: 'pending' }))
        try {
          const res = await fetch(`https://api.gbif.org/v1/species/match?name=${encodeURIComponent(pest.scientific_name)}&verbose=true`)
          const data = await res.json()
          if (!data.usageKey) {
            setStatusMap(prev => ({ ...prev, [pest.id]: 'mismatch' }))
          } else {
            const acceptedName = data.scientificName || data.canonicalName || ''
            const isMatch = acceptedName.toLowerCase() === pest.scientific_name.toLowerCase()
            setStatusMap(prev => ({ ...prev, [pest.id]: isMatch ? 'match' : 'mismatch' }))
          }
        } catch {
          setStatusMap(prev => ({ ...prev, [pest.id]: 'mismatch' }))
        }
        await new Promise(resolve => setTimeout(resolve, 300))
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

  const checkSinglePest = async (id: string, scientificName: string) => {
    setStatusMap(prev => ({ ...prev, [id]: 'pending' }))
    try {
      const res = await fetch(`https://api.gbif.org/v1/species/match?name=${encodeURIComponent(scientificName)}&verbose=true`)
      const data = await res.json()
      if (!data.usageKey) {
        setStatusMap(prev => ({ ...prev, [id]: 'mismatch' }))
      } else {
        const acceptedName = data.scientificName || data.canonicalName || ''
        const isMatch = acceptedName.toLowerCase() === scientificName.toLowerCase()
        setStatusMap(prev => ({ ...prev, [id]: isMatch ? 'match' : 'mismatch' }))
      }
    } catch {
      setStatusMap(prev => ({ ...prev, [id]: 'mismatch' }))
    }
  }

  const fetchAndUpdateCommonName = async (id: string, scientificName: string) => {
    setRefreshingId(id)
    try {
      const response = await fetch(`/api/itis?name=${encodeURIComponent(scientificName)}`)
      const data = await response.json()
      if (response.ok && data.commonName) {
        updatePestLocally(id, { common_name_en: data.commonName })
        await supabase.from('pests').update({ common_name_en: data.commonName }).eq('id', id)
      } else {
        alert('Could not fetch common name: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      console.error(err)
      alert('Network error')
    } finally {
      setRefreshingId(null)
    }
  }

  const refreshScientificName = async (id: string, currentName: string) => {
    setRefreshingSciId(id)
    try {
      const matchUrl = `https://api.gbif.org/v1/species/match?name=${encodeURIComponent(currentName)}&verbose=true`
      const matchResponse = await fetch(matchUrl)
      const matchData = await matchResponse.json()

      if (!matchData.usageKey) {
        alert('Could not find this name in the taxonomic database')
        return
      }

      let correctedName = matchData.scientificName || matchData.canonicalName || currentName

      if (correctedName !== currentName) {
        updatePestLocally(id, { scientific_name: correctedName })
        setStatusMap(prev => ({ ...prev, [id]: 'pending' }))

        const { error } = await supabase
          .from('pests')
          .update({ scientific_name: correctedName })
          .eq('id', id)

        if (error) {
          updatePestLocally(id, { scientific_name: currentName })
          await checkSinglePest(id, currentName)
          alert('Failed to update scientific name: ' + error.message)
        } else {
          alert(`Scientific name corrected to: ${correctedName}`)
          await checkSinglePest(id, correctedName)
          await fetchAndUpdateCommonName(id, correctedName)
        }
      } else {
        await checkSinglePest(id, currentName)
        alert('Name is already correct.')
      }
    } catch (err) {
      console.error(err)
      alert('Network error')
    } finally {
      setRefreshingSciId(null)
    }
  }

  const getRowClass = (pestId: string) => {
    const status = statusMap[pestId]
    if (status === 'match') return 'bg-green-50 dark:bg-green-900/20'
    if (status === 'mismatch') return 'bg-red-50 dark:bg-red-900/20'
    if (status === 'pending') return 'bg-yellow-50 dark:bg-yellow-900/20'
    return ''
  }

  return (
    <div className="space-y-4">
      {/* Search */}
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

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('scientific_name')} className="cursor-pointer">
                Scientific Name {sortColumn === 'scientific_name' && (sortDirection === 'asc' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />)}
              </TableHead>
              <TableHead onClick={() => handleSort('common_name_en')} className="cursor-pointer">
                Common Name (En) {sortColumn === 'common_name_en' && (sortDirection === 'asc' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />)}
              </TableHead>
              <TableHead onClick={() => handleSort('common_name_ur')} className="cursor-pointer">
                Common Name (Ur) {sortColumn === 'common_name_ur' && (sortDirection === 'asc' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />)}
              </TableHead>
              <TableHead onClick={() => handleSort('category')} className="cursor-pointer">
                Category {sortColumn === 'category' && (sortDirection === 'asc' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />)}
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
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`border-b transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${getRowClass(pest.id)}`}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <EditableCell
                        value={pest.scientific_name || ''}
                        onSave={async (newValue) => {
                          updatePestLocally(pest.id, { scientific_name: newValue })
                          const { error } = await supabase
                            .from('pests')
                            .update({ scientific_name: newValue })
                            .eq('id', pest.id)
                          if (error) {
                            alert('Error updating: ' + error.message)
                          } else {
                            await checkSinglePest(pest.id, newValue)
                          }
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => refreshScientificName(pest.id, pest.scientific_name)}
                        disabled={refreshingSciId === pest.id}
                        className="h-6 w-6"
                      >
                        <RefreshCw className={`h-4 w-4 ${refreshingSciId === pest.id ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <EditableCell
                        value={pest.common_name_en || ''}
                        onSave={async (newValue) => {
                          updatePestLocally(pest.id, { common_name_en: newValue })
                          await supabase.from('pests').update({ common_name_en: newValue }).eq('id', pest.id)
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => fetchAndUpdateCommonName(pest.id, pest.scientific_name)}
                        disabled={refreshingId === pest.id}
                        className="h-6 w-6"
                      >
                        <RefreshCw className={`h-4 w-4 ${refreshingId === pest.id ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      value={pest.common_name_ur || ''}
                      onSave={async (newValue) => {
                        updatePestLocally(pest.id, { common_name_ur: newValue })
                        await supabase.from('pests').update({ common_name_ur: newValue }).eq('id', pest.id)
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      value={pest.category || ''}
                      onSave={async (newValue) => {
                        updatePestLocally(pest.id, { category: newValue })
                        await supabase.from('pests').update({ category: newValue }).eq('id', pest.id)
                      }}
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
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No pests found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
