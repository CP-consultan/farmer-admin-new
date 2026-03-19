import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { LanguageProvider } from '@/contexts/language-context'
import ClientOnly from '@/components/client-only'
import CropForm from '../../new/crop-form'

export default async function EditCropPage({ params }: { params: Promise<{ id: string }> }) {
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
        <CropForm initialData={crop} />
      </ClientOnly>
    </LanguageProvider>
  )
}
