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
import { ReadFormButton } from '@/components/read-form-button'
import { useLanguage } from '@/contexts/language-context'

interface Pest {
  id: string
  scientific_name: string
  common_name_en: string | null
  common_name_ur: string | null
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
  const { t, language } = useLanguage()
  const [selectedPestId, setSelectedPestId] = useState(initialData?.pest_id || '')
  const [title, setTitle] = useState(initialData?.title || '')
  const [titleUr, setTitleUr] = useState(initialData?.title_ur || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [descriptionUr, setDescriptionUr] = useState(initialData?.description_ur || '')
  const [chemicalControl, setChemicalControl] = useState(initialData?.chemical_control || '')
  const [chemicalControlUr, setChemicalControlUr] = useState(initialData?.chemical_control_ur || '')
  const [culturalControl, setCulturalControl] = useState(initialData?.cultural_control || '')
  const [culturalControlUr, setCulturalControlUr] = useState(initialData?.cultural_control_ur || '')
  const [biologicalControl, setBiologicalControl] = useState(initialData?.biological_control || '')
  const [biologicalControlUr, setBiologicalControlUr] = useState(initialData?.biological_control_ur || '')
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

      const { data: links } = await supabase
        .from('product_pests')
        .select('product_id')
        .eq('pest_id', selectedPestId)

      if (links && links.length > 0) {
        const productIds = links.map(l => l.product_id)
        const { data: prods } = await supabase
          .from('agrochemicals')
          .select('id, name, type, sub_type, active_ingredient, dosage, application_method')
          .in('id', productIds)
          .order('name')
        // Cast to Product[] to satisfy TypeScript (type is included in select)
        setRecommendedProducts((prods || []) as Product[])
      } else {
        setRecommendedProducts([])
      }
    }

