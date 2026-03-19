'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SpeakButton } from '@/components/speak-button'
import { useLanguage } from '@/contexts/language-context'

interface CropDetailContentProps {
  crop: any
}

export default function CropDetailContent({ crop }: CropDetailContentProps) {
  const { t } = useLanguage()

  const fullDescription = `${t('crops.table.name')}: ${crop.name}. ` +
    `${t('crops.table.name_ur')}: ${crop.name_ur || '-'}. ` +
    `${t('crops.table.common_name_en')}: ${crop.common_name_en || '-'}. ` +
    `${t('crops.table.category')}: ${crop.category || '-'}.`

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">{crop.name}</h1>
          <SpeakButton text={fullDescription} />
        </div>
        <div className="space-x-2">
          <Link href={`/admin/crops/${crop.id}/edit`}>
            <Button variant="outline">{t('crops.edit')}</Button>
          </Link>
          <Link href="/admin/crops">
            <Button variant="ghost">{t('product.back_to_list')}</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('crops.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('crops.table.name')}</p>
            <p>{crop.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('crops.table.name_ur')}</p>
            <p>{crop.name_ur || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('crops.table.common_name_en')}</p>
            <p>{crop.common_name_en || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('crops.table.category')}</p>
            <p className="capitalize">{crop.category || '-'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
