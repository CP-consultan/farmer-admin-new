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

interface Pest {
  id: string
  scientific_name: string
  common_name_en: string | null
  common_name_ur: string | null
  category: string
}

interface PestsContentProps {
  pests: Pest[]
}

export default function PestsContent({ pests }: PestsContentProps) {
  const { t, language } = useLanguage()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('pests.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('pests.description')}</p>
        </div>
        <Link href="/admin/pests/new">
          <Button>{t('pests.add_new')}</Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('pests.table.scientific_name')}</TableHead>
              <TableHead>{t('pests.table.common_name_en')}</TableHead>
              <TableHead>{t('pests.table.common_name_ur')}</TableHead>
              <TableHead>{t('pests.table.category')}</TableHead>
              <TableHead className="text-right">{t('pests.table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pests?.map((pest) => (
              <TableRow key={pest.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/admin/pests/${pest.id}`}
                    className="hover:underline hover:text-blue-600 transition-colors"
                  >
                    {pest.scientific_name}
                  </Link>
                </TableCell>
                <TableCell>{pest.common_name_en || '-'}</TableCell>
                <TableCell>{pest.common_name_ur || '-'}</TableCell>
                <TableCell className="capitalize">{pest.category || '-'}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Link href={`/admin/pests/${pest.id}/edit`}>
                    <Button variant="outline" size="sm">{t('pests.edit')}</Button>
                  </Link>
                  <DeleteButton id={pest.id} />
                </TableCell>
              </TableRow>
            ))}
            {(!pests || pests.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  {t('pests.no_pests')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
