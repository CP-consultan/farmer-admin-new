'use client'

import Link from 'next/link'
import { ... } from 'recharts'
import { Card, ... } from '@/components/ui/card'
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
  // ... rest of the component
}