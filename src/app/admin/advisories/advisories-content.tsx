'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
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
import { DeleteButton } from './delete-button'
import { useLanguage } from '@/contexts/language-context'
import { EditableCell } from '@/components/editable-cell'
import { Search } from 'lucide-react'

interface Advisory {
  id: string
  pest_id: string
  title: string
  title_ur: string | null
  pests: {
    scientific_name: string
    common_name_en: string | null
    common_name_ur: string | null
  }
}

interface AdvisoriesContentProps {
  advisories: Advisory[]
}

export default function AdvisoriesContent({ advisories }: AdvisoriesContentProps) {
  const { t, language } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredAdvisories = useMemo(() => {
    if (!searchTerm.trim()) return advisories
    const lower = searchTerm.toLowerCase()
    return advisories.filter(adv =>
      (adv.pests?.scientific_name && adv.pests.scientific_name.toLowerCase().includes(lower)) ||
      (adv.title && adv.title.toLowerCase().includes(lower)) ||
      (adv.title_ur && adv.title_ur.toLowerCase().includes(lower))
    )
  }, [advisories, searchTerm])

  const refreshPage = () => {
    window.location.reload()
  }

  const getPestDisplay = (pest: Advisory['pests']) => {
    if (language === 'ur' && pest?.common_name_ur) {
      return `${pest.scientific_name} (${pest.common_name_ur})`
    }
    return pest?.common_name_en 
      ? `${pest.scientific_name} (${pest.common_name_en})`
      : pest?.scientific_name
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('advisories.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('advisories.description')}</p>
        </div>
        <Link href="/admin/advisories/new">
          <Button>{t('advisories.add_new')}</Button>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search advisories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        {searchTerm && (
          <Button variant="ghost" size="sm" onClick={() => setSearchTerm('')}>
            Clear
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">{t('table.sr_no')}</TableHead>
              <TableHead>{t('advisories.table.pest')}</TableHead>
              <TableHead>{t('advisories.table.title')}</TableHead>
              <TableHead>{t('advisories.table.title_ur')}</TableHead>
              <TableHead className="text-right">{t('advisories.table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAdvisories.length > 0 ? (
              filteredAdvisories.map((adv, idx) => (
                <TableRow key={adv.id}>
                  <TableCell className="text-center">{idx + 1}</TableCell>
                  <TableCell className="font-medium">
                    {adv.pests ? getPestDisplay(adv.pests) : '—'}
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      value={adv.title}
                      rowId={adv.id}
                      table="advisories"
                      column="title"
                      onUpdate={refreshPage}
                    />
                  </TableCell>
                  <TableCell>
                    <EditableCell
                      value={adv.title_ur}
                      rowId={adv.id}
                      table="advisories"
                      column="title_ur"
                      onUpdate={refreshPage}
                    />
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={`/admin/advisories/${adv.id}/edit`}>
                      <Button variant="outline" size="sm">{t('advisories.edit')}</Button>
                    </Link>
                    <DeleteButton id={adv.id} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  {t('advisories.no_advisories')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
