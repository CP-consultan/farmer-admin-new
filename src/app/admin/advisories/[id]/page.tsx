import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { LanguageProvider } from '@/contexts/language-context'
import ClientOnly from '@/components/client-only'
import AdvisoryDetailContent from './advisory-detail-content'

export default async function AdvisoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: advisory } = await supabase
    .from('advisories')
    .select(`
      id,
      pest_id,
      title,
      title_ur,
      description,
      description_ur,
      chemical_control,
      chemical_control_ur,
      cultural_control,
      cultural_control_ur,
      biological_control,
      biological_control_ur,
      created_at,
      pests:scientific_name, common_name_en, common_name_ur,
      advisory_products(product_id, products(name))
    `)
    .eq('id', id)
    .single()

  if (!advisory) notFound()

  return (
    <LanguageProvider>
      <ClientOnly>
        <AdvisoryDetailContent advisory={advisory} />
      </ClientOnly>
    </LanguageProvider>
  )
}
