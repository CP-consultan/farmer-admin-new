'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

interface Pest {
  id: string
  scientific_name: string
  common_name_en: string | null
  category: string
}

interface Product {
  id: string
  name: string
  type: string
  sub_type: string | null
  active_ingredient: string | null
  dosage: string | null
  application_method: string | null
}

interface AdvisoryFormProps {
  pests: Pest[]
  products: Product[]
  initialData?: any
}

export default function AdvisoryForm({ pests, products, initialData }: AdvisoryFormProps) {
  const [selectedPestId, setSelectedPestId] = useState(initialData?.pest_id || '')
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [chemicalControl, setChemicalControl] = useState(initialData?.chemical_control || '')
  const [culturalControl, setCulturalControl] = useState(initialData?.cultural_control || '')
  const [biologicalControl, setBiologicalControl] = useState(initialData?.biological_control || '')
  const [selectedProducts, setSelectedProducts] = useState<string[]>(initialData?.products || [])
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      if (!selectedPestId) {
        setRecommendedProducts([])
        return
      }

      const { data: links, error: linksError } = await supabase
        .from('product_pests')
        .select('product_id')
        .eq('pest_id', selectedPestId)

      if (linksError) {
        console.error('Error fetching product links:', linksError)
        setRecommendedProducts([])
        return
      }

      if (links && links.length > 0) {
        const productIds = links.map(l => l.product_id)
        const { data: prods, error: prodsError } = await supabase
          .from('agrochemicals')
          .select('id, name, type, sub_type, active_ingredient, dosage, application_method')
          .in('id', productIds)
          .order('name')

        if (prodsError) {
          console.error('Error fetching products:', prodsError)
          setRecommendedProducts([])
        } else {
          setRecommendedProducts(prods || [])
        }
      } else {
        setRecommendedProducts([])
      }
    }

    fetchRecommendedProducts()
  }, [selectedPestId, supabase])

  useEffect(() => {
    const selectedDetails = recommendedProducts.filter(p => selectedProducts.includes(p.id))
    if (selectedDetails.length === 0) {
      setChemicalControl('')
      return
    }

    const lines = selectedDetails.map(p => {
      let line = p.name
      if (p.dosage) line += ` @ ${p.dosage}`
      if (p.application_method) line += ` (${p.application_method})`
      return line
    })
    setChemicalControl(`Recommended products: ${lines.join('; ')}`)
  }, [selectedProducts, recommendedProducts])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const advisoryData = {
      pest_id: selectedPestId,
      title,
      description,
      chemical_control: chemicalControl,
      cultural_control: culturalControl,
      biological_control: biologicalControl,
    }

    try {
      if (initialData) {
        const { error: updateError } = await supabase
          .from('advisories')
          .update(advisoryData)
          .eq('id', initialData.id)
        if (updateError) throw updateError

        await supabase.from('advisory_products').delete().eq('advisory_id', initialData.id)

        if (selectedProducts.length > 0) {
          const productInserts = selectedProducts.map(pid => ({
            advisory_id: initialData.id,
            product_id: pid
          }))
          const { error: relError } = await supabase.from('advisory_products').insert(productInserts)
          if (relError) throw relError
        }

        alert('Advisory updated successfully!')
      } else {
        const { data: newAdvisory, error: insertError } = await supabase
          .from('advisories')
          .insert([advisoryData])
          .select()
          .single()
        if (insertError) throw insertError

        if (selectedProducts.length > 0) {
          const productInserts = selectedProducts.map(pid => ({
            advisory_id: newAdvisory.id,
            product_id: pid
          }))
          const { error: relError } = await supabase.from('advisory_products').insert(productInserts)
          if (relError) throw relError
        }

        alert('Advisory created successfully!')
      }
      router.push('/admin/advisories')
    } catch (error: any) {
      alert('Error: ' + error.message)
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label>Select Pest</Label>
        <Select value={selectedPestId} onValueChange={setSelectedPestId} required>
          <SelectTrigger>
            <SelectValue placeholder="Choose a pest" />
          </SelectTrigger>
          <SelectContent>
            {pests.map((pest) => (
              <SelectItem key={pest.id} value={pest.id}>
                {pest.scientific_name} {pest.common_name_en && `(${pest.common_name_en})`} – {pest.category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Advisory Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </div>

      {recommendedProducts.length > 0 && (
        <div className="border rounded-md p-4 bg-muted/20">
          <Label className="text-base mb-2">Recommended Products</Label>
          <p className="text-sm text-muted-foreground mb-3">
            Select products to include in chemical control.
          </p>
          <div className="space-y-2">
            {recommendedProducts.map((product) => (
              <div key={product.id} className="flex items-start space-x-2">
                <Checkbox
                  id={`product-${product.id}`}
                  checked={selectedProducts.includes(product.id)}
                  onCheckedChange={() => toggleProduct(product.id)}
                />
                <label
                  htmlFor={`product-${product.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {product.name}
                  {product.sub_type && <span className="ml-2 text-xs text-muted-foreground">({product.sub_type})</span>}
                  {product.active_ingredient && <span className="ml-2 text-xs text-muted-foreground">– {product.active_ingredient}</span>}
                  {product.dosage && <span className="ml-2 text-xs text-muted-foreground">@{product.dosage}</span>}
                  {product.application_method && <span className="ml-2 text-xs text-muted-foreground">({product.application_method})</span>}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <Label>Chemical Control</Label>
        <Textarea
          value={chemicalControl}
          onChange={(e) => setChemicalControl(e.target.value)}
          rows={3}
          placeholder="Chemical control recommendations (auto‑filled from selected products)"
        />
        <p className="text-xs text-muted-foreground mt-1">
          This field updates automatically when you select/deselect products. You can edit it manually if needed.
        </p>
      </div>

      <div>
        <Label>Cultural Control</Label>
        <Textarea
          value={culturalControl}
          onChange={(e) => setCulturalControl(e.target.value)}
          rows={3}
        />
      </div>

      <div>
        <Label>Biological Control</Label>
        <Textarea
          value={biologicalControl}
          onChange={(e) => setBiologicalControl(e.target.value)}
          rows={3}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Update Advisory' : 'Create Advisory')}
      </Button>
    </form>
  )
}
