import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { LanguageProvider } from '@/contexts/language-context'
import ClientOnly from '@/components/client-only'
import PestDetailContent from './pest-detail-content'

export default async function PestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: pest } = await supabase
    .from('pests')
    .select('*')
    .eq('id', id)
    .single()

  if (!pest) notFound()

  return (
    <LanguageProvider>
      <ClientOnly>
        <PestDetailContent pest={pest} />
      </ClientOnly>
    </LanguageProvider>
  )
}
