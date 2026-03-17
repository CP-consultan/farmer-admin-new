import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import PestForm from '../../pest-form'
import { CATEGORIZED_SCIENTIFIC_NAMES } from '../../staticNames'

export default async function EditPestPage({ params, searchParams }: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const { error: urlError } = await searchParams
  const supabase = await createClient()

  const { data: pest, error } = await supabase
    .from('pests')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !pest) {
    notFound()
  }

  const { data: existingData } = await supabase
    .from('pests')
    .select('scientific_name, category')

  const existingByCategory: Record<string, string[]> = {}
  existingData?.forEach((pest) => {
    const cat = pest.category
    if (!existingByCategory[cat]) existingByCategory[cat] = []
    if (!existingByCategory[cat].includes(pest.scientific_name)) {
      existingByCategory[cat].push(pest.scientific_name)
    }
  })

  const mergedByCategory: Record<string, string[]> = {}
  const allCategories = ['insect', 'fungus', 'bacteria', 'virus', 'weed']
  
  allCategories.forEach(cat => {
    const master = CATEGORIZED_SCIENTIFIC_NAMES[cat as keyof typeof CATEGORIZED_SCIENTIFIC_NAMES] || []
    const existing = existingByCategory[cat] || []
    mergedByCategory[cat] = [...new Set([...master, ...existing])].sort()
  })

  async function updatePest(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const scientific_name = formData.get('scientific_name') as string
    const common_name_en = formData.get('common_name_en') as string || ''
    const common_name_ur = formData.get('common_name_ur') as string || null
    const category = formData.get('category') as string

    const { error } = await supabase
      .from('pests')
      .update({ scientific_name, common_name_en, common_name_ur, category })
      .eq('id', id)

    if (error) {
      redirect(`/admin/pests/${id}/edit?error=${encodeURIComponent(error.message)}`)
    }
    redirect('/admin/pests')
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Pest</h1>
      {urlError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {urlError}
        </div>
      )}
      <PestForm 
        action={updatePest} 
        initialData={pest} 
        categorizedNames={mergedByCategory} 
      />
    </div>
  )
}
