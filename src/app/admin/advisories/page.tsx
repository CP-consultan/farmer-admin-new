import { createClient } from '@/utils/supabase/server'
import { LanguageProvider } from '@/contexts/language-context'
import ClientOnly from '@/components/client-only'
import AdvisoriesContent from './advisories-content'

export default async function AdvisoriesPage() {
  const supabase = await createClient()

  const { data: advisories } = await supabase
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
      pests:scientific_name, common_name_en, common_name_ur
    `)
    .order('created_at', { ascending: false })

  return (
    <LanguageProvider>
      <ClientOnly>
        <AdvisoriesContent advisories={advisories || []} />
      </ClientOnly>
    </LanguageProvider>
  )
}
