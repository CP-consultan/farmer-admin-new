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
    'product.details': 'Product Details',
    'product.type': 'Type',
    'product.subtype': 'Sub-Type',
    'product.active_ingredient': 'Active Ingredient',
    'product.mode_of_action': 'Mode of Action',
    'product.dosage': 'Dosage',
    'product.application_method': 'Application Method',
    'product.manufacturer': 'Manufacturer',
    'product.safety_info': 'Safety Information',
    'product.target_pests': 'Target Pests',
    'product.applicable_crops': 'Applicable Crops',
    'product.edit': 'Edit',
    'product.back_to_list': 'Back to List',
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
    'product.details': 'مصنوعات کی تفصیلات',
    'product.type': 'قسم',
    'product.subtype': 'ذیلی قسم',
    'product.active_ingredient': 'فعال جزو',
    'product.mode_of_action': 'عمل کا طریقہ',
    'product.dosage': 'خوراک',
    'product.application_method': 'استعمال کا طریقہ',
    'product.manufacturer': 'صنعت کار',
    'product.safety_info': 'حفاظتی معلومات',
    'product.target_pests': 'ہدف کیڑے',
    'product.applicable_crops': 'قابل اطلاق فصلیں',
    'product.edit': 'ترمیم',
    'product.back_to_list': 'واپس فہرست میں',
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
