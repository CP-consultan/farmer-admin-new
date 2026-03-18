import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch product details
  const { data: product } = await supabase
    .from('agrochemicals')
    .select('*')
    .eq('id', id)
    .single()

  if (!product) notFound()

  // Fetch linked pests with their names
  const { data: pestLinks } = await supabase
    .from('product_pests')
    .select('pest_id, pests(scientific_name, common_name_en)')
    .eq('product_id', id)

  // Fetch linked crops with their names
  const { data: cropLinks } = await supabase
    .from('product_crops')
    .select('crop_id, crops(name, common_name_en)')
    .eq('product_id', id)

  // Extract the pest objects safely
  const pests = (pestLinks?.map(link => link.pests) ?? []).filter(Boolean) as { scientific_name: string; common_name_en: string | null }[]
  const crops = (cropLinks?.map(link => link.crops) ?? []).filter(Boolean) as { name: string; common_name_en: string | null }[]

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <div className="space-x-2">
          <Link href={`/admin/products/${id}/edit`}>
            <Button variant="outline">Edit</Button>
          </Link>
          <Link href="/admin/products">
            <Button variant="ghost">Back to List</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Type</p>
            <p className="capitalize">{product.type}</p>
          </div>
          {product.sub_type && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sub‑Type</p>
              <p>{product.sub_type}</p>
            </div>
          )}
          {product.active_ingredient && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Ingredient</p>
              <p>{product.active_ingredient}</p>
            </div>
          )}
          {product.mode_of_action && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Mode of Action</p>
              <p>{product.mode_of_action}</p>
            </div>
          )}
          {product.dosage && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Dosage</p>
              <p>{product.dosage}</p>
            </div>
          )}
          {product.application_method && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Application Method</p>
              <p>{product.application_method}</p>
            </div>
          )}
          {product.manufacturer && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Manufacturer</p>
              <p>{product.manufacturer}</p>
            </div>
          )}
          {product.safety_info && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Safety Information</p>
              <p className="whitespace-pre-wrap">{product.safety_info}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {pests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Target Pests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {pests.map((pest, idx) => (
                <Badge key={idx} variant="secondary">
                  {pest.scientific_name}
                  {pest.common_name_en && ` (${pest.common_name_en})`}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {crops.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Applicable Crops</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {crops.map((crop, idx) => (
                <Badge key={idx} variant="secondary">
                  {crop.name}
                  {crop.common_name_en && ` (${crop.common_name_en})`}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
