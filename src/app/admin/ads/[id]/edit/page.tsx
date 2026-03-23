import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { LanguageProvider } from '@/contexts/language-context'
import ClientOnly from '@/components/client-only'
import AdForm from '../new/ad-form'

export default async function EditAdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: ad } = await supabase
    .from('ads')
    .select('*')
    .eq('id', id)
    .single()
  if (!ad) notFound()
  return (
    <LanguageProvider>
      <ClientOnly>
        <AdForm initialData={ad} />
      </ClientOnly>
    </LanguageProvider>
  )
}
