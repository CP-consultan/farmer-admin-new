import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import EquipmentForm from '../equipment-form'

export default async function NewEquipmentPage() {
  async function createEquipment(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const title = formData.get('title') as string
    const price = formData.get('price') as string
    const category = formData.get('category') as string
    const description = formData.get('description') as string
    const user_id = formData.get('user_id') as string

    const { error } = await supabase
      .from('equipment')
      .insert([{ title, price, category, description, user_id }])

    if (error) {
      console.error('Error creating equipment:', error)
    }
    redirect('/admin/equipment')
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add New Equipment</h1>
      <EquipmentForm action={createEquipment} />
    </div>
  )
}
