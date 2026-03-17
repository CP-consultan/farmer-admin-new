import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export default async function NewAdvisoryPage() {
  const supabase = await createClient()
  const { data: pests } = await supabase.from('pests').select('id, scientific_name, common_name_en')

  async function createAdvisory(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const pest_id = formData.get('pest_id') as string
    const chemical_control = formData.get('chemical_control') as string
    const cultural_control = formData.get('cultural_control') as string
    const biological_control = formData.get('biological_control') as string

    await supabase.from('advisories').insert([{
      pest_id,
      chemical_control,
      cultural_control,
      biological_control
    }])
    redirect('/admin/advisories')
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Advisory</h1>
      <form action={createAdvisory} className="space-y-4">
        <div>
          <Label>Pest</Label>
          <Select name="pest_id" required>
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
          <Textarea name="chemical_control" rows={3} />
        </div>
        <div>
          <Label>Cultural Control</Label>
          <Textarea name="cultural_control" rows={3} />
        </div>
        <div>
          <Label>Biological Control</Label>
          <Textarea name="biological_control" rows={3} />
        </div>
        <Button type="submit">Create</Button>
      </form>
    </div>
  )
}
