'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useLanguage } from '@/contexts/language-context'

interface CropFormProps {
  initialData?: any
}

const categories = ['cereal', 'vegetable', 'fruit', 'legume', 'oilseed', 'fiber', 'other']

export default function CropForm({ initialData }: CropFormProps) {
  const { t } = useLanguage()
  const [name, setName] = useState(initialData?.name || '')
  const [nameUr, setNameUr] = useState(initialData?.name_ur || '')
  const [commonNameEn, setCommonNameEn] = useState(initialData?.common_name_en || '')
  const [category, setCategory] = useState(initialData?.category || '')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const cropData = {
      name,
      name_ur: nameUr || null,
      common_name_en: commonNameEn || null,
      category: category || null,
    }

    try {
      if (initialData) {
        const { error } = await supabase
          .from('crops')
          .update(cropData)
          .eq('id', initialData.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('crops')
          .insert([cropData])
        if (error) throw error
      }
      router.push('/admin/crops')
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold">
        {initialData ? t('crop_form.title_edit') : t('crop_form.title_new')}
      </h2>

      <div>
        <Label>{t('crop_form.name')}</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div>
        <Label>{t('crop_form.name_ur')}</Label>
        <Input value={nameUr} onChange={(e) => setNameUr(e.target.value)} />
      </div>

      <div>
        <Label>{t('crop_form.common_name_en')}</Label>
        <Input value={commonNameEn} onChange={(e) => setCommonNameEn(e.target.value)} />
      </div>

      <div>
        <Label>{t('crop_form.category')}</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder={t('crop_form.category_placeholder')} />
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
          ? (initialData ? t('crop_form.submit_updating') : t('crop_form.submit_creating'))
          : (initialData ? t('crop_form.submit_update') : t('crop_form.submit_create'))
        }
      </Button>
    </form>
  )
}
