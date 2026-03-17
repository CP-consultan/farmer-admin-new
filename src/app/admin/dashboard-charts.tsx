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
import { useEffect, useState } from 'react'
import { Bug, FileText, ShoppingCart, Tractor, Wrench, Users } from 'lucide-react'

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
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches))
  }, [theme])

  const barData = [
    { name: 'Pests', value: counts.pest, color: '#708238' }, // Olive Green
    { name: 'Advisories', value: counts.advisory, color: '#8B5A2B' }, // Brown
    { name: 'Products', value: counts.product, color: '#4A6FA5' }, // Steel Blue
    { name: 'Equipment', value: counts.equipment, color: '#9B6B9E' }, // Purple
    { name: 'Labor', value: counts.labor, color: '#D98C4A' }, // Orange
    { name: 'Users', value: counts.user, color: '#5F9EA0' }, // Cadet Blue
  ]

  const COLORS = barData.map(d => d.color)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-[#708238] to-[#5a6a2e] bg-clip-text text-transparent">
        Dashboard
      </h1>
      <p className="text-muted-foreground">Welcome back! Here's what's happening with your app.</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Pests" count={counts.pest} href="/admin/pests" icon={Bug} color="from-[#708238] to-[#5a6a2e]" />
        <StatCard title="Total Advisories" count={counts.advisory} href="/admin/advisories" icon={FileText} color="from-[#8B5A2B] to-[#6b431f]" />
        <StatCard title="Products" count={counts.product} href="/admin/products" icon={ShoppingCart} color="from-[#4A6FA5] to-[#3a5a8a]" />
        <StatCard title="Equipment" count={counts.equipment} href="/admin/equipment" icon={Tractor} color="from-[#9B6B9E] to-[#7b4f7e]" />
        <StatCard title="Labor" count={counts.labor} href="/admin/labor" icon={Wrench} color="from-[#D98C4A] to-[#b86e2a]" />
        <StatCard title="Users" count={counts.user} href="/admin/users" icon={Users} color="from-[#5F9EA0] to-[#3f7a7c]" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-[#708238]/10 to-transparent">
            <CardTitle>Content Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                <XAxis dataKey="name" stroke={isDark ? '#9CA3AF' : '#6B7280'} />
                <YAxis stroke={isDark ? '#9CA3AF' : '#6B7280'} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                    color: isDark ? '#F9FAFB' : '#111827',
                    border: 'none',
                    borderRadius: '0.5rem',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-[#708238]/10 to-transparent">
            <CardTitle>Proportion of Data</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={barData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => {
                    const percentage = percent ? (percent * 100).toFixed(0) : '0';
                    return `${name} ${percentage}%`;
                  }}
                >
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                    color: isDark ? '#F9FAFB' : '#111827',
                    border: 'none',
                    borderRadius: '0.5rem',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-[#708238]/10 to-transparent">
            <CardTitle>Recent Pests</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {recentPests.map((pest) => (
                <li key={pest.id} className="py-3 flex justify-between items-center group">
                  <div>
                    <p className="font-medium">{pest.scientific_name}</p>
                    <p className="text-sm text-muted-foreground">{pest.common_name_en || pest.common_name}</p>
                  </div>
                  <Link href={`/admin/pests/${pest.id}/edit`} className="text-sm font-medium text-[#708238] hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                    Edit
                  </Link>
                </li>
              ))}
              {recentPests.length === 0 && <li className="py-3 text-muted-foreground">No recent pests</li>}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-[#708238]/10 to-transparent">
            <CardTitle>Recent Advisories</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {recentAdvisories.map((adv) => (
                <li key={adv.id} className="py-3 flex justify-between items-center group">
                  <div>
                    <p className="font-medium">{adv.title}</p>
                    <p className="text-sm text-muted-foreground">{adv.pests?.scientific_name || 'Unknown pest'}</p>
                  </div>
                  <Link href={`/admin/advisories/${adv.id}/edit`} className="text-sm font-medium text-[#708238] hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                    Edit
                  </Link>
                </li>
              ))}
              {recentAdvisories.length === 0 && <li className="py-3 text-muted-foreground">No recent advisories</li>}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ title, count, href, icon: Icon, color }: { title: string; count: number; href: string; icon: any; color: string }) {
  return (
    <Link href={href} className="group">
      <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
        <div className={`bg-gradient-to-br ${color} p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">{title}</p>
              <p className="text-3xl font-bold text-white">{count}</p>
            </div>
            <Icon className="h-10 w-10 text-white/80 group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
          </div>
        </div>
      </Card>
    </Link>
  )
}
