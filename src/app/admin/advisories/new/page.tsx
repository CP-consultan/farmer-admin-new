import { createClient } from '@/utils/supabase/server'
import { LanguageProvider } from '@/contexts/language-context'
import ClientOnly from '@/components/client-only'
import AdvisoryForm from './advisory-form'

export default async function NewAdvisoryPage() {
  const supabase = await createClient()

  const { data: pests } = await supabase
    .from('pests')
    .select('*')
    .order('scientific_name')

  const { data: products } = await supabase
    .from('agrochemicals')
    .select('*')
    .order('name')

  return (
    <LanguageProvider>
      <ClientOnly>
        <AdvisoryForm pests={pests || []} products={products || []} />
      </ClientOnly>
    </LanguageProvider>
  )
}
