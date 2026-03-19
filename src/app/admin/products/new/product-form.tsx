'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { MultiSelect } from '@/components/multi-select'
import ActiveIngredientInput from '@/components/active-ingredient-input'
import { ReadFormButton } from '@/components/read-form-button'
import { useLanguage } from '@/contexts/language-context'

interface Pest {
  id: string
  scientific_name: string
  common_name_en: string | null
  category: string
}

interface Crop {
  id: string
  name: string
  common_name_en: string | null
}

interface ProductFormProps {
  pests: Pest[]
  crops: Crop[]
  initialData?: any
}

const pesticideSubTypes = [
  'Herbicide',
  'Insecticide',
  'Fungicide',
  'Bactericide',
  'Nematicide',
  'Rodenticide',
  'Molluscicide',
  'Acaricide',
  'Plant Growth Regulator'
]

const fertilizerSubTypes = [
  'Urea',
  'DAP (Diammonium Phosphate)',
  'Potash (MOP)',
  'NPK Complex',
  'Ammonium Nitrate',
  'Ammonium Sulfate',
  'Single Super Phosphate',
  'Triple Super Phosphate',
  'Calcium Nitrate',
  'Magnesium Sulfate',
  'Zinc Sulfate',
  'Boron',
  'Compost',
  'Manure',
  'Bio‑fertilizer'
]

const subTypeToCategory: Record<string, string> = {
  Herbicide: 'weed',
  Insecticide: 'insect',
  Fungicide: 'fungus',
  Bactericide: 'bacteria',
  Nematicide: 'nematode',
  Acaricide: 'mite',
}

