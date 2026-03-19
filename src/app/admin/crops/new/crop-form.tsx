'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useLanguage } from '@/contexts/language-context'
import { CropCombobox } from '@/components/crop-combobox'

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
  const [autoFilled, setAutoFilled] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const nameInputRef = useRef<HTMLInputElement>(null)

  // Auto-fill Urdu name when English name changes (only if Urdu field is empty and not manually edited)
  useEffect(() => {
    const fetchUrduTranslation = async () => {
      // Only attempt auto-fill if:
      // 1. English name exists
      // 2. Urdu field is empty (or was auto-filled previously but now changed?)
      // 3. Not editing an existing crop (initialData would already have Urdu name)
      if (!name || name.trim() === '' || nameUr || initialData) {
        return
      }

      // Case-insensitive exact match
      const { data, error } = await supabase
        .from('crops')
        .select('name_ur')
        .ilike('name', name.trim())
        .maybeSingle()

      if (data?.name_ur && !error) {
        setNameUr(data.name_ur)
        setAutoFilled(true)
        // Reset auto-filled flag after 3 seconds
        setTimeout(() => setAutoFilled(false), 3000)
      }
    }

    // Debounce to avoid too many queries while typing
    const timer = setTimeout(fetchUrduTranslation, 500)
    return () => clearTimeout(timer)
  }, [name, nameUr, initialData, supabase])

  // Reset auto-filled flag when user manually changes Urdu field
  const handleUrduChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameUr(e.target.value)
    setAutoFilled(false)
  }

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
        <CropCombobox
          value={name}
          onChange={setName}
          placeholder="Type or select crop name..."
          disabled={!!initialData} // Disable combobox when editing (optional)
        />
        {!initialData && (
          <p className="text-xs text-muted-foreground mt-1">
            Start typing to see suggestions from existing crops.
          </p>
        )}
      </div>

      <div>
        <Label>{t('crop_form.name_ur')}</Label>
        <div className="relative">
          <Input 
            value={nameUr} 
            onChange={handleUrduChange} 
            placeholder="اردو نام"
            className={autoFilled ? "border-green-500 pr-20" : ""}
          />
          {autoFilled && (
            <span className="absolute right-3 top-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
              Auto-filled
            </span>
          )}
        </div>
        {!initialData && (
          <p className="text-xs text-muted-foreground mt-1">
            Urdu name will auto-fill if we find a match in the database.
          </p>
        )}
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
