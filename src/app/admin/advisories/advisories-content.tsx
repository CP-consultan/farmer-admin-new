'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('advisories.table.pest')}</TableHead>
              <TableHead>{t('advisories.table.title')}</TableHead>
              <TableHead>{t('advisories.table.title_ur')}</TableHead>
              <TableHead className="text-right">{t('advisories.table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {advisories?.map((adv) => (
              <TableRow key={adv.id}>
                <TableCell className="font-medium">
                  {adv.pests?.scientific_name || ''}
                  {adv.pests?.common_name_en ? ` (${adv.pests.common_name_en})` : ''}
                </TableCell>
                <TableCell>{adv.title}</TableCell>
                <TableCell>{adv.title_ur || '-'}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Link href={`/admin/advisories/${adv.id}/edit`}>
                    <Button variant="outline" size="sm">{t('advisories.edit')}</Button>
                  </Link>
                  <DeleteButton id={adv.id} />
                </TableCell>
              </TableRow>
            ))}
            {(!advisories || advisories.length === 0) && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
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
