'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export function ToggleAdminButton({ userId, currentStatus }: { userId: string; currentStatus: boolean }) {
  const router = useRouter()
  const supabase = createClient()

  const handleToggle = async () => {
    const action = currentStatus ? 'revoke' : 'grant'
    if (!confirm(`Are you sure you want to ${action} admin privileges for this user?`)) return

    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: !currentStatus })
      .eq('id', userId)

    if (error) {
      alert('Error updating user: ' + error.message)
    } else {
      router.refresh()
    }
  }

  return (
    <button
      onClick={handleToggle}
      className={`text-sm font-medium ${currentStatus ? 'text-red-600 hover:text-red-900' : 'text-blue-600 hover:text-blue-900'}`}
    >
      {currentStatus ? 'Revoke Admin' : 'Make Admin'}
    </button>
  )
}
