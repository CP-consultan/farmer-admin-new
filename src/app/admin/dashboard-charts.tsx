'use client'

import Link from 'next/link'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTheme } from '@/context/ThemeContext'

interface DashboardChartsProps {
  counts: {
    pest: number
    advisory: number
    product: number
    equipment: number
    labor: number
    user: number
  }
  recentPests: any[]
  recentAdvisories: any[]
}

export default function DashboardCharts({ counts, recentPests, recentAdvisories }: DashboardChartsProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const barData = [
    { name: 'Pests', value: counts.pest, color: '#3B82F6' },
    { name: 'Advisories', value: counts.advisory, color: '#10B981' },
    { name: 'Products', value: counts.product, color: '#F59E0B' },
    { name: 'Equipment', value: counts.equipment, color: '#8B5CF6' },
    { name: 'Labor', value: counts.labor, color: '#EC4899' },
    { name: 'Users', value: counts.user, color: '#6366F1' },
  ]

  const COLORS = barData.map(d => d.color)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
        Dashboard
      </h1>
      <p className="text-muted-foreground">Welcome back! Here's what's happening with your app.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Pests" count={counts.pest} href="/admin/pests" icon="🐛" />
        <StatCard title="Total Advisories" count={counts.advisory} href="/admin/advisories" icon="📝" />
        <StatCard title="Products" count={counts.product} href="/admin/products" icon="🛒" />
        <StatCard title="Equipment" count={counts.equipment} href="/admin/equipment" icon="🚜" />
        <StatCard title="Labor" count={counts.labor} href="/admin/labor" icon="👷" />
        <StatCard title="Users" count={counts.user} href="/admin/users" icon="👤" />
      </div>

      {/* Rest of your component... */}
    </div>
  )
}

function StatCard({ title, count, href, icon }: { title: string; count: number; href: string; icon: string }) {
  return (
    <Link href={href} className="group">
      <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-muted/20 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold text-primary">{count}</p>
            </div>
            <span className="text-3xl opacity-80 group-hover:scale-110 transition-transform duration-300">{icon}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}