export default function ProductForm({ pests, crops, initialData }: ProductFormProps) {
  const { t } = useLanguage()
  const [name, setName] = useState(initialData?.name || '')
  const [type, setType] = useState(initialData?.type || '')
  const [subType, setSubType] = useState(initialData?.sub_type || '')
  const [activeIngredient, setActiveIngredient] = useState(initialData?.active_ingredient || '')
  const [modeOfAction, setModeOfAction] = useState(initialData?.mode_of_action || '')
  const [applicationMethod, setApplicationMethod] = useState(initialData?.application_method || '')
  const [dosage, setDosage] = useState(initialData?.dosage || '')
  const [safetyInfo, setSafetyInfo] = useState(initialData?.safety_info || '')
  const [manufacturer, setManufacturer] = useState(initialData?.manufacturer || '')
  const [selectedPests, setSelectedPests] = useState<string[]>(initialData?.pests || [])
  const [selectedCrops, setSelectedCrops] = useState<string[]>(initialData?.crops || [])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const subTypeOptions = type === 'pesticide' ? pesticideSubTypes : fertilizerSubTypes

  const filteredPests = useMemo(() => {
    if (!subType || !subTypeToCategory[subType]) {
      return pests
    }
    const targetCategory = subTypeToCategory[subType]
    return pests.filter(p => p.category?.toLowerCase() === targetCategory.toLowerCase())
  }, [pests, subType])

  const pestOptions = filteredPests.map(p => ({
    id: p.id,
    label: p.common_name_en
      ? `${p.scientific_name} (${p.common_name_en})`
      : p.scientific_name
  }))

  const cropOptions = crops.map(c => ({
    id: c.id,
    label: c.common_name_en ? `${c.name} (${c.common_name_en})` : c.name
  }))

  const getFormSections = () => {
    const sections = [
      { label: t('product_form.product_name'), value: name },
      { label: t('product_form.type'), value: type },
      { label: t('product_form.subtype'), value: subType },
      { label: t('product_form.active_ingredient'), value: activeIngredient },
      { label: t('product_form.mode_of_action'), value: modeOfAction },
      { label: t('product_form.application_method'), value: applicationMethod },
      { label: t('product_form.dosage'), value: dosage },
      { label: t('product_form.safety_info'), value: safetyInfo },
      { label: t('product_form.manufacturer'), value: manufacturer },
    ]
    if (selectedPests.length > 0) {
      const pestNames = selectedPests
        .map(id => filteredPests.find(p => p.id === id))
        .filter(p => p)
        .map(p => p!.scientific_name)
        .join(', ')
      sections.push({ label: t('product_form.target_pests'), value: pestNames })
    }
    if (selectedCrops.length > 0) {
      const cropNames = selectedCrops
        .map(id => crops.find(c => c.id === id))
        .filter(c => c)
        .map(c => c!.name)
        .join(', ')
      sections.push({ label: t('product_form.applicable_crops'), value: cropNames })
    }
    return sections
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const productData = {
      name,
      type,
      sub_type: subType || null,
      active_ingredient: activeIngredient || null,
      mode_of_action: modeOfAction || null,
      application_method: applicationMethod || null,
      dosage: dosage || null,
      safety_info: safetyInfo || null,
      manufacturer: manufacturer || null,
    }

    try {
      if (initialData) {
        const { error: updateError } = await supabase
          .from('agrochemicals')
          .update(productData)
          .eq('id', initialData.id)
        if (updateError) throw updateError

        await supabase.from('product_pests').delete().eq('product_id', initialData.id)
        await supabase.from('product_crops').delete().eq('product_id', initialData.id)

        if (selectedPests.length > 0) {
          const pestInserts = selectedPests.map(pestId => ({
            product_id: initialData.id,
            pest_id: pestId
          }))
          const { error: pestError } = await supabase.from('product_pests').insert(pestInserts)
          if (pestError) throw pestError
        }

        if (selectedCrops.length > 0) {
          const cropInserts = selectedCrops.map(cropId => ({
            product_id: initialData.id,
            crop_id: cropId
          }))
          const { error: cropError } = await supabase.from('product_crops').insert(cropInserts)
          if (cropError) throw cropError
        }

        alert('Product updated successfully!')
      } else {
        const { data: newProduct, error: insertError } = await supabase
          .from('agrochemicals')
          .insert([productData])
          .select()
          .single()
        if (insertError) throw insertError

        if (selectedPests.length > 0) {
          const pestInserts = selectedPests.map(pestId => ({
            product_id: newProduct.id,
            pest_id: pestId
          }))
          const { error: pestError } = await supabase.from('product_pests').insert(pestInserts)
          if (pestError) throw pestError
        }

        if (selectedCrops.length > 0) {
          const cropInserts = selectedCrops.map(cropId => ({
            product_id: newProduct.id,
            crop_id: cropId
          }))
          const { error: cropError } = await supabase.from('product_crops').insert(cropInserts)
          if (cropError) throw cropError
        }

        alert('Product created successfully!')
      }
      router.push('/admin/products')
    } catch (error: any) {
      alert('Error: ' + error.message)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {initialData ? t('product_form.title_edit') : t('product_form.title_new')}
        </h2>
        <ReadFormButton sections={getFormSections()} />
      </div>

      <div>
        <Label>{t('product_form.product_name')}</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div>
        <Label>{t('product_form.type')}</Label>
        <Select value={type} onValueChange={(val) => { setType(val); setSubType(''); setSelectedPests([]); }} required>
          <SelectTrigger>
            <SelectValue placeholder={t('product_form.select_type_placeholder')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pesticide">Pesticide</SelectItem>
            <SelectItem value="fertilizer">Fertilizer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {type && (
        <div>
          <Label>{t('product_form.subtype')}</Label>
          <Select value={subType} onValueChange={setSubType}>
            <SelectTrigger>
              <SelectValue placeholder={t('product_form.select_subtype_placeholder').replace('{type}', type)} />
            </SelectTrigger>
            <SelectContent>
              {subTypeOptions.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <ActiveIngredientInput
        value={activeIngredient}
        onChange={setActiveIngredient}
        onModeOfActionFetched={setModeOfAction}
        label={t('product_form.active_ingredient')}
        category={subType}
      />

      <div>
        <Label>{t('product_form.mode_of_action')}</Label>
        <Textarea
          value={modeOfAction}
          onChange={(e) => setModeOfAction(e.target.value)}
          rows={2}
        />
      </div>

      <MultiSelect
        label={t('product_form.target_pests')}
        options={pestOptions}
        selected={selectedPests}
        onChange={setSelectedPests}
        placeholder={t('product_form.select_pests_placeholder')}
      />

      <MultiSelect
        label={t('product_form.applicable_crops')}
        options={cropOptions}
        selected={selectedCrops}
        onChange={setSelectedCrops}
        placeholder={t('product_form.select_crops_placeholder')}
      />

      <div>
        <Label>{t('product_form.application_method')}</Label>
        <Textarea
          value={applicationMethod}
          onChange={(e) => setApplicationMethod(e.target.value)}
          rows={2}
        />
      </div>

      <div>
        <Label>{t('product_form.dosage')}</Label>
        <Input
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          placeholder={t('product_form.dosage_placeholder')}
        />
      </div>

      <div>
        <Label>{t('product_form.safety_info')}</Label>
        <Textarea
          value={safetyInfo}
          onChange={(e) => setSafetyInfo(e.target.value)}
          rows={2}
        />
      </div>

      <div>
        <Label>{t('product_form.manufacturer')}</Label>
        <Input
          value={manufacturer}
          onChange={(e) => setManufacturer(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading
          ? (initialData ? t('product_form.submit_updating') : t('product_form.submit_creating'))
          : (initialData ? t('product_form.submit_update') : t('product_form.submit_create'))
        }
      </Button>
    </form>
  )
}
