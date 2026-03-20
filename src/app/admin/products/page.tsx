import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DeleteButton } from './delete-button'
import { LanguageProvider } from '@/contexts/language-context'
import ClientOnly from '@/components/client-only'
import ProductsContent from './products-content'

export default async function ProductsPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('agrochemicals')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: pestLinks } = await supabase
    .from('product_pests')
    .select('product_id, pest_id')

  const { data: cropLinks } = await supabase
    .from('product_crops')
    .select('product_id, crop_id')

  const pestCountByProduct: Record<string, number> = {}
  pestLinks?.forEach(link => {
    pestCountByProduct[link.product_id] = (pestCountByProduct[link.product_id] || 0) + 1
  })

  const cropCountByProduct: Record<string, number> = {}
  cropLinks?.forEach(link => {
    cropCountByProduct[link.product_id] = (cropCountByProduct[link.product_id] || 0) + 1
  })

  return (
    <LanguageProvider>
      <ClientOnly>
        <ProductsContent
          products={products || []}
          pestCountByProduct={pestCountByProduct}
          cropCountByProduct={cropCountByProduct}
        />
      </ClientOnly>
    </LanguageProvider>
  )
}
