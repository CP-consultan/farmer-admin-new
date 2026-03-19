import { createClient } from '@/utils/supabase/server'
import { LanguageProvider } from '@/contexts/language-context'
import ClientOnly from '@/components/client-only'
import CropsContent from './crops-content'

export default async function CropsPage() {
  const supabase = await createClient()

  const { data: crops } = await supabase
    .from('crops')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <LanguageProvider>
      <ClientOnly>
        <CropsContent crops={crops || []} />
      </ClientOnly>
    </LanguageProvider>
  )
}
