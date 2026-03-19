'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SpeakButton } from '@/components/speak-button'
import { useLanguage } from '@/contexts/language-context'

type PestInfo = {
  scientific_name: string
  common_name_en: string | null
}

type CropInfo = {
  name: string
  common_name_en: string | null
}

interface ProductDetailContentProps {
  product: any
  pests: PestInfo[]
  crops: CropInfo[]
}

export default function ProductDetailContent({ product, pests, crops }: ProductDetailContentProps) {
  const { t } = useLanguage()

  // Build comprehensive description for speech
  const fullDescriptionParts: string[] = []
  fullDescriptionParts.push(`${t('product.details')}: ${product.name}.`)
  if (product.type) fullDescriptionParts.push(`${t('product.type')}: ${product.type}.`)
  if (product.sub_type) fullDescriptionParts.push(`${t('product.subtype')}: ${product.sub_type}.`)
  if (product.active_ingredient) fullDescriptionParts.push(`${t('product.active_ingredient')}: ${product.active_ingredient}.`)
  if (product.mode_of_action) fullDescriptionParts.push(`${t('product.mode_of_action')}: ${product.mode_of_action}.`)
  if (product.dosage) fullDescriptionParts.push(`${t('product.dosage')}: ${product.dosage}.`)
  if (product.application_method) fullDescriptionParts.push(`${t('product.application_method')}: ${product.application_method}.`)
  if (product.manufacturer) fullDescriptionParts.push(`${t('product.manufacturer')}: ${product.manufacturer}.`)
  if (product.safety_info) fullDescriptionParts.push(`${t('product.safety_info')}: ${product.safety_info}.`)
  if (pests.length > 0) {
    const pestNames = pests.map(p => p.common_name_en ? `${p.scientific_name} (${p.common_name_en})` : p.scientific_name).join(', ')
    fullDescriptionParts.push(`${t('product.target_pests')}: ${pestNames}.`)
  }
  if (crops.length > 0) {
    const cropNames = crops.map(c => c.common_name_en ? `${c.name} (${c.common_name_en})` : c.name).join(', ')
    fullDescriptionParts.push(`${t('product.applicable_crops')}: ${cropNames}.`)
  }
  const fullDescription = fullDescriptionParts.join(' ')

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <SpeakButton text={fullDescription} />
        </div>
        <div className="space-x-2">
          <Link href={`/admin/products/${product.id}/edit`}>
            <Button variant="outline">{t('product.edit')}</Button>
          </Link>
          <Link href="/admin/products">
            <Button variant="ghost">{t('product.back_to_list')}</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('product.details')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('product.type')}</p>
            <p className="capitalize">{product.type}</p>
          </div>
          {product.sub_type && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('product.subtype')}</p>
              <p>{product.sub_type}</p>
            </div>
          )}
          {product.active_ingredient && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('product.active_ingredient')}</p>
              <p>{product.active_ingredient}</p>
            </div>
          )}
          {product.mode_of_action && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('product.mode_of_action')}</p>
              <p>{product.mode_of_action}</p>
            </div>
          )}
          {product.dosage && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('product.dosage')}</p>
              <p>{product.dosage}</p>
            </div>
          )}
          {product.application_method && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('product.application_method')}</p>
              <p>{product.application_method}</p>
            </div>
          )}
          {product.manufacturer && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('product.manufacturer')}</p>
              <p>{product.manufacturer}</p>
            </div>
          )}
          {product.safety_info && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('product.safety_info')}</p>
              <p className="whitespace-pre-wrap">{product.safety_info}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {pests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('product.target_pests')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {pests.map((pest, idx) => (
                <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                  {pest.scientific_name}
                  {pest.common_name_en && ` (${pest.common_name_en})`}
                  <SpeakButton text={pest.scientific_name} />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {crops.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('product.applicable_crops')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {crops.map((crop, idx) => (
                <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                  {crop.name}
                  {crop.common_name_en && ` (${crop.common_name_en})`}
                  <SpeakButton text={crop.name} />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
