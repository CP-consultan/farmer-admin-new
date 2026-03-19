'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SpeakButton } from '@/components/speak-button'
import { useLanguage } from '@/contexts/language-context'

interface PestDetailContentProps {
  pest: any
}

export default function PestDetailContent({ pest }: PestDetailContentProps) {
  const { t, language } = useLanguage()

  const fullDescription = `${t('pests.table.scientific_name')}: ${pest.scientific_name}. ` +
    `${t('pests.table.common_name_en')}: ${pest.common_name_en || '-'}. ` +
    `${t('pests.table.common_name_ur')}: ${pest.common_name_ur || '-'}. ` +
    `${t('pests.table.category')}: ${pest.category || '-'}.`

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">{pest.scientific_name}</h1>
          <SpeakButton text={fullDescription} />
        </div>
        <div className="space-x-2">
          <Link href={`/admin/pests/${pest.id}/edit`}>
            <Button variant="outline">{t('pests.edit')}</Button>
          </Link>
          <Link href="/admin/pests">
            <Button variant="ghost">{t('product.back_to_list')}</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('pests.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('pests.table.scientific_name')}</p>
            <p>{pest.scientific_name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('pests.table.common_name_en')}</p>
            <p>{pest.common_name_en || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('pests.table.common_name_ur')}</p>
            <p>{pest.common_name_ur || '-'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('pests.table.category')}</p>
            <p className="capitalize">{pest.category || '-'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
