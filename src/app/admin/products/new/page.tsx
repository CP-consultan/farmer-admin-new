import { createClient } from '@/utils/supabase/server'
import { LanguageProvider } from '@/contexts/language-context'
import ClientOnly from '@/components/client-only'
import ProductForm from './product-form'

export default async function NewProductPage() {
  const supabase = await createClient()

  const { data: pests } = await supabase
    .from('pests')
    .select('*')
    .order('scientific_name')

  const { data: crops } = await supabase
    .from('crops')
    .select('*')
    .order('name')

  return (
    <LanguageProvider>
      <ClientOnly>
        <ProductForm pests={pests || []} crops={crops || []} />
      </ClientOnly>
    </LanguageProvider>
  )
}
