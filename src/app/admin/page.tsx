import { createClient } from '@/utils/supabase/server'
import DashboardCharts from './dashboard-charts'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { count: pestCount } = await supabase
    .from('pests')
    .select('*', { count: 'exact', head: true })

  const { count: advisoryCount } = await supabase
    .from('advisories')
    .select('*', { count: 'exact', head: true })

  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  const { count: equipmentCount } = await supabase
    .from('equipment')
    .select('*', { count: 'exact', head: true })

  const { count: laborCount } = await supabase
    .from('labor')
    .select('*', { count: 'exact', head: true })

  const { count: userCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const counts = {
    pest: pestCount || 0,
    advisory: advisoryCount || 0,
    product: productCount || 0,
    equipment: equipmentCount || 0,
    labor: laborCount || 0,
    user: userCount || 0,
  }

  const { data: recentPests } = await supabase
    .from('pests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: recentAdvisories } = await supabase
    .from('advisories')
    .select('*, pests(scientific_name)')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <DashboardCharts
      counts={counts}
      recentPests={recentPests || []}
      recentAdvisories={recentAdvisories || []}
    />
  )
}
