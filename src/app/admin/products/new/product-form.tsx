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
import { Loader2, Bold } from 'lucide-react'

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
  const [activeIngredientsUr, setActiveIngredientsUr] = useState<string[]>(() => {
    if (initialData?.active_ingredient_ur) {
      return initialData.active_ingredient_ur.split('\n').filter((line: string) => line.trim() !== '')
    }
    return ['']
  })
  const [modeOfAction, setModeOfAction] = useState(initialData?.mode_of_action || '')
  const [modeOfActionUr, setModeOfActionUr] = useState(initialData?.mode_of_action_ur || '')
  const [applicationMethod, setApplicationMethod] = useState(initialData?.application_method || '')
  const [applicationMethodUr, setApplicationMethodUr] = useState(initialData?.application_method_ur || '')
  const [dosage, setDosage] = useState(initialData?.dosage || '')
  const [safetyInfo, setSafetyInfo] = useState(initialData?.safety_info || '')
  const [safetyInfoUr, setSafetyInfoUr] = useState(initialData?.safety_info_ur || '')
  const [manufacturer, setManufacturer] = useState(initialData?.manufacturer || '')
  const [manufacturerUr, setManufacturerUr] = useState(initialData?.manufacturer_ur || '')
  const [overview, setOverview] = useState(initialData?.overview || '')
  const [overviewUr, setOverviewUr] = useState(initialData?.overview_ur || '')
  const [selectedPests, setSelectedPests] = useState<string[]>(initialData?.pests || [])
  const [selectedCrops, setSelectedCrops] = useState<string[]>(initialData?.crops || [])
  const [loading, setLoading] = useState(false)
  const [translating, setTranslating] = useState({
    name: false,
    activeIngredient: false,
    modeOfAction: false,
    applicationMethod: false,
    safetyInfo: false,
    manufacturer: false,
    overview: false,
    all: false
  })
  const router = useRouter()
  const supabase = createClient()
  const selectedIngredientsRef = useRef<Set<string>>(new Set())
  const overviewEnTextareaRef = useRef<HTMLTextAreaElement>(null)
  const overviewUrTextareaRef = useRef<HTMLTextAreaElement>(null)

  const subTypeOptions = type === 'pesticide' ? pesticideSubTypes : fertilizerSubTypes

  // Dynamic label for Target Pests based on sub-type and language
  const getTargetPestsLabel = () => {
    if (language !== 'ur') return t('product_form.target_pests')
    if (subType === 'Insecticide') return 'کیڑے مارنے کی صلاحیت'
    if (subType === 'Herbicide') return 'جڑی بوٹیوں کو مارنے کی صلاحیت'
    if (subType === 'Fungicide') return 'بیماری پر قابو پانے کی صلاحیت'
    return 'ہدف کیڑے'
  }

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
    setActiveIngredientsUr([...activeIngredientsUr, ''])
  }

  const removeActiveIngredientLine = (index: number) => {
    const ingredientToRemove = activeIngredients[index]
    const newLines = activeIngredients.filter((_, i) => i !== index)
    setActiveIngredients(newLines.length ? newLines : [''])
    const newLinesUr = activeIngredientsUr.filter((_, i) => i !== index)
    setActiveIngredientsUr(newLinesUr.length ? newLinesUr : [''])
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

  const updateActiveIngredientUrLine = (index: number, value: string) => {
    const newLines = [...activeIngredientsUr]
    newLines[index] = value
    setActiveIngredientsUr(newLines)
  }

  const getCombinedActiveIngredient = () => {
    return activeIngredients.filter(line => line.trim() !== '').join('\n')
  }

  const getCombinedActiveIngredientUr = () => {
    return activeIngredientsUr.filter(line => line.trim() !== '').join('\n')
  }

  const handleIngredientSelect = async (index: number, selectedIngredient: string) => {
    updateActiveIngredientLine(index, selectedIngredient)
    try {
      const response = await fetch(`/api/mode-of-action?ingredient=${encodeURIComponent(selectedIngredient)}`)
      const data = await response.json()
      if (data.mode_of_action) {
        const trimmed = selectedIngredient.trim()
        if (!selectedIngredientsRef.current.has(trimmed)) {
          selectedIngredientsRef.current.add(trimmed)
          setModeOfAction((prev: string) => {
            const newText = prev ? prev + '\n' + data.mode_of_action : data.mode_of_action
            return newText
          })
        }
      }
    } catch (error) {
      console.error('Error fetching mode of action:', error)
    }
  }

  const handleTranslate = async (field: 'name' | 'activeIngredient' | 'modeOfAction' | 'applicationMethod' | 'safetyInfo' | 'manufacturer' | 'overview') => {
    let sourceText = ''
    let targetSetter: (value: string) => void

    switch (field) {
      case 'name':
        sourceText = name
        targetSetter = setNameUr
        break
      case 'activeIngredient':
        sourceText = getCombinedActiveIngredient()
        targetSetter = (val) => {
          const lines = val.split('\n').filter((l: string) => l.trim() !== ')
          setActiveIngredientsUr(lines.length ? lines : [''])
        }
        break
      case 'modeOfAction':
        sourceText = modeOfAction
        targetSetter = setModeOfActionUr
        break
      case 'applicationMethod':
        sourceText = applicationMethod
        targetSetter = setApplicationMethodUr
        break
      case 'safetyInfo':
        sourceText = safetyInfo
        targetSetter = setSafetyInfoUr
        break
      case 'manufacturer':
        sourceText = manufacturer
        targetSetter = setManufacturerUr
        break
      case 'overview':
        sourceText = overview
        targetSetter = setOverviewUr
        break
      default:
        return
    }

    if (!sourceText.trim()) {
      alert('No text to translate.')
      return
    }

    setTranslating(prev => ({ ...prev, [field]: true }))

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sourceText })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Translation failed')
      targetSetter(data.translatedText)
    } catch (error) {
      console.error('Translation error:', error)
      alert('Translation failed. Please try again.')
    } finally {
      setTranslating(prev => ({ ...prev, [field]: false }))
    }
  }

  const handleTranslateAll = async () => {
    setTranslating(prev => ({ ...prev, all: true }))
    try {
      if (name.trim()) {
        const res1 = await fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: name }) })
        const data1 = await res1.json()
        if (data1.translatedText) setNameUr(data1.translatedText)
      }
      const combined = getCombinedActiveIngredient()
      if (combined.trim()) {
        const res2 = await fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: combined }) })
        const data2 = await res2.json()
        if (data2.translatedText) {
          const lines = data2.translatedText.split('\n').filter((l: string) => l.trim() !== ')
          setActiveIngredientsUr(lines.length ? lines : [''])
        }
      }
      if (modeOfAction.trim()) {
        const res3 = await fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: modeOfAction }) })
        const data3 = await res3.json()
        if (data3.translatedText) setModeOfActionUr(data3.translatedText)
      }
      if (applicationMethod.trim()) {
        const res4 = await fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: applicationMethod }) })
        const data4 = await res4.json()
        if (data4.translatedText) setApplicationMethodUr(data4.translatedText)
      }
      if (safetyInfo.trim()) {
        const res5 = await fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: safetyInfo }) })
        const data5 = await res5.json()
        if (data5.translatedText) setSafetyInfoUr(data5.translatedText)
      }
      if (manufacturer.trim()) {
        const res6 = await fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: manufacturer }) })
        const data6 = await res6.json()
        if (data6.translatedText) setManufacturerUr(data6.translatedText)
      }
      if (overview.trim()) {
        const res7 = await fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: overview }) })
        const data7 = await res7.json()
        if (data7.translatedText) setOverviewUr(data7.translatedText)
      }
    } catch (error) {
      console.error('Translation error:', error)
      alert('Some translations failed. Please try again.')
    } finally {
      setTranslating(prev => ({ ...prev, all: false }))
    }
  }

  const insertBold = (textareaRef: React.RefObject<HTMLTextAreaElement>, setter: (value: string) => void, currentValue: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = currentValue.substring(start, end)

    let newText: string
    let cursorPos: number

    if (selectedText) {
      newText = currentValue.substring(0, start) + '**' + selectedText + '**' + currentValue.substring(end)
      cursorPos = end + 4
    } else {
      newText = currentValue.substring(0, start) + '****' + currentValue.substring(end)
      cursorPos = start + 2
    }

    setter(newText)
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(cursorPos, cursorPos)
    }, 0)
  }

  const getFormSections = () => {
    const sections = [
      { label: t('product_form.product_name'), value: name },
      { label: 'Product Name (Urdu)', value: nameUr },
      { label: t('product_form.type'), value: type },
      { label: t('product_form.subtype'), value: subType },
      { label: t('product_form.active_ingredient'), value: getCombinedActiveIngredient() },
      { label: 'Active Ingredient (Urdu)', value: getCombinedActiveIngredientUr() },
      { label: t('product_form.mode_of_action'), value: modeOfAction },
      { label: 'Mode of Action (Urdu)', value: modeOfActionUr },
      { label: t('product_form.application_method'), value: applicationMethod },
      { label: 'Application Method (Urdu)', value: applicationMethodUr },
      { label: t('product_form.dosage'), value: dosage },
      { label: t('product_form.safety_info'), value: safetyInfo },
      { label: 'Safety Info (Urdu)', value: safetyInfoUr },
      { label: t('product_form.manufacturer'), value: manufacturer },
      { label: 'Manufacturer (Urdu)', value: manufacturerUr },
      { label: 'Product Overview / Review', value: overview },
      { label: 'Product Overview (Urdu)', value: overviewUr },
    ]
    if (selectedPests.length > 0) {
      const pestNames = selectedPests
        .map(id => filteredPests.find(p => p.id === id))
        .filter(p => p)
        .map(p => p!.scientific_name)
        .join(', ')
      sections.push({ label: getTargetPestsLabel(), value: pestNames })
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
      active_ingredient_ur: getCombinedActiveIngredientUr() || null,
      mode_of_action: modeOfAction || null,
      mode_of_action_ur: modeOfActionUr || null,
      application_method: applicationMethod || null,
      application_method_ur: applicationMethodUr || null,
      dosage: dosage || null,
      safety_info: safetyInfo || null,
      safety_info_ur: safetyInfoUr || null,
      manufacturer: manufacturer || null,
      manufacturer_ur: manufacturerUr || null,
      overview: overview || null,
      overview_ur: overviewUr || null,
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
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={handleTranslateAll} disabled={translating.all}>
            {translating.all ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : '🌐'}
            Translate All to Urdu
          </Button>
          <ReadFormButton sections={getFormSections()} />
        </div>
      </div>

      <div>
        <Label>{t('product_form.product_name')}</Label>
        <div className="flex gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} required className="flex-1" />
          <Button type="button" variant="outline" size="sm" onClick={() => handleTranslate('name')} disabled={!name.trim() || translating.name}>
            {translating.name ? <Loader2 className="h-4 w-4 animate-spin" /> : '🔄'}
            <span className="ml-2 hidden sm:inline">Urdu</span>
          </Button>
        </div>
        <Input value={nameUr} onChange={(e) => setNameUr(e.target.value)} placeholder="Product Name (Urdu)" dir="rtl" className="mt-2 urdu-text" />
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
                  {language === 'ur' && (
                    opt === 'Herbicide' ? 'جڑی بوٹی مار دوا' :
                    opt === 'Insecticide' ? 'کیڑے مار دوا' :
                    opt === 'Fungicide' ? 'پھپھوندی کش' :
                    opt === 'Bactericide' ? 'بیکٹیریا کش' :
                    opt === 'Nematicide' ? 'نیماٹوڈ کش' :
                    opt === 'Rodenticide' ? 'چوہا مار' :
                    opt === 'Molluscicide' ? 'گھونگھے مار' :
                    opt === 'Acaricide' ? 'کیڑے (اکاری) کش' :
                    opt === 'Plant Growth Regulator' ? 'پودوں کی نشوونما ریگولیٹر' :
                    opt
                  ) || opt}
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
                onModeOfActionFetched={() => {}}
                label={`Active Ingredient ${index + 1}`}
                placeholder={`Search active ingredient ${index + 1}...`}
                category={subType}
              />
            </div>
            {activeIngredients.length > 1 && (
              <Button type="button" variant="ghost" size="sm" onClick={() => removeActiveIngredientLine(index)} className="mt-8 text-red-500">
                ✕
              </Button>
            )}
          </div>
        ))}
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={addActiveIngredientLine} className="mt-2">
            + Add another active ingredient
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => handleTranslate('activeIngredient')} disabled={!getCombinedActiveIngredient().trim() || translating.activeIngredient} className="mt-2">
            {translating.activeIngredient ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : '🔄'}
            Translate to Urdu
          </Button>
        </div>
        <div className="space-y-2">
          {activeIngredientsUr.map((line, idx) => (
            <Input
              key={idx}
              value={line}
              onChange={(e) => updateActiveIngredientUrLine(idx, e.target.value)}
              placeholder={`Active Ingredient ${idx + 1} (Urdu)`}
              dir="rtl"
              className="urdu-text"
            />
          ))}
        </div>
      </div>

      <div>
        <Label>{t('product_form.mode_of_action')}</Label>
        <div className="flex gap-2">
          <Textarea value={modeOfAction} onChange={(e) => setModeOfAction(e.target.value)} rows={3} className="flex-1" />
          <Button type="button" variant="outline" size="sm" onClick={() => handleTranslate('modeOfAction')} disabled={!modeOfAction.trim() || translating.modeOfAction} className="self-start">
            {translating.modeOfAction ? <Loader2 className="h-4 w-4 animate-spin" /> : '🔄'}
            <span className="ml-2 hidden sm:inline">Urdu</span>
          </Button>
        </div>
        <Textarea value={modeOfActionUr} onChange={(e) => setModeOfActionUr(e.target.value)} rows={3} placeholder="Mode of Action (Urdu)" dir="rtl" className="mt-2 urdu-text" />
      </div>

      <div>
        <Label>{getTargetPestsLabel()}</Label>
        <MultiSelect
          label=""
          options={pestOptions}
          selected={selectedPests}
          onChange={setSelectedPests}
          placeholder={t('product_form.select_pests_placeholder')}
        />
      </div>

      <div>
        <Label>{t('product_form.applicable_crops')}</Label>
        <MultiSelect
          label=""
          options={cropOptions}
          selected={selectedCrops}
          onChange={setSelectedCrops}
          placeholder={t('product_form.select_crops_placeholder')}
        />
      </div>

      <div>
        <Label>{t('product_form.application_method')}</Label>
        <div className="flex gap-2">
          <Textarea value={applicationMethod} onChange={(e) => setApplicationMethod(e.target.value)} rows={2} className="flex-1" />
          <Button type="button" variant="outline" size="sm" onClick={() => handleTranslate('applicationMethod')} disabled={!applicationMethod.trim() || translating.applicationMethod} className="self-start">
            {translating.applicationMethod ? <Loader2 className="h-4 w-4 animate-spin" /> : '🔄'}
            <span className="ml-2 hidden sm:inline">Urdu</span>
          </Button>
        </div>
        <Textarea value={applicationMethodUr} onChange={(e) => setApplicationMethodUr(e.target.value)} rows={2} placeholder="Application Method (Urdu)" dir="rtl" className="mt-2 urdu-text" />
      </div>

      <div>
        <Label>{t('product_form.dosage')}</Label>
        <Input value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder={t('product_form.dosage_placeholder')} />
      </div>

      <div>
        <Label>{t('product_form.safety_info')}</Label>
        <div className="flex gap-2">
          <Textarea value={safetyInfo} onChange={(e) => setSafetyInfo(e.target.value)} rows={2} className="flex-1" />
          <Button type="button" variant="outline" size="sm" onClick={() => handleTranslate('safetyInfo')} disabled={!safetyInfo.trim() || translating.safetyInfo} className="self-start">
            {translating.safetyInfo ? <Loader2 className="h-4 w-4 animate-spin" /> : '🔄'}
            <span className="ml-2 hidden sm:inline">Urdu</span>
          </Button>
        </div>
        <Textarea value={safetyInfoUr} onChange={(e) => setSafetyInfoUr(e.target.value)} rows={2} placeholder="Safety Info (Urdu)" dir="rtl" className="mt-2 urdu-text" />
      </div>

      <div>
        <Label>{t('product_form.manufacturer')}</Label>
        <div className="flex gap-2">
          <Input value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} className="flex-1" />
          <Button type="button" variant="outline" size="sm" onClick={() => handleTranslate('manufacturer')} disabled={!manufacturer.trim() || translating.manufacturer}>
            {translating.manufacturer ? <Loader2 className="h-4 w-4 animate-spin" /> : '🔄'}
            <span className="ml-2 hidden sm:inline">Urdu</span>
          </Button>
        </div>
        <Input value={manufacturerUr} onChange={(e) => setManufacturerUr(e.target.value)} placeholder="Manufacturer (Urdu)" dir="rtl" className="mt-2 urdu-text" />
      </div>

      <div>
        <Label>Product Overview / Review (English)</Label>
        <div className="flex gap-2 mb-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => insertBold(overviewEnTextareaRef, setOverview, overview)}
            className="flex items-center gap-1"
          >
            <Bold className="h-4 w-4" />
            Bold
          </Button>
          <span className="text-xs text-muted-foreground self-center">
            Select text and click Bold, or click to insert ** at cursor.
          </span>
        </div>
        <div className="flex gap-2">
          <Textarea
            ref={overviewEnTextareaRef}
            value={overview}
            onChange={(e) => setOverview(e.target.value)}
            rows={4}
            className="flex-1"
            placeholder="Write a brief overview, benefits, usage notes, or review for this product..."
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleTranslate('overview')}
            disabled={!overview.trim() || translating.overview}
            className="self-start"
          >
            {translating.overview ? <Loader2 className="h-4 w-4 animate-spin" /> : '🔄'}
            <span className="ml-2 hidden sm:inline">Urdu</span>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Use **bold** text by wrapping words with ** (or use the Bold button). Example: **important**.
        </p>

        <Label className="mt-4">Product Overview / Review (Urdu)</Label>
        <div className="flex gap-2 mb-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => insertBold(overviewUrTextareaRef, setOverviewUr, overviewUr)}
            className="flex items-center gap-1"
          >
            <Bold className="h-4 w-4" />
            Bold
          </Button>
        </div>
        <Textarea
          ref={overviewUrTextareaRef}
          value={overviewUr}
          onChange={(e) => setOverviewUr(e.target.value)}
          rows={4}
          placeholder="Product Overview (Urdu)"
          dir="rtl"
          className="urdu-text"
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



