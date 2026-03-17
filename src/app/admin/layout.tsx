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
      {/* Olive Green banner – #708238, solid (100% opacity) */}
      <header className="sticky top-0 z-50 w-full bg-[#708238] border-b border-[#5a6a2e] shadow-lg">
        {/* Top row */}
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link 
            href="/admin" 
            className="flex items-center gap-2 font-extrabold text-2xl text-white hover:text-amber-200 transition-colors"
          >
            <Leaf className="h-7 w-7 text-amber-300" strokeWidth={1.8} />
            <span>Farmer Admin</span>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2 text-base font-medium text-white/80">
              <UserCircle className="h-9 w-9 text-amber-300/80" />
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
                  'flex items-center gap-2 px-6 py-3 text-base font-semibold rounded-t-lg transition-all duration-200',
                  isActive(item.href)
                    ? 'bg-white/20 text-white shadow-md border-b-2 border-amber-400'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                )}
              >
                <item.icon className="h-5 w-5" strokeWidth={1.8} />
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
