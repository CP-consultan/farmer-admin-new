'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface AdFormProps {
  initialData?: any
}

export default function AdForm({ initialData }: AdFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || '')
  const [videoUrl, setVideoUrl] = useState(initialData?.video_url || '')
  const [fileUrl, setFileUrl] = useState(initialData?.file_url || '')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const adData = {
      title,
      description: description || null,
      image_url: imageUrl || null,
      video_url: videoUrl || null,
      file_url: fileUrl || null,
    }

    try {
      if (initialData) {
        const { error } = await supabase
          .from('ads')
          .update(adData)
          .eq('id', initialData.id)
        if (error) throw error
        alert('Ad updated successfully!')
      } else {
        const { error } = await supabase
          .from('ads')
          .insert([adData])
        if (error) throw error
        alert('Ad created successfully!')
      }
      router.push('/admin/ads')
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold">
        {initialData ? 'Edit Ad' : 'Add New Ad'}
      </h2>

      <div>
        <Label>Title *</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>

      <div>
        <Label>Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </div>

      <div>
        <Label>Image URL</Label>
        <Input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
        />
        <p className="text-xs text-muted-foreground">Link to an image (JPG, PNG, etc.)</p>
      </div>

      <div>
        <Label>Video URL</Label>
        <Input
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://..."
        />
        <p className="text-xs text-muted-foreground">YouTube embed or direct video link</p>
      </div>

      <div>
        <Label>File URL (Literature)</Label>
        <Input
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          placeholder="https://..."
        />
        <p className="text-xs text-muted-foreground">Link to PDF, brochure, etc.</p>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Update Ad' : 'Create Ad')}
      </Button>
    </form>
  )
}
