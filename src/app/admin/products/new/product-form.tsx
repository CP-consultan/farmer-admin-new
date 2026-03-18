'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import ActiveIngredientInput from '@/components/active-ingredient-input'

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

// Map sub‑types to pest categories (adjust to match your database values)
const subTypeToCategory: Record<string, string> = {
  Herbicide: 'weed',
  Insecticide: 'insect',
  Fungicide: 'fungus',
  Bactericide: 'bacteria',
  Nematicide: 'nematode',       // if you have such category
  Acaricide: 'mite',             // if needed
  Rodenticide: 'rodent',         // if needed
  Molluscicide: 'mollusc',       // if needed
  'Plant Growth Regulator': 'plant', // fallback or none
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

  // Filter pests based on sub‑type category
  const filteredPests = useMemo(() => {
    if (!subType || !subTypeToCategory[subType]) {
      return pests // show all if no mapping or no sub‑type
    }
    const targetCategory = subTypeToCategory[subType]
    return pests.filter(p => p.category?.toLowerCase() === targetCategory.toLowerCase())
  }, [pests, subType])

  // Reset selected pests when sub‑type changes (to avoid invalid selections)
  useEffect(() => {
    setSelectedPests([])
  }, [subType])

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

    if (initialData) {
      const { error } = await supabase
        .from('agrochemicals')
        .update(productData)
        .eq('id', initialData.id)

      if (error) {
        alert('Error updating product: ' + error.message)
        setLoading(false)
        return
      }

      await supabase.from('product_pests').delete().eq('product_id', initialData.id)
      await supabase.from('product_crops').delete().eq('product_id', initialData.id)

      if (selectedPests.length > 0) {
        const pestInserts = selectedPests.map(pestId => ({
          product_id: initialData.id,
          pest_id: pestId
        }))
        await supabase.from('product_pests').insert(pestInserts)
      }

      if (selectedCrops.length > 0) {
        const cropInserts = selectedCrops.map(cropId => ({
          product_id: initialData.id,
          crop_id: cropId
        }))
        await supabase.from('product_crops').insert(cropInserts)
      }
    } else {
      const { data: product, error } = await supabase
        .from('agrochemicals')
        .insert([productData])
        .select()
        .single()

      if (error) {
        alert('Error creating product: ' + error.message)
        setLoading(false)
        return
      }

      if (selectedPests.length > 0) {
        const pestInserts = selectedPests.map(pestId => ({
          product_id: product.id,
          pest_id: pestId
        }))
        await supabase.from('product_pests').insert(pestInserts)
      }

      if (selectedCrops.length > 0) {
        const cropInserts = selectedCrops.map(cropId => ({
          product_id: product.id,
          crop_id: cropId
        }))
        await supabase.from('product_crops').insert(cropInserts)
      }
    }

    router.push('/admin/products')
  }

  const togglePest = (pestId: string) => {
    setSelectedPests(prev =>
      prev.includes(pestId)
        ? prev.filter(id => id !== pestId)
        : [...prev, pestId]
    )
  }

  const toggleCrop = (cropId: string) => {
    setSelectedCrops(prev =>
      prev.includes(cropId)
        ? prev.filter(id => id !== cropId)
        : [...prev, cropId]
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Product Name *</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div>
        <Label>Type *</Label>
        <Select value={type} onValueChange={(val) => { setType(val); setSubType('') }} required>
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
          placeholder="Will auto‑populate when ingredient is selected"
        />
      </div>

      <div>
        <Label>Target Pests (select multiple)</Label>
        <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
          {filteredPests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pests found for this sub‑type</p>
          ) : (
            filteredPests.map((pest) => (
              <div key={pest.id} className="flex items-center space-x-2 py-1">
                <input
                  type="checkbox"
                  id={`pest-${pest.id}`}
                  checked={selectedPests.includes(pest.id)}
                  onChange={() => togglePest(pest.id)}
                  className="rounded border-gray-300"
                />
                <label htmlFor={`pest-${pest.id}`} className="text-sm">
                  {pest.scientific_name} {pest.common_name_en && `(${pest.common_name_en})`}
                  <span className="ml-2 text-xs text-muted-foreground">({pest.category})</span>
                </label>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <Label>Applicable Crops (select multiple)</Label>
        <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
          {crops.map((crop) => (
            <div key={crop.id} className="flex items-center space-x-2 py-1">
              <input
                type="checkbox"
                id={`crop-${crop.id}`}
                checked={selectedCrops.includes(crop.id)}
                onChange={() => toggleCrop(crop.id)}
                className="rounded border-gray-300"
              />
              <label htmlFor={`crop-${crop.id}`} className="text-sm">
                {crop.name} {crop.common_name_en && `(${crop.common_name_en})`}
              </label>
            </div>
          ))}
        </div>
      </div>

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
