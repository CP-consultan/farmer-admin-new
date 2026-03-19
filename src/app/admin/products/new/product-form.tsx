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
      { label: 'Product Name', value: name },
      { label: 'Type', value: type },
      { label: 'Sub‑Type', value: subType },
      { label: 'Active Ingredient', value: activeIngredient },
      { label: 'Mode of Action', value: modeOfAction },
      { label: 'Application Method', value: applicationMethod },
      { label: 'Dosage', value: dosage },
      { label: 'Safety Information', value: safetyInfo },
      { label: 'Manufacturer', value: manufacturer },
    ]
    if (selectedPests.length > 0) {
      const pestNames = selectedPests
        .map(id => filteredPests.find(p => p.id === id))
        .filter(p => p)
        .map(p => p!.scientific_name)
        .join(', ')
      sections.push({ label: 'Target Pests', value: pestNames })
    }
    if (selectedCrops.length > 0) {
      const cropNames = selectedCrops
        .map(id => crops.find(c => c.id === id))
        .filter(c => c)
        .map(c => c!.name)
        .join(', ')
      sections.push({ label: 'Applicable Crops', value: cropNames })
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
        <h2 className="text-2xl font-bold">{initialData ? 'Edit Product' : 'Add New Product'}</h2>
        <ReadFormButton sections={getFormSections()} />
      </div>

      <div>
        <Label>Product Name *</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div>
        <Label>Type *</Label>
        <Select value={type} onValueChange={(val) => { setType(val); setSubType(''); setSelectedPests([]); }} required>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pesticide">Pesticide</SelectItem>
            <SelectItem value="fertilizer">Fertilizer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {type && (
        <div>
          <Label>Sub‑Type</Label>
          <Select value={subType} onValueChange={setSubType}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${type} sub‑type`} />
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
        label="Active Ingredient"
        category={subType}
      />

      <div>
        <Label>Mode of Action</Label>
        <Textarea
          value={modeOfAction}
          onChange={(e) => setModeOfAction(e.target.value)}
          rows={2}
        />
      </div>

      <MultiSelect
        label="Target Pests"
        options={pestOptions}
        selected={selectedPests}
        onChange={setSelectedPests}
        placeholder="Select pests..."
      />

      <MultiSelect
        label="Applicable Crops"
        options={cropOptions}
        selected={selectedCrops}
        onChange={setSelectedCrops}
        placeholder="Select crops..."
      />

      <div>
        <Label>Application Method</Label>
        <Textarea
          value={applicationMethod}
          onChange={(e) => setApplicationMethod(e.target.value)}
          rows={2}
        />
      </div>

      <div>
        <Label>Dosage</Label>
        <Input
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          placeholder="e.g., 2 ml/L"
        />
      </div>

      <div>
        <Label>Safety Information</Label>
        <Textarea
          value={safetyInfo}
          onChange={(e) => setSafetyInfo(e.target.value)}
          rows={2}
        />
      </div>

      <div>
        <Label>Manufacturer</Label>
        <Input
          value={manufacturer}
          onChange={(e) => setManufacturer(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Update Product' : 'Create Product')}
      </Button>
    </form>
  )
}
