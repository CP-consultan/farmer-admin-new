'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'

export function DeleteButton({ id }: { id: string }) {
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item?')) return

    const { error } = await supabase
      .from('pests')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Error deleting: ' + error.message)
    } else {
      router.refresh()
    }
  }

  return (
    <Button onClick={handleDelete} variant="destructive" size="sm">
      Delete
    </Button>
  )
}
