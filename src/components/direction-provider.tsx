'use client'

import { useEffect } from 'react'
import { useLanguage } from '@/contexts/language-context'

export function DirectionProvider({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage()

  useEffect(() => {
    document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr'
    // Optionally add a class to the body for RTL styling
    if (language === 'ur') {
      document.body.classList.add('rtl')
    } else {
      document.body.classList.remove('rtl')
    }
  }, [language])

  return <>{children}</>
}