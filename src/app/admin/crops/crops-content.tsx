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

interface Crop {
  id: string
  name: string
  name_ur: string | null
  common_name_en: string | null
  category: string | null
}

interface CropsContentProps {
  crops: Crop[]
}

const categories = ['cereal', 'vegetable', 'fruit', 'legume', 'oilseed', 'fiber', 'other']

export default function CropsContent({ crops }: CropsContentProps) {
  const { t } = useLanguage()

  const refreshPage = () => {
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t('crops.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('crops.description')}</p>
        </div>
        <Link href="/admin/crops/new">
          <Button>{t('crops.add_new')}</Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">{t('table.sr_no')}</TableHead>
              <TableHead>{t('crops.table.name')}</TableHead>
              <TableHead>{t('crops.table.name_ur')}</TableHead>
              <TableHead>{t('crops.table.common_name_en')}</TableHead>
              <TableHead>{t('crops.table.category')}</TableHead>
              <TableHead className="text-right">{t('crops.table.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {crops?.map((crop, idx) => (
              <TableRow key={crop.id}>
                <TableCell className="text-center">{idx + 1}</TableCell>
                <TableCell className="font-medium">
                  <Link
                    href={`/admin/crops/${crop.id}`}
                    className="hover:underline hover:text-blue-600 transition-colors"
                  >
                    {crop.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <EditableCell
                    value={crop.name_ur}
                    rowId={crop.id}
                    table="crops"
                    column="name_ur"
                    onUpdate={refreshPage}
                  />
                </TableCell>
                <TableCell>
                  <EditableCell
                    value={crop.common_name_en}
                    rowId={crop.id}
                    table="crops"
                    column="common_name_en"
                    onUpdate={refreshPage}
                  />
                </TableCell>
                <TableCell>
                  <EditableCell
                    value={crop.category}
                    rowId={crop.id}
                    table="crops"
                    column="category"
                    type="select"
                    options={categories}
                    onUpdate={refreshPage}
                  />
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Link href={`/admin/crops/${crop.id}/edit`}>
                    <Button variant="outline" size="sm">{t('crops.edit')}</Button>
                  </Link>
                  <DeleteButton id={crop.id} />
                </TableCell>
              </TableRow>
            ))}
            {(!crops || crops.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  {t('crops.no_crops')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
