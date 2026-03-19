'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useLanguage } from '@/contexts/language-context'

interface PestFormProps {
  initialData?: any
}

const categories = ['weed', 'insect', 'fungus', 'bacteria', 'nematode', 'mite', 'virus', 'other']

export default function PestForm({ initialData }: PestFormProps) {
  const { t } = useLanguage()
  const [scientificName, setScientificName] = useState(initialData?.scientific_name || '')
  const [commonNameEn, setCommonNameEn] = useState(initialData?.common_name_en || '')
  const [commonNameUr, setCommonNameUr] = useState(initialData?.common_name_ur || '')
  const [category, setCategory] = useState(initialData?.category || '')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const pestData = {
      scientific_name: scientificName,
      common_name_en: commonNameEn || null,
      common_name_ur: commonNameUr || null,
      category: category || null,
    }

    try {
      if (initialData) {
        const { error } = await supabase
          .from('pests')
          .update(pestData)
          .eq('id', initialData.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('pests')
          .insert([pestData])
        if (error) throw error
      }
      router.push('/admin/pests')
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold">
        {initialData ? t('pest_form.title_edit') : t('pest_form.title_new')}
      </h2>

      <div>
        <Label>{t('pest_form.scientific_name')}</Label>
        <Input value={scientificName} onChange={(e) => setScientificName(e.target.value)} required />
      </div>

      <div>
        <Label>{t('pest_form.common_name_en')}</Label>
        <Input value={commonNameEn} onChange={(e) => setCommonNameEn(e.target.value)} />
      </div>

      <div>
        <Label>{t('pest_form.common_name_ur')}</Label>
        <Input value={commonNameUr} onChange={(e) => setCommonNameUr(e.target.value)} />
      </div>

      <div>
        <Label>{t('pest_form.category')}</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder={t('pest_form.category_placeholder')} />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={loading}>
        {loading
          ? (initialData ? t('pest_form.submit_updating') : t('pest_form.submit_creating'))
          : (initialData ? t('pest_form.submit_update') : t('pest_form.submit_create'))
        }
      </Button>
    </form>
  )
}
