import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default async function EditCropPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: crop } = await supabase
    .from('crops')
    .select('*')
    .eq('id', id)
    .single()

  if (!crop) notFound()

  async function updateCrop(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const name = formData.get('name') as string
    const scientific_name = formData.get('scientific_name') as string
    const common_name_en = formData.get('common_name_en') as string
    const common_name_ur = formData.get('common_name_ur') as string
    const category = formData.get('category') as string

    await supabase
      .from('crops')
      .update({ name, scientific_name, common_name_en, common_name_ur, category })
      .eq('id', id)
    redirect('/admin/crops')
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Crop</h1>
      <form action={updateCrop} className="space-y-4">
        <div>
          <Label>Crop Name *</Label>
          <Input name="name" defaultValue={crop.name} required />
        </div>
        <div>
          <Label>Scientific Name</Label>
          <Input name="scientific_name" defaultValue={crop.scientific_name || ''} />
        </div>
        <div>
          <Label>Common Name (English)</Label>
          <Input name="common_name_en" defaultValue={crop.common_name_en || ''} />
        </div>
        <div>
          <Label>Common Name (Urdu)</Label>
          <Input name="common_name_ur" defaultValue={crop.common_name_ur || ''} />
        </div>
        <div>
          <Label>Category</Label>
          <Select name="category" defaultValue={crop.category || ''}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cereal">Cereal</SelectItem>
              <SelectItem value="vegetable">Vegetable</SelectItem>
              <SelectItem value="fruit">Fruit</SelectItem>
              <SelectItem value="legume">Legume</SelectItem>
              <SelectItem value="oilseed">Oilseed</SelectItem>
              <SelectItem value="fiber">Fiber</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit">Update</Button>
      </form>
    </div>
  )
}
