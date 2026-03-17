'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'
import { Home, Bug, FileText, Users, Upload } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Pests', href: '/admin/pests', icon: Bug },
  { name: 'Advisories', href: '/admin/advisories', icon: FileText },
  { name: 'Import CSV', href: '/admin/import', icon: Upload },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link 
            href="/admin" 
            className="font-bold text-xl bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mr-6"
          >
            Farmer Admin
          </Link>
          <nav className="flex items-center space-x-1 flex-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <ThemeToggle />
        </div>
      </header>
      <main className="container mx-auto p-6">{children}</main>
    </div>
  )
}
