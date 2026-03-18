import { createClient } from '@/utils/supabase/server'
import AdvisoryForm from './advisory-form'
import ClientOnly from '@/components/client-only'

export default async function NewAdvisoryPage() {
  const supabase = await createClient()
  
  // Fetch all pests for dropdown
  const { data: pests } = await supabase
    .from('pests')
    .select('id, scientific_name, common_name_en, category')
    .order('scientific_name')

  // Fetch all products (only pesticides, maybe with type filter)
  const { data: products } = await supabase
    .from('agrochemicals')
    .select('id, name, type, sub_type, active_ingredient, dosage, application_method')
    .eq('type', 'pesticide')
    .order('name')

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Advisory</h1>
      <ClientOnly>
        <AdvisoryForm pests={pests || []} products={products || []} />
      </ClientOnly>
    </div>
  )
}
