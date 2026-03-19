'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SpeakButton } from '@/components/speak-button'
import { useLanguage } from '@/contexts/language-context'

interface AdvisoryDetailContentProps {
  advisory: any
}

export default function AdvisoryDetailContent({ advisory }: AdvisoryDetailContentProps) {
  const { t, language } = useLanguage()

  const pest = advisory.pests
  const pestName = language === 'ur' && pest?.common_name_ur
    ? `${pest.scientific_name} (${pest.common_name_ur})`
    : pest?.scientific_name

  const fullDescriptionParts = [
    `${t('advisory_form.select_pest')}: ${pestName}`,
    `${t('advisory_form.title')}: ${advisory.title}`,
    `${t('advisory_form.title_ur')}: ${advisory.title_ur || '-'}`,
    `${t('advisory_form.description')}: ${advisory.description || '-'}`,
    `${t('advisory_form.description_ur')}: ${advisory.description_ur || '-'}`,
    `${t('advisory_form.chemical_control')}: ${advisory.chemical_control || '-'}`,
    `${t('advisory_form.chemical_control_ur')}: ${advisory.chemical_control_ur || '-'}`,
    `${t('advisory_form.cultural_control')}: ${advisory.cultural_control || '-'}`,
    `${t('advisory_form.cultural_control_ur')}: ${advisory.cultural_control_ur || '-'}`,
    `${t('advisory_form.biological_control')}: ${advisory.biological_control || '-'}`,
    `${t('advisory_form.biological_control_ur')}: ${advisory.biological_control_ur || '-'}`,
  ]
  if (advisory.advisory_products?.length) {
    const productNames = advisory.advisory_products.map((ap: any) => ap.products.name).join(', ')
    fullDescriptionParts.push(`${t('advisory_form.recommended_products')}: ${productNames}`)
  }
  const fullDescription = fullDescriptionParts.join('. ')

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">{advisory.title}</h1>
          <SpeakButton text={fullDescription} />
        </div>
        <div className="space-x-2">
          <Link href={`/admin/advisories/${advisory.id}/edit`}>
            <Button variant="outline">{t('advisories.edit')}</Button>
          </Link>
          <Link href="/admin/advisories">
            <Button variant="ghost">{t('product.back_to_list')}</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('advisory_form.select_pest')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{pestName}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('advisory_form.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{advisory.title}</p>
          {advisory.title_ur && (
            <p className="mt-2 text-muted-foreground">{advisory.title_ur}</p>
          )}
        </CardContent>
      </Card>

      {advisory.description && (
        <Card>
          <CardHeader>
            <CardTitle>{t('advisory_form.description')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{advisory.description}</p>
            {advisory.description_ur && (
              <p className="mt-2 text-muted-foreground">{advisory.description_ur}</p>
            )}
          </CardContent>
        </Card>
      )}

      {advisory.chemical_control && (
        <Card>
          <CardHeader>
            <CardTitle>{t('advisory_form.chemical_control')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{advisory.chemical_control}</p>
            {advisory.chemical_control_ur && (
              <p className="mt-2 text-muted-foreground">{advisory.chemical_control_ur}</p>
            )}
          </CardContent>
        </Card>
      )}

      {advisory.cultural_control && (
        <Card>
          <CardHeader>
            <CardTitle>{t('advisory_form.cultural_control')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{advisory.cultural_control}</p>
            {advisory.cultural_control_ur && (
              <p className="mt-2 text-muted-foreground">{advisory.cultural_control_ur}</p>
            )}
          </CardContent>
        </Card>
      )}

      {advisory.biological_control && (
        <Card>
          <CardHeader>
            <CardTitle>{t('advisory_form.biological_control')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{advisory.biological_control}</p>
            {advisory.biological_control_ur && (
              <p className="mt-2 text-muted-foreground">{advisory.biological_control_ur}</p>
            )}
          </CardContent>
        </Card>
      )}

      {advisory.advisory_products?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('advisory_form.recommended_products')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5">
              {advisory.advisory_products.map((ap: any) => (
                <li key={ap.product_id}>{ap.products.name}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
