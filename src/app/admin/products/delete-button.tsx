'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export function DeleteButton({ id }: { id: string }) {
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm('Delete this product?')) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) alert('Error: ' + error.message)
    else router.refresh()
  }

  return <button onClick={handleDelete} className="text-red-600">Delete</button>
}
