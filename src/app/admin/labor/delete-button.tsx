'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export function DeleteButton({ id }: { id: string }) {
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm('Delete this labor listing?')) return
    const { error } = await supabase.from('labor').delete().eq('id', id)
    if (error) alert('Error: ' + error.message)
    else router.refresh()
  }

  return <button onClick={handleDelete} className="text-red-600">Delete</button>
}
