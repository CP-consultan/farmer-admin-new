import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SpeakButton } from '@/components/speak-button'
import { LanguageProvider } from '@/contexts/language-context'
import ClientOnly from '@/components/client-only'
import ProductDetailContent from './product-detail-content'

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('agrochemicals')
    .select('*')
    .eq('id', id)
    .single()

  if (!product) notFound()

  const { data: pestLinks } = await supabase
    .from('product_pests')
    .select('pest_id, pests(scientific_name, common_name_en)')
    .eq('product_id', id)

  const { data: cropLinks } = await supabase
    .from('product_crops')
    .select('crop_id, crops(name, common_name_en)')
    .eq('product_id', id)

  const pests = (pestLinks ?? [])
    .map(link => link.pests?.[0])
    .filter(p => p !== undefined)

  const crops = (cropLinks ?? [])
    .map(link => link.crops?.[0])
    .filter(c => c !== undefined)

  return (
    <LanguageProvider>
      <ClientOnly>
        <ProductDetailContent product={product} pests={pests} crops={crops} />
      </ClientOnly>
    </LanguageProvider>
  )
}
