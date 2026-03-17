import { createClient } from '@/utils/supabase/server'
import ProductForm from './product-form'
import ClientOnly from '@/components/client-only'

export default async function NewProductPage() {
  const supabase = await createClient()
  const { data: pests } = await supabase
    .from('pests')
    .select('id, scientific_name, common_name_en')
    .order('scientific_name')

  const { data: crops } = await supabase
    .from('crops')
    .select('id, name, common_name_en')
    .order('name')

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
      <ClientOnly>
        <ProductForm pests={pests || []} crops={crops || []} />
      </ClientOnly>
    </div>
  )
}
