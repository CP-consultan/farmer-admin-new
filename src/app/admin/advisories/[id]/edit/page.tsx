import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import AdvisoryForm from '../../new/advisory-form'

export default async function EditAdvisoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch advisory details
  const { data: advisory } = await supabase
    .from('advisories')
    .select('*')
    .eq('id', id)
    .single()

  if (!advisory) notFound()

  // Fetch linked products
  const { data: links } = await supabase
    .from('advisory_products')
    .select('product_id')
    .eq('advisory_id', id)

  const linkedProductIds = links?.map(l => l.product_id) || []

  // Prepare initialData for form
  const initialData = {
    ...advisory,
    products: linkedProductIds
  }

  // Fetch pests and products (same as new page)
  const { data: pests } = await supabase
    .from('pests')
    .select('id, scientific_name, common_name_en, category')
    .order('scientific_name')

  const { data: products } = await supabase
    .from('agrochemicals')
    .select('id, name, type, sub_type, active_ingredient, dosage, application_method')
    .eq('type', 'pesticide')
    .order('name')

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Advisory</h1>
      <AdvisoryForm pests={pests || []} products={products || []} initialData={initialData} />
    </div>
  )
}
