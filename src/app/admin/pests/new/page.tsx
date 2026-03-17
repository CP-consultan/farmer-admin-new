import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default async function NewPestPage() {
  async function createPest(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const scientific_name = formData.get('scientific_name') as string
    const common_name_en = formData.get('common_name_en') as string
    const common_name_ur = formData.get('common_name_ur') as string
    const category = formData.get('category') as string

    await supabase.from('pests').insert([{ scientific_name, common_name_en, common_name_ur, category }])
    redirect('/admin/pests')
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Pest</h1>
      <form action={createPest} className="space-y-4">
        <div>
          <Label>Scientific Name</Label>
          <Input name="scientific_name" required />
        </div>
        <div>
          <Label>Common Name (English)</Label>
          <Input name="common_name_en" />
        </div>
        <div>
          <Label>Common Name (Urdu)</Label>
          <Input name="common_name_ur" />
        </div>
        <div>
          <Label>Category</Label>
          <Select name="category" required>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="insect">Insect</SelectItem>
              <SelectItem value="fungus">Fungus</SelectItem>
              <SelectItem value="bacteria">Bacteria</SelectItem>
              <SelectItem value="virus">Virus</SelectItem>
              <SelectItem value="weed">Weed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit">Create</Button>
      </form>
    </div>
  )
}
