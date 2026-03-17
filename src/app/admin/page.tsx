import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { count: pestCount } = await supabase.from('pests').select('*', { count: 'exact', head: true })
  const { count: advisoryCount } = await supabase.from('advisories').select('*', { count: 'exact', head: true })
  const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true })
  const { count: equipmentCount } = await supabase.from('equipment').select('*', { count: 'exact', head: true })
  const { count: laborCount } = await supabase.from('labor').select('*', { count: 'exact', head: true })
  const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">Welcome to your admin panel. Charts are temporarily disabled.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Pests" count={pestCount || 0} href="/admin/pests" />
        <StatCard title="Advisories" count={advisoryCount || 0} href="/admin/advisories" />
        <StatCard title="Products" count={productCount || 0} href="/admin/products" />
        <StatCard title="Equipment" count={equipmentCount || 0} href="/admin/equipment" />
        <StatCard title="Labor" count={laborCount || 0} href="/admin/labor" />
        <StatCard title="Users" count={userCount || 0} href="/admin/users" />
      </div>
    </div>
  )
}

function StatCard({ title, count, href }: { title: string; count: number; href: string }) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{count}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
