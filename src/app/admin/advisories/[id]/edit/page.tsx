import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export default async function EditAdvisoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: advisory } = await supabase
    .from('advisories')
    .select('*')
    .eq('id', id)
    .single()

  if (!advisory) notFound()

  const { data: pests } = await supabase.from('pests').select('id, scientific_name, common_name_en')

  async function updateAdvisory(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const pest_id = formData.get('pest_id') as string
    const chemical_control = formData.get('chemical_control') as string
    const cultural_control = formData.get('cultural_control') as string
    const biological_control = formData.get('biological_control') as string

    await supabase
      .from('advisories')
      .update({ pest_id, chemical_control, cultural_control, biological_control })
      .eq('id', id)
    redirect('/admin/advisories')
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Advisory</h1>
      <form action={updateAdvisory} className="space-y-4">
        <div>
          <Label>Pest</Label>
          <Select name="pest_id" defaultValue={advisory.pest_id} required>
            <SelectTrigger>
              <SelectValue placeholder="Select a pest" />
            </SelectTrigger>
            <SelectContent>
              {pests?.map(pest => (
                <SelectItem key={pest.id} value={pest.id}>
                  {pest.scientific_name} {pest.common_name_en && `(${pest.common_name_en})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Chemical Control</Label>
          <Textarea name="chemical_control" rows={3} defaultValue={advisory.chemical_control || ''} />
        </div>
        <div>
          <Label>Cultural Control</Label>
          <Textarea name="cultural_control" rows={3} defaultValue={advisory.cultural_control || ''} />
        </div>
        <div>
          <Label>Biological Control</Label>
          <Textarea name="biological_control" rows={3} defaultValue={advisory.biological_control || ''} />
        </div>
        <Button type="submit">Update</Button>
      </form>
    </div>
  )
}
