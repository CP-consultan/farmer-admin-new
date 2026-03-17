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

export default function DashboardCharts({ counts, recentPests, recentAdvisories }: { 
  counts: any; 
  recentPests: any[]; 
  recentAdvisories: any[] 
}) {
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
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
      <p className="text-gray-600 dark:text-gray-300">Welcome back! Here's what's happening with your app.</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Pests" count={counts.pest} href="/admin/pests" color="bg-blue-500" icon="🐛" />
        <StatCard title="Total Advisories" count={counts.advisory} href="/admin/advisories" color="bg-green-500" icon="📝" />
        <StatCard title="Products" count={counts.product} href="/admin/products" color="bg-yellow-500" icon="🛒" />
        <StatCard title="Equipment" count={counts.equipment} href="/admin/equipment" color="bg-purple-500" icon="🚜" />
        <StatCard title="Labor" count={counts.labor} href="/admin/labor" color="bg-pink-500" icon="👷" />
        <StatCard title="Users" count={counts.user} href="/admin/users" color="bg-indigo-500" icon="👤" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Content Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', color: '#F9FAFB', border: 'none' }} />
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

        <Card>
          <CardHeader>
            <CardTitle>Proportion of Data</CardTitle>
          </CardHeader>
          <CardContent>
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
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', color: '#F9FAFB', border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Pests</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentPests.map((pest) => (
                <li key={pest.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">{pest.scientific_name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{pest.common_name_en || pest.common_name}</p>
                  </div>
                  <Link href={`/admin/pests/${pest.id}/edit`} className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
                    Edit
                  </Link>
                </li>
              ))}
              {recentPests.length === 0 && <li className="py-3 text-gray-500">No recent pests</li>}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Advisories</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentAdvisories.map((adv) => (
                <li key={adv.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">{adv.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{adv.pests?.scientific_name || 'Unknown pest'}</p>
                  </div>
                  <Link href={`/admin/advisories/${adv.id}/edit`} className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
                    Edit
                  </Link>
                </li>
              ))}
              {recentAdvisories.length === 0 && <li className="py-3 text-gray-500">No recent advisories</li>}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ title, count, href, color, icon }: { title: string; count: number; href: string; color: string; icon: string }) {
  return (
    <Link href={href} className="group">
      <div className={`${color} rounded-xl shadow-lg p-6 text-white hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{count}</p>
            <p className="text-sm opacity-90 mt-1">{title}</p>
          </div>
          <span className="text-4xl opacity-80">{icon}</span>
        </div>
      </div>
    </Link>
  )
}
