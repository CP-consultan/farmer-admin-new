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
import { EditableCell } from '@/components/editable-cell'

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

const categories = ['weed', 'insect', 'fungus', 'bacteria', 'nematode', 'mite', 'virus', 'other']

export default function PestsContent({ pests }: PestsContentProps) {
  const { t } = useLanguage()

  const refreshPage = () => {
    window.location.reload()
  }

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
              <TableHead className="w-12">{t('table.sr_no')}</TableHead>
              <TableHead>{t('pests.table.scientific_name')}</TableHead>
              <TableHead>{t('pests.table.common_name_en')}</TableHead>
              <TableHead>{t('pests.table.common_name_ur')}</TableHead>
              <TableHead>{t('pests.table.category')}</TableHead>
              <TableHead className="text-right">{t('pests.table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pests?.map((pest, idx) => (
              <TableRow key={pest.id}>
                <TableCell className="text-center">{idx + 1}</TableCell>
                <TableCell className="font-medium">
                  <Link
                    href={`/admin/pests/${pest.id}`}
                    className="hover:underline hover:text-blue-600 transition-colors"
                  >
                    {pest.scientific_name}
                  </Link>
                </TableCell>
                <TableCell>
                  <EditableCell
                    value={pest.common_name_en}
                    rowId={pest.id}
                    table="pests"
                    column="common_name_en"
                    onUpdate={refreshPage}
                  />
                </TableCell>
                <TableCell>
                  <EditableCell
                    value={pest.common_name_ur}
                    rowId={pest.id}
                    table="pests"
                    column="common_name_ur"
                    onUpdate={refreshPage}
                  />
                </TableCell>
                <TableCell>
                  <EditableCell
                    value={pest.category}
                    rowId={pest.id}
                    table="pests"
                    column="category"
                    type="select"
                    options={categories}
                    onUpdate={refreshPage}
                  />
                </TableCell>
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
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
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
