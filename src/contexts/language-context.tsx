'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type Language = 'en' | 'ur'

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    'app.name': 'Farmer Admin',
    'nav.dashboard': 'Dashboard',
    'nav.pests': 'Pests',
    'nav.advisories': 'Advisories',
    'nav.products': 'Products',
    'nav.crops': 'Crops',
    'nav.import': 'Import CSV',
    'language.toggle': 'اردو',
  },
  ur: {
    'app.name': 'کسان ایڈمن',
    'nav.dashboard': 'ڈیش بورڈ',
    'nav.pests': 'کیڑے',
    'nav.advisories': 'مشورے',
    'nav.products': 'مصنوعات',
    'nav.crops': 'فصلیں',
    'nav.import': 'CSV درآمد کریں',
    'language.toggle': 'English',
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within LanguageProvider')
  return context
}
