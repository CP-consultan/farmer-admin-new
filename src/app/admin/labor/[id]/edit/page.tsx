import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import LaborForm from '../../labor-form'

export default async function EditLaborPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: labor, error } = await supabase
    .from('labor')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !labor) {
    notFound()
  }

  async function updateLabor(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const name = formData.get('name') as string
    const daily_rate = formData.get('daily_rate') as string
    const work_type = formData.get('work_type') as string
    const experience = formData.get('experience') as string
    const user_id = formData.get('user_id') as string

    const { error } = await supabase
      .from('labor')
      .update({ name, daily_rate, work_type, experience, user_id })
      .eq('id', id)

    if (error) {
      console.error('Error updating labor:', error)
    }
    redirect('/admin/labor')
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Labor</h1>
      <LaborForm action={updateLabor} initialData={labor} />
    </div>
  )
}
