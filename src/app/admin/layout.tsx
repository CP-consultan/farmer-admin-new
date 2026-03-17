'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'
import { Home, Bug, FileText, Upload, Leaf, UserCircle } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Pests', href: '/admin/pests', icon: Bug },
  { name: 'Advisories', href: '/admin/advisories', icon: FileText },
  { name: 'Import CSV', href: '/admin/import', icon: Upload },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  const isActive = (itemHref: string) => {
    if (itemHref === '/admin') {
      return pathname === '/admin'
    }
    return pathname === itemHref || pathname.startsWith(itemHref + '/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Balanced, catchy header */}
      <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-slate-800 to-slate-700 text-white shadow-lg">
        {/* Top row */}
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link 
            href="/admin" 
            className="flex items-center gap-2 font-bold text-xl text-white hover:text-primary-foreground transition-colors"
          >
            <Leaf className="h-6 w-6 text-amber-300" strokeWidth={1.5} />
            <span>Farmer Admin</span>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2 text-sm text-slate-200">
              <UserCircle className="h-8 w-8 text-amber-200" />
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="container mx-auto px-4">
          <nav className="flex space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-t-lg transition-all duration-200',
                  isActive(item.href)
                    ? 'bg-white text-slate-800 shadow-md'
                    : 'text-slate-200 hover:bg-slate-600/50 hover:text-white'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="container mx-auto p-6">{children}</main>
    </div>
  )
}
