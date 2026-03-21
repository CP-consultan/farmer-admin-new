'use client'

import { useEffect } from 'react'
import { useLanguage } from '@/contexts/language-context'

export function RTLProvider({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage()

  useEffect(() => {
    document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr'
    // Optional: add a class to body for custom styling
    if (language === 'ur') {
      document.body.classList.add('urdu-rtl')
    } else {
      document.body.classList.remove('urdu-rtl')
    }
  }, [language])

  return <>{children}</>
}
