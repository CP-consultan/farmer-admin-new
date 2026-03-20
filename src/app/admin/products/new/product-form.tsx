'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { MultiSelect } from '@/components/multi-select'
import { ReadFormButton } from '@/components/read-form-button'
import ActiveIngredientInput from '@/components/active-ingredient-input'
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
  const { t, language } = useLanguage()
  const [name, setName] = useState(initialData?.name || '')
  const [nameUr, setNameUr] = useState(initialData?.name_ur || '')
  const [type, setType] = useState(initialData?.type || '')
  const [subType, setSubType] = useState(initialData?.sub_type || '')
  const [activeIngredients, setActiveIngredients] = useState<string[]>(() => {
    if (initialData?.active_ingredient) {
      return initialData.active_ingredient.split('\n').filter((line: string) => line.trim() !== '')
    }
    return ['']
  })
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

  const selectedIngredientsRef = useRef<Set<string>>(new Set())

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

  const addActiveIngredientLine = () => {
    setActiveIngredients([...activeIngredients, ''])
  }

  const removeActiveIngredientLine = (index: number) => {
    const ingredientToRemove = activeIngredients[index]
    const newLines = activeIngredients.filter((_, i) => i !== index)
    setActiveIngredients(newLines.length ? newLines : [''])
    if (ingredientToRemove && ingredientToRemove.trim() !== '') {
      selectedIngredientsRef.current.delete(ingredientToRemove.trim())
    }
  }

  const updateActiveIngredientLine = (index: number, value: string) => {
    const oldValue = activeIngredients[index]
    const newLines = [...activeIngredients]
    newLines[index] = value
    setActiveIngredients(newLines)
    if (oldValue && oldValue.trim() !== '' && oldValue !== value) {
      selectedIngredientsRef.current.delete(oldValue.trim())
    }
  }

  const getCombinedActiveIngredient = () => {
    return activeIngredients.filter(line => line.trim() !== '').join('\n')
  }

  const handleIngredientSelect = async (index: number, selectedIngredient: string) => {
    console.log('handleIngredientSelect', index, selectedIngredient)
    updateActiveIngredientLine(index, selectedIngredient)

    try {
      const response = await fetch(`/api/mode-of-action?ingredient=${encodeURIComponent(selectedIngredient)}`)
      const data = await response.json()
      console.log('Mode of action response:', data)
      if (data.mode_of_action) {
        const trimmed = selectedIngredient.trim()
        if (!selectedIngredientsRef.current.has(trimmed)) {
          selectedIngredientsRef.current.add(trimmed)
          setModeOfAction(prev => {
            const newText = prev ? prev + '\n' + data.mode_of_action : data.mode_of_action
            console.log('Setting mode of action:', newText)
            return newText
          })
        }
      }
    } catch (error) {
      console.error('Error fetching mode of action:', error)
      alert('Failed to fetch mode of action. Check console.')
    }
  }

  const getFormSections = () => {
    const sections = [
      { label: t('product_form.product_name'), value: name },
      { label: 'Product Name (Urdu)', value: nameUr },
      { label: t('product_form.type'), value: type },
      { label: t('product_form.subtype'), value: subType },
      { label: t('product_form.active_ingredient'), value: getCombinedActiveIngredient() },
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
      name_ur: nameUr || null,
      type,
      sub_type: subType || null,
      active_ingredient: getCombinedActiveIngredient() || null,
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
    <form onSubmit={handleSubmit} className="space-y-4 max-w-4xl">
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
        <Label>Product Name (Urdu)</Label>
        <Input value={nameUr} onChange={(e) => setNameUr(e.target.value)} />
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

      <div className="space-y-4">
        <Label>{t('product_form.active_ingredient')}</Label>
        {activeIngredients.map((line, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="flex-1">
              <ActiveIngredientInput
                value={line}
                onChange={(newValue) => updateActiveIngredientLine(index, newValue)}
                onSelect={(selected) => handleIngredientSelect(index, selected)}
                onModeOfActionFetched={() => {}} // disable internal fetch
                label={`Active Ingredient ${index + 1}`}
                placeholder={`Search active ingredient ${index + 1}...`}
                category={subType}
              />
            </div>
            {activeIngredients.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeActiveIngredientLine(index)}
                className="mt-8 text-red-500"
              >
                ✕
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addActiveIngredientLine}
          className="mt-2"
        >
          + Add another active ingredient
        </Button>
        <p className="text-xs text-muted-foreground">
          Each active ingredient has autocomplete. Selecting a new ingredient will append its mode of action.
        </p>
      </div>

      <div>
        <Label>{t('product_form.mode_of_action')}</Label>
        <Textarea
          value={modeOfAction}
          onChange={(e) => setModeOfAction(e.target.value)}
          rows={3}
          placeholder="Mode of action will be appended for each new ingredient."
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
