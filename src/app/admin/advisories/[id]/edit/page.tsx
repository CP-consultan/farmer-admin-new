import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { LanguageProvider } from '@/contexts/language-context'
import ClientOnly from '@/components/client-only'
import AdvisoryForm from '../../new/advisory-form'

export default async function EditAdvisoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: advisory } = await supabase
    .from('advisories')
    .select(`
      *,
      advisory_products!inner(product_id)
    `)
    .eq('id', id)
    .single()

  if (!advisory) notFound()

  const productIds = advisory.advisory_products.map((ap: any) => ap.product_id)

  const { data: pests } = await supabase
    .from('pests')
    .select('*')
    .order('scientific_name')

  const { data: products } = await supabase
    .from('agrochemicals')
    .select('*')
    .order('name')

  const initialData = {
    ...advisory,
    products: productIds
  }

  return (
    <LanguageProvider>
      <ClientOnly>
        <AdvisoryForm pests={pests || []} products={products || []} initialData={initialData} />
      </ClientOnly>
    </LanguageProvider>
  )
}
