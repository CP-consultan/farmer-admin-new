import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function ViewProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch product details
  const { data: product } = await supabase
    .from('agrochemicals')
    .select('*')
    .eq('id', id)
    .single()

  if (!product) notFound()

  // Fetch linked pests
  const { data: pestLinks } = await supabase
    .from('product_pests')
    .select('pest_id')
    .eq('product_id', id)

  const pestIds = pestLinks?.map(p => p.pest_id) || []

  const { data: pests } = pestIds.length > 0
    ? await supabase
        .from('pests')
        .select('id, scientific_name, common_name_en, category')
        .in('id', pestIds)
        .order('scientific_name')
    : { data: [] }

  // Fetch linked crops
  const { data: cropLinks } = await supabase
    .from('product_crops')
    .select('crop_id')
    .eq('product_id', id)

  const cropIds = cropLinks?.map(c => c.crop_id) || []

  const { data: crops } = cropIds.length > 0
    ? await supabase
        .from('crops')
        .select('id, name, common_name_en')
        .in('id', cropIds)
        .order('name')
    : { data: [] }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <Link href={`/admin/products/${id}/edit`}>
          <Button>Edit Product</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Type</p>
              <p className="capitalize">{product.type}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sub‑Type</p>
              <p>{product.sub_type || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Ingredient</p>
              <p>{product.active_ingredient || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Manufacturer</p>
              <p>{product.manufacturer || '-'}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Mode of Action</p>
            <p>{product.mode_of_action || '-'}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Application Method</p>
            <p>{product.application_method || '-'}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Dosage</p>
            <p>{product.dosage || '-'}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Safety Information</p>
            <p>{product.safety_info || '-'}</p>
          </div>

          {pests.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Target Pests</p>
              <div className="flex flex-wrap gap-2">
                {pests.map((pest) => (
                  <Badge key={pest.id} variant="outline" className="bg-blue-50">
                    {pest.scientific_name}
                    {pest.common_name_en && <span className="ml-1 text-xs">({pest.common_name_en})</span>}
                    <span className="ml-1 text-xs text-muted-foreground">({pest.category})</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {crops.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Applicable Crops</p>
              <div className="flex flex-wrap gap-2">
                {crops.map((crop) => (
                  <Badge key={crop.id} variant="outline" className="bg-green-50">
                    {crop.name}
                    {crop.common_name_en && <span className="ml-1 text-xs">({crop.common_name_en})</span>}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
