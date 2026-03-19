import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import ActiveIngredientInput from '@/components/active-ingredient-input'

export default async function NewProductPage() {
  async function createProduct(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const name = formData.get('name') as string
    const type = formData.get('type') as string
    const active_ingredient = formData.get('active_ingredient') as string
    const mode_of_action = formData.get('mode_of_action') as string
    const target_pests = formData.get('target_pests') as string
    const applicable_crops = formData.get('applicable_crops') as string
    const application_method = formData.get('application_method') as string
    const dosage = formData.get('dosage') as string
    const safety_info = formData.get('safety_info') as string
    const manufacturer = formData.get('manufacturer') as string

    await supabase.from('agrochemicals').insert([{
      name, type, active_ingredient, mode_of_action, target_pests,
      applicable_crops, application_method, dosage, safety_info, manufacturer
    }])
    redirect('/admin/products')
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
      <form action={createProduct} className="space-y-4">
        <div>
          <Label>Product Name</Label>
          <Input name="name" required />
        </div>
        <div>
          <Label>Type</Label>
          <Select name="type" required>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pesticide">Pesticide</SelectItem>
              <SelectItem value="fertilizer">Fertilizer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Active Ingredient</Label>
          <Input name="active_ingredient" />
        </div>
        <div>
          <Label>Mode of Action</Label>
          <Textarea name="mode_of_action" rows={2} />
        </div>
        <div>
          <Label>Target Pests / Diseases</Label>
          <Textarea name="target_pests" rows={2} placeholder="Comma separated list or description" />
        </div>
        <div>
          <Label>Applicable Crops</Label>
          <Textarea name="applicable_crops" rows={2} placeholder="Comma separated list or description" />
        </div>
        <div>
          <Label>Application Method</Label>
          <Textarea name="application_method" rows={2} />
        </div>
        <div>
          <Label>Dosage</Label>
          <Input name="dosage" placeholder="e.g., 2 ml/L" />
        </div>
        <div>
          <Label>Safety Information</Label>
          <Textarea name="safety_info" rows={2} />
        </div>
        <div>
          <Label>Manufacturer</Label>
          <Input name="manufacturer" />
        </div>
        <Button type="submit">Create</Button>
      </form>
    </div>
  )
}
