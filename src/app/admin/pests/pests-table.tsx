'use client'

import { useState } from 'react'
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
import { RefreshCw, Search } from 'lucide-react'
import EditableCell from './editable-cell'
import { DeleteButton } from './delete-button'

export default function PestsTable({ initialPests }: { initialPests: any[] }) {
  const [pests, setPests] = useState(initialPests)
  const [search, setSearch] = useState('')
  const [refreshingId, setRefreshingId] = useState<string | null>(null) // new state for button loading
  const router = useRouter()
  const supabase = createClient()

  const filteredPests = pests.filter(pest =>
    pest.scientific_name.toLowerCase().includes(search.toLowerCase()) ||
    (pest.common_name_en && pest.common_name_en.toLowerCase().includes(search.toLowerCase())) ||
    (pest.common_name_ur && pest.common_name_ur.includes(search)) ||
    pest.category.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = async (id: string, field: string, newValue: string) => {
    const original = pests.find(p => p.id === id)
    setPests(prev => prev.map(p => p.id === id ? { ...p, [field]: newValue } : p))
    const { error } = await supabase.from('pests').update({ [field]: newValue }).eq('id', id)
    if (error) {
      setPests(prev => prev.map(p => p.id === id ? original! : p))
      alert('Error: ' + error.message)
    }
  }

  // New function: fetch common name from our API and update
  const fetchAndUpdateCommonName = async (id: string, scientificName: string) => {
    setRefreshingId(id)
    try {
      const res = await fetch(`/api/itis?name=${encodeURIComponent(scientificName)}`)
      const data = await res.json()
      if (res.ok && data.commonName) {
        // Optimistically update local state
        setPests(prev => prev.map(p => p.id === id ? { ...p, common_name_en: data.commonName } : p))
        // Persist to database
        await supabase.from('pests').update({ common_name_en: data.commonName }).eq('id', id)
      } else {
        alert('Could not fetch common name: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      alert('Network error while fetching common name')
    } finally {
      setRefreshingId(null)
    }
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
              <TableHead>Scientific Name</TableHead>
              <TableHead>Common Name (En)</TableHead>
              <TableHead>Common Name (Ur)</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPests.map((pest, index) => (
              <TableRow key={pest.id}>
                <TableCell className="text-center text-muted-foreground">{index + 1}</TableCell>
                <TableCell className="font-medium">
                  <EditableCell
                    value={pest.scientific_name}
                    onSave={(newVal) => handleSave(pest.id, 'scientific_name', newVal)}
                  />
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
              </TableRow>
            ))}
            {filteredPests.length === 0 && (
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
