import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import LaborForm from '../labor-form'

export default async function NewLaborPage() {
  async function createLabor(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const name = formData.get('name') as string
    const daily_rate = formData.get('daily_rate') as string
    const work_type = formData.get('work_type') as string
    const experience = formData.get('experience') as string
    const user_id = formData.get('user_id') as string

    const { error } = await supabase
      .from('labor')
      .insert([{ name, daily_rate, work_type, experience, user_id }])

    if (error) {
      console.error('Error creating labor:', error)
    }
    redirect('/admin/labor')
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add New Labor</h1>
      <LaborForm action={createLabor} />
    </div>
  )
}
