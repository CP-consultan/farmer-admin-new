import { createClient } from '@/utils/supabase/server'
import { LanguageProvider } from '@/contexts/language-context'
import ClientOnly from '@/components/client-only'
import AdvisoriesContent from './advisories-content'

export default async function AdvisoriesPage() {
  const supabase = await createClient()

  const { data: advisories } = await supabase
    .from('advisories')
    .select(`
      *,
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
