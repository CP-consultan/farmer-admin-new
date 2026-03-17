import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import EquipmentForm from '../../equipment-form'

export default async function EditEquipmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: equipment, error } = await supabase
    .from('equipment')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !equipment) {
    notFound()
  }

  async function updateEquipment(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const title = formData.get('title') as string
    const price = formData.get('price') as string
    const category = formData.get('category') as string
    const description = formData.get('description') as string
    const user_id = formData.get('user_id') as string

    const { error } = await supabase
      .from('equipment')
      .update({ title, price, category, description, user_id })
      .eq('id', id)

    if (error) {
      console.error('Error updating equipment:', error)
    }
    redirect('/admin/equipment')
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Equipment</h1>
      <EquipmentForm action={updateEquipment} initialData={equipment} />
    </div>
  )
}
