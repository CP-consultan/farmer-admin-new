import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { LanguageProvider } from '@/contexts/language-context'
import ClientOnly from '@/components/client-only'
import PestForm from '../../new/pest-form'

export default async function EditPestPage({ params }: { params: Promise<{ id: string }> }) {
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
        <PestForm initialData={pest} />
      </ClientOnly>
    </LanguageProvider>
  )
}
