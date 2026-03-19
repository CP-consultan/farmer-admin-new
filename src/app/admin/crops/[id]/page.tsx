import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { LanguageProvider } from '@/contexts/language-context'
import ClientOnly from '@/components/client-only'
import CropDetailContent from './crop-detail-content'

export default async function CropDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: crop } = await supabase
    .from('crops')
    .select('*')
    .eq('id', id)
    .single()

  if (!crop) notFound()

  return (
    <LanguageProvider>
      <ClientOnly>
        <CropDetailContent crop={crop} />
      </ClientOnly>
    </LanguageProvider>
  )
}
