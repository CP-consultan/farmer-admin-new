import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SpeakButton } from '@/components/speak-button'

type PestInfo = {
  scientific_name: string
  common_name_en: string | null
}

type CropInfo = {
  name: string
  common_name_en: string | null
}

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

  const pests: PestInfo[] = (pestLinks ?? [])
    .map(link => link.pests?.[0])
    .filter((pest): pest is PestInfo => pest !== undefined)

  const crops: CropInfo[] = (cropLinks ?? [])
    .map(link => link.crops?.[0])
    .filter((crop): crop is CropInfo => crop !== undefined)

  // Build a comprehensive description for the "Read Full Details" button
  const fullDescriptionParts: string[] = []

  fullDescriptionParts.push(`Product name: ${product.name}.`)

  if (product.type) fullDescriptionParts.push(`Type: ${product.type}.`)
  if (product.sub_type) fullDescriptionParts.push(`Sub‑type: ${product.sub_type}.`)
  if (product.active_ingredient) fullDescriptionParts.push(`Active ingredient: ${product.active_ingredient}.`)
  if (product.mode_of_action) fullDescriptionParts.push(`Mode of action: ${product.mode_of_action}.`)
  if (product.dosage) fullDescriptionParts.push(`Dosage: ${product.dosage}.`)
  if (product.application_method) fullDescriptionParts.push(`Application method: ${product.application_method}.`)
  if (product.manufacturer) fullDescriptionParts.push(`Manufacturer: ${product.manufacturer}.`)
  if (product.safety_info) fullDescriptionParts.push(`Safety information: ${product.safety_info}.`)

  if (pests.length > 0) {
    const pestNames = pests.map(p => p.common_name_en ? `${p.scientific_name} (${p.common_name_en})` : p.scientific_name).join(', ')
    fullDescriptionParts.push(`Target pests: ${pestNames}.`)
  }

  if (crops.length > 0) {
    const cropNames = crops.map(c => c.common_name_en ? `${c.name} (${c.common_name_en})` : c.name).join(', ')
    fullDescriptionParts.push(`Applicable crops: ${cropNames}.`)
  }

  const fullDescription = fullDescriptionParts.join(' ')

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          {/* Replace the old name‑only speak button with one that reads all details */}
          <SpeakButton text={fullDescription} />
        </div>
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
                <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                  {pest.scientific_name}
                  {pest.common_name_en && ` (${pest.common_name_en})`}
                  {/* You can keep or remove these individual pest speak buttons – they don't interfere */}
                  <SpeakButton text={pest.scientific_name} />
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
                <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                  {crop.name}
                  {crop.common_name_en && ` (${crop.common_name_en})`}
                  <SpeakButton text={crop.name} />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}