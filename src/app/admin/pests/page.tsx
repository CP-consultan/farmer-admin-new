import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import PestsTable from './pests-table'

export default async function PestsPage() {
  const supabase = await createClient()
  const { data: pests } = await supabase.from('pests').select('*')

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pests Management</h1>
          <p className="text-muted-foreground mt-1">Manage your pest database</p>
        </div>
        <Link href="/admin/pests/new" className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
          + Add New Pest
        </Link>
      </div>
      <PestsTable initialPests={pests || []} />
    </div>
  )
}
