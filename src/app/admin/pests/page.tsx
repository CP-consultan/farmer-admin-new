import { createClient } from '@/utils/supabase/server'
import { LanguageProvider } from '@/contexts/language-context'
import ClientOnly from '@/components/client-only'
import PestsContent from './pests-content'

export default async function PestsPage() {
  const supabase = await createClient()

  const { data: pests } = await supabase
    .from('pests')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <LanguageProvider>
      <ClientOnly>
        <PestsContent pests={pests || []} />
      </ClientOnly>
    </LanguageProvider>
  )
}
