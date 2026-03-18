import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import ProductForm from '../../new/product-form'
import ClientOnly from '@/components/client-only'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch product details
  const { data: product } = await supabase
    .from('agrochemicals')
    .select('*')
    .eq('id', id)
    .single()

  if (!product) notFound()

  // Fetch linked pests
  const { data: pestLinks } = await supabase
    .from('product_pests')
    .select('pest_id')
    .eq('product_id', id)

  // Fetch linked crops
  const { data: cropLinks } = await supabase
    .from('product_crops')
    .select('crop_id')
    .eq('product_id', id)

  const initialData = {
    ...product,
    pests: pestLinks?.map(p => p.pest_id) || [],
    crops: cropLinks?.map(c => c.crop_id) || [],
  }

  // Fetch all pests and crops for dropdowns
  const { data: pests } = await supabase
    .from('pests')
    .select('id, scientific_name, common_name_en, category')
    .order('scientific_name')

  const { data: crops } = await supabase
    .from('crops')
    .select('id, name, common_name_en')
    .order('name')

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <ClientOnly>
        <ProductForm pests={pests || []} crops={crops || []} initialData={initialData} />
      </ClientOnly>
    </div>
  )
}