    fetchRecommendedProducts()
  }, [selectedPestId, supabase])

  // Auto-fill chemical control from selected products (optional)
  useEffect(() => {
    const selectedDetails = recommendedProducts.filter(p => selectedProducts.includes(p.id))
    if (selectedDetails.length === 0) return

    const lines = selectedDetails.map(p => {
      let line = p.name
      if (p.dosage) line += ` @ ${p.dosage}`
      if (p.application_method) line += ` (${p.application_method})`
      return line
    })
    setChemicalControl(`Recommended products: ${lines.join('; ')}`)
  }, [selectedProducts, recommendedProducts])

  const getFormSections = () => {
    const selectedPest = pests.find(p => p.id === selectedPestId)
    const pestName = selectedPest
      ? language === 'ur' && selectedPest.common_name_ur
        ? `${selectedPest.scientific_name} (${selectedPest.common_name_ur})`
        : selectedPest.scientific_name
      : ''
    const sections = [
      { label: t('advisory_form.select_pest'), value: pestName },
      { label: t('advisory_form.title'), value: title },
      { label: t('advisory_form.title_ur'), value: titleUr },
      { label: t('advisory_form.description'), value: description },
      { label: t('advisory_form.description_ur'), value: descriptionUr },
      { label: t('advisory_form.chemical_control'), value: chemicalControl },
      { label: t('advisory_form.chemical_control_ur'), value: chemicalControlUr },
      { label: t('advisory_form.cultural_control'), value: culturalControl },
      { label: t('advisory_form.cultural_control_ur'), value: culturalControlUr },
      { label: t('advisory_form.biological_control'), value: biologicalControl },
      { label: t('advisory_form.biological_control_ur'), value: biologicalControlUr },
    ]
    if (selectedProducts.length > 0) {
      const productNames = selectedProducts
        .map(id => products.find(p => p.id === id))
        .filter(p => p)
        .map(p => p!.name)
        .join(', ')
      sections.push({ label: t('advisory_form.recommended_products'), value: productNames })
    }
    return sections
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const advisoryData = {
      pest_id: selectedPestId,
      title,
      title_ur: titleUr || null,
      description,
      description_ur: descriptionUr || null,
      chemical_control: chemicalControl,
      chemical_control_ur: chemicalControlUr || null,
      cultural_control: culturalControl,
      cultural_control_ur: culturalControlUr || null,
      biological_control: biologicalControl,
      biological_control_ur: biologicalControlUr || null,
    }

    try {
      if (initialData) {
        const { error } = await supabase
          .from('advisories')
          .update(advisoryData)
          .eq('id', initialData.id)
        if (error) throw error

        await supabase.from('advisory_products').delete().eq('advisory_id', initialData.id)
        if (selectedProducts.length > 0) {
          const productInserts = selectedProducts.map(pid => ({
            advisory_id: initialData.id,
            product_id: pid
          }))
          const { error: relError } = await supabase.from('advisory_products').insert(productInserts)
          if (relError) throw relError
        }
      } else {
        const { data: newAdvisory, error } = await supabase
          .from('advisories')
          .insert([advisoryData])
          .select()
          .single()
        if (error) throw error

        if (selectedProducts.length > 0) {
          const productInserts = selectedProducts.map(pid => ({
            advisory_id: newAdvisory.id,
            product_id: pid
          }))
          const { error: relError } = await supabase.from('advisory_products').insert(productInserts)
          if (relError) throw relError
        }
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
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {initialData ? t('advisory_form.title_edit') : t('advisory_form.title_new')}
        </h2>
        <ReadFormButton sections={getFormSections()} />
      </div>

      <div>
        <Label>{t('advisory_form.select_pest')}</Label>
        <Select value={selectedPestId} onValueChange={setSelectedPestId} required>
          <SelectTrigger>
            <SelectValue placeholder={t('advisory_form.select_pest_placeholder')} />
          </SelectTrigger>
          <SelectContent>
            {pests.map((pest) => (
              <SelectItem key={pest.id} value={pest.id}>
                {pest.scientific_name}
                {pest.common_name_en && ` (${pest.common_name_en})`}
                {pest.common_name_ur && ` [${pest.common_name_ur}]`} – {pest.category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>{t('advisory_form.title')}</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>

      <div>
        <Label>{t('advisory_form.title_ur')}</Label>
        <Input value={titleUr} onChange={(e) => setTitleUr(e.target.value)} />
      </div>

      <div>
        <Label>{t('advisory_form.description')}</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </div>

      <div>
        <Label>{t('advisory_form.description_ur')}</Label>
        <Textarea value={descriptionUr} onChange={(e) => setDescriptionUr(e.target.value)} rows={3} />
      </div>

      {recommendedProducts.length > 0 && (
        <div className="border rounded-md p-4 bg-muted/20">
          <Label className="text-base mb-2">{t('advisory_form.recommended_products')}</Label>
          <p className="text-sm text-muted-foreground mb-3">
            {t('advisory_form.select_products')}
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
                  className="text-sm font-medium leading-none"
                >
                  {product.name}
                  {product.sub_type && <span className="ml-2 text-xs text-muted-foreground">({product.sub_type})</span>}
                  {product.active_ingredient && <span className="ml-2 text-xs text-muted-foreground">– {product.active_ingredient}</span>}
                  {product.dosage && <span className="ml-2 text-xs text-muted-foreground">@{product.dosage}</span>}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <Label>{t('advisory_form.chemical_control')}</Label>
        <Textarea
          value={chemicalControl}
          onChange={(e) => setChemicalControl(e.target.value)}
          rows={3}
        />
      </div>

      <div>
        <Label>{t('advisory_form.chemical_control_ur')}</Label>
        <Textarea
          value={chemicalControlUr}
          onChange={(e) => setChemicalControlUr(e.target.value)}
          rows={3}
        />
      </div>

      <div>
        <Label>{t('advisory_form.cultural_control')}</Label>
        <Textarea
          value={culturalControl}
          onChange={(e) => setCulturalControl(e.target.value)}
          rows={3}
        />
      </div>

      <div>
        <Label>{t('advisory_form.cultural_control_ur')}</Label>
        <Textarea
          value={culturalControlUr}
          onChange={(e) => setCulturalControlUr(e.target.value)}
          rows={3}
        />
      </div>

      <div>
        <Label>{t('advisory_form.biological_control')}</Label>
        <Textarea
          value={biologicalControl}
          onChange={(e) => setBiologicalControl(e.target.value)}
          rows={3}
        />
      </div>

      <div>
        <Label>{t('advisory_form.biological_control_ur')}</Label>
        <Textarea
          value={biologicalControlUr}
          onChange={(e) => setBiologicalControlUr(e.target.value)}
          rows={3}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading
          ? (initialData ? t('advisory_form.submit_updating') : t('advisory_form.submit_creating'))
          : (initialData ? t('advisory_form.submit_update') : t('advisory_form.submit_create'))
        }
      </Button>
    </form>
  )
}
