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
      *,
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
