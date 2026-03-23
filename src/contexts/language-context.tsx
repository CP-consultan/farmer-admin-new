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
    // App
    'app.name': 'Farmer Admin',

    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.pests': 'Pests',
    'nav.advisories': 'Advisories',
    'nav.products': 'Products',
    'nav.crops': 'Crops',
    '',
    'nav.ads': 'Ads',
    'language.toggle': 'اردو',

    // Product (existing)
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

    'products.title': 'Pesticides & Fertilizers',
    'products.description': 'Manage agricultural products and their details',
    'products.add_new': '+ Add New Product',
    'products.table.name': 'Name',
    'products.table.type': 'Type',
    'products.table.active_ingredient': 'Active Ingredient',
    'products.table.target_pests': 'Target Pests',
    'products.table.applicable_crops': 'Applicable Crops',
    'products.table.manufacturer': 'Manufacturer',
    'products.table.actions': 'Actions',
    'products.pest_count_singular': '{count} pest',
    'products.pest_count_plural': '{count} pests',
    'products.crop_count_singular': '{count} crop',
    'products.crop_count_plural': '{count} crops',
    'products.no_products': 'No products found.',
    'products.edit': 'Edit',

    // Product Form (new keys)
    'product_form.title_new': 'Add New Product',
    'product_form.title_edit': 'Edit Product',
    'product_form.read_form': 'Read Form',
    'product_form.product_name': 'Product Name *',
    'product_form.product_name_ur': 'Product Name (Urdu)',
    'product_form.type': 'Type *',
    'product_form.subtype': 'Sub‑Type',
    'product_form.active_ingredient': 'Active Ingredient',
    'product_form.mode_of_action': 'Mode of Action',
    'product_form.target_pests': 'Target Pests',
    'product_form.target_pests_insecticide': 'Insect‑killing ability',
    'product_form.target_pests_herbicide': 'Weed‑killing ability',
    'product_form.target_pests_fungicide': 'Disease control ability',
    'product_form.target_pests_other': 'Target pests',
    'product_form.applicable_crops': 'Applicable Crops',
    'product_form.application_method': 'Application Method',
    'product_form.dosage': 'Dosage',
    'product_form.safety_info': 'Safety Information',
    'product_form.manufacturer': 'Manufacturer',
    'product_form.submit_create': 'Create Product',
    'product_form.submit_update': 'Update Product',
    'product_form.submit_creating': 'Creating...',
    'product_form.submit_updating': 'Updating...',
    'product_form.select_type_placeholder': 'Select type',
    'product_form.select_subtype_placeholder': 'Select {type} sub‑type',
    'product_form.select_pests_placeholder': 'Select pests...',
    'product_form.select_crops_placeholder': 'Select crops...',
    'product_form.dosage_placeholder': 'e.g., 2 ml/L',

    // Pests
    'pests.title': 'Pests',
    'pests.description': 'Manage pest database',
    'pests.add_new': '+ Add New Pest',
    'pests.table.scientific_name': 'Scientific Name',
    'pests.table.common_name_en': 'Common Name (English)',
    'pests.table.common_name_ur': 'Common Name (Urdu)',
    'pests.table.category': 'Category',
    'pests.table.actions': 'Actions',
    'pests.no_pests': 'No pests found.',
    'pests.edit': 'Edit',

    'pest_form.title_new': 'Add New Pest',
    'pest_form.title_edit': 'Edit Pest',
    'pest_form.scientific_name': 'Scientific Name *',
    'pest_form.common_name_en': 'Common Name (English)',
    'pest_form.common_name_ur': 'Common Name (Urdu)',
    'pest_form.category': 'Category',
    'pest_form.category_placeholder': 'Select category',
    'pest_form.submit_create': 'Create Pest',
    'pest_form.submit_update': 'Update Pest',
    'pest_form.submit_creating': 'Creating...',
    'pest_form.submit_updating': 'Updating...',

    // Crops
    'crops.title': 'Crops',
    'crops.description': 'Manage crop database',
    'crops.add_new': '+ Add New Crop',
    'crops.table.name': 'Name (English)',
    'crops.table.name_ur': 'Name (Urdu)',
    'crops.table.common_name_en': 'Common Name (English)',
    'crops.table.category': 'Category',
    'crops.table.actions': 'Actions',
    'crops.no_crops': 'No crops found.',
    'crops.edit': 'Edit',

    'crop_form.title_new': 'Add New Crop',
    'crop_form.title_edit': 'Edit Crop',
    'crop_form.name': 'Name (English) *',
    'crop_form.name_ur': 'Name (Urdu)',
    'crop_form.common_name_en': 'Common Name (English)',
    'crop_form.category': 'Category',
    'crop_form.category_placeholder': 'Select category',
    'crop_form.submit_create': 'Create Crop',
    'crop_form.submit_update': 'Update Crop',
    'crop_form.submit_creating': 'Creating...',
    'crop_form.submit_updating': 'Updating...',

    // Advisories
    'advisories.title': 'Advisories',
    'advisories.description': 'Manage pest advisories',
    'advisories.add_new': '+ Add New Advisory',
    'advisories.table.pest': 'Pest',
    'advisories.table.title': 'Title (English)',
    'advisories.table.title_ur': 'Title (Urdu)',
    'advisories.table.actions': 'Actions',
    'advisories.no_advisories': 'No advisories found.',
    'advisories.edit': 'Edit',

    'advisory_form.title_new': 'Add New Advisory',
    'advisory_form.title_edit': 'Edit Advisory',
    'advisory_form.select_pest': 'Select Pest *',
    'advisory_form.select_pest_placeholder': 'Choose a pest',
    'advisory_form.title': 'Title (English) *',
    'advisory_form.title_ur': 'Title (Urdu)',
    'advisory_form.description': 'Description (English)',
    'advisory_form.description_ur': 'Description (Urdu)',
    'advisory_form.chemical_control': 'Chemical Control (English)',
    'advisory_form.chemical_control_ur': 'Chemical Control (Urdu)',
    'advisory_form.cultural_control': 'Cultural Control (English)',
    'advisory_form.cultural_control_ur': 'Cultural Control (Urdu)',
    'advisory_form.biological_control': 'Biological Control (English)',
    'advisory_form.biological_control_ur': 'Biological Control (Urdu)',
    'advisory_form.recommended_products': 'Recommended Products',
    'advisory_form.select_products': 'Select products to include',
    'advisory_form.submit_create': 'Create Advisory',
    'advisory_form.submit_update': 'Update Advisory',
    'advisory_form.submit_creating': 'Creating...',
    'advisory_form.submit_updating': 'Updating...',
  },
  ur: {
    // App
    'app.name': 'کسان ایڈمن',

    // Navigation
    'nav.dashboard': 'ڈیش بورڈ',
    'nav.pests': 'کیڑے',
    'nav.advisories': 'مشورے',
    'nav.products': 'پروڈکٹ',
    'nav.crops': 'فصلیں',
    '',
    'nav.ads': 'Ads',
    'language.toggle': 'English',

    // Product (same as before, add Urdu translations)
    'product.details': 'پروڈکٹ کی تفصیلات',
    'product.type': 'قسم',
    'product.subtype': 'ذیلی قسم',
    'product.active_ingredient': 'فعال جزو',
    'product.mode_of_action': 'طریقہ اثر',
    'product.dosage': 'مقدار',
    'product.application_method': 'استعمال کا طریقہ کار',
    'product.manufacturer': 'صنعت کار',
    'product.safety_info': 'حفاظتی معلومات',
    'product.target_pests': 'ہدف کیڑے',
    'product.applicable_crops': 'قابل اطلاق فصلیں',
    'product.edit': 'ترمیم',
    'product.back_to_list': 'واپس فہرست میں',

    'products.title': 'زرعی زہریں اور کھادیں',
    'products.description': 'زرعی زہریں اور ان کی تفصیلات کا نظم کریں',
    'products.add_new': '+ نئی پروڈکٹ  شامل کریں',
    'products.table.name': 'نام',
    'products.table.type': 'قسم',
    'products.table.active_ingredient': 'مؤثر اجزاء',
    'products.table.target_pests': 'ہدف کیڑے',
    'products.table.applicable_crops': 'قابل اطلاق فصلیں',
    'products.table.manufacturer': 'صنعت کار',
    'products.table.actions': 'اعمال',
    'products.pest_count_singular': '{count} کیڑا',
    'products.pest_count_plural': '{count} کیڑے',
    'products.crop_count_singular': '{count} فصل',
    'products.crop_count_plural': '{count} فصلیں',
    'products.no_products': 'کوئی پروڈکٹ نہیں ملی',
    'products.edit': 'ترمیم',

    // Product Form (new Urdu keys)
    'product_form.title_new': 'نئی زرعی زہر شامل کریں',
    'product_form.title_edit': 'زرعی زہر میں ترمیم کریں',
    'product_form.read_form': 'فارم پڑھیں',
    'product_form.product_name': 'پروڈکٹ کا نام *',
    'product_form.product_name_ur': 'پروڈکٹ کا نام (اردو)',
    'product_form.type': 'قسم *',
    'product_form.subtype': 'ذیلی قسم',
    'product_form.active_ingredient': 'مؤثر اجزاء',
    'product_form.mode_of_action': 'طریقہ اثر',
    'product_form.target_pests': 'ہدف کیڑے',
    'product_form.target_pests_insecticide': 'کیڑے مارنے کی صلاحیت',
    'product_form.target_pests_herbicide': 'جڑی بوٹیوں کو مارنے کی صلاحیت',
    'product_form.target_pests_fungicide': 'بیماری پر قابو پانے کی صلاحیت',
    'product_form.target_pests_other': 'ہدف کیڑے',
    'product_form.applicable_crops': 'قابل اطلاق فصلیں',
    'product_form.application_method': 'استعمال کا طریقہ',
    'product_form.dosage': 'مقدار',
    'product_form.safety_info': 'حفاظتی معلومات',
    'product_form.manufacturer': 'صنعت کار',
    'product_form.submit_create': 'پروڈکٹ بنائیں',
    'product_form.submit_update': 'پروڈکٹ اپ ڈیٹ کریں',
    'product_form.submit_creating': 'بنایا جا رہا ہے...',
    'product_form.submit_updating': 'اپ ڈیٹ ہو رہا ہے...',
    'product_form.select_type_placeholder': 'قسم منتخب کریں',
    'product_form.select_subtype_placeholder': '{type} ذیلی قسم منتخب کریں',
    'product_form.select_pests_placeholder': 'کیڑے منتخب کریں...',
    'product_form.select_crops_placeholder': 'فصلیں منتخب کریں...',
    'product_form.dosage_placeholder': 'مثال: 2 ملی لیٹر/لیٹر',

    // Pests
    'pests.title': 'کیڑے',
    'pests.description': 'کیڑوں کا ڈیٹا بیس منظم کریں',
    'pests.add_new': '+ نیا کیڑا شامل کریں',
    'pests.table.scientific_name': 'سائنسی نام',
    'pests.table.common_name_en': 'عام نام (انگریزی)',
    'pests.table.common_name_ur': 'عام نام (اردو)',
    'pests.table.category': 'زمرہ',
    'pests.table.actions': 'اعمال',
    'pests.no_pests': 'کوئی کیڑے نہیں ملے',
    'pests.edit': 'ترمیم',

    'pest_form.title_new': 'نیا کیڑا شامل کریں',
    'pest_form.title_edit': 'کیڑے میں ترمیم کریں',
    'pest_form.scientific_name': 'سائنسی نام *',
    'pest_form.common_name_en': 'عام نام (انگریزی)',
    'pest_form.common_name_ur': 'عام نام (اردو)',
    'pest_form.category': 'زمرہ',
    'pest_form.category_placeholder': 'زمرہ منتخب کریں',
    'pest_form.submit_create': 'کیڑا بنائیں',
    'pest_form.submit_update': 'کیڑا اپ ڈیٹ کریں',
    'pest_form.submit_creating': 'بنایا جا رہا ہے...',
    'pest_form.submit_updating': 'اپ ڈیٹ ہو رہا ہے...',

    // Crops
    'crops.title': 'فصلیں',
    'crops.description': 'فصلوں کا ڈیٹا بیس منظم کریں',
    'crops.add_new': '+ نئی فصل شامل کریں',
    'crops.table.name': 'نام (انگریزی)',
    'crops.table.name_ur': 'نام (اردو)',
    'crops.table.common_name_en': 'عام نام (انگریزی)',
    'crops.table.category': 'زمرہ',
    'crops.table.actions': 'اعمال',
    'crops.no_crops': 'کوئی فصلیں نہیں ملی',
    'crops.edit': 'ترمیم',

    'crop_form.title_new': 'نئی فصل شامل کریں',
    'crop_form.title_edit': 'فصل میں ترمیم کریں',
    'crop_form.name': 'نام (انگریزی) *',
    'crop_form.name_ur': 'نام (اردو)',
    'crop_form.common_name_en': 'عام نام (انگریزی)',
    'crop_form.category': 'زمرہ',
    'crop_form.category_placeholder': 'زمرہ منتخب کریں',
    'crop_form.submit_create': 'فصل بنائیں',
    'crop_form.submit_update': 'فصل اپ ڈیٹ کریں',
    'crop_form.submit_creating': 'بنایا جا رہا ہے...',
    'crop_form.submit_updating': 'اپ ڈیٹ ہو رہا ہے...',

    // Advisories
    'advisories.title': 'مشورے',
    'advisories.description': 'کیڑوں کے مشوروں کا نظم کریں',
    'advisories.add_new': '+ نیا مشورہ شامل کریں',
    'advisories.table.pest': 'کیڑا',
    'advisories.table.title': 'عنوان (انگریزی)',
    'advisories.table.title_ur': 'عنوان (اردو)',
    'advisories.table.actions': 'اعمال',
    'advisories.no_advisories': 'کوئی مشورے نہیں ملے',
    'advisories.edit': 'ترمیم',

    'advisory_form.title_new': 'نیا مشورہ شامل کریں',
    'advisory_form.title_edit': 'مشورے میں ترمیم کریں',
    'advisory_form.select_pest': 'کیڑا منتخب کریں *',
    'advisory_form.select_pest_placeholder': 'کیڑا چنیں',
    'advisory_form.title': 'عنوان (انگریزی) *',
    'advisory_form.title_ur': 'عنوان (اردو)',
    'advisory_form.description': 'تفصیل (انگریزی)',
    'advisory_form.description_ur': 'تفصیل (اردو)',
    'advisory_form.chemical_control': 'کیمیائی کنٹرول (انگریزی)',
    'advisory_form.chemical_control_ur': 'کیمیائی کنٹرول (اردو)',
    'advisory_form.cultural_control': 'ثقافتی کنٹرول (انگریزی)',
    'advisory_form.cultural_control_ur': 'ثقافتی کنٹرول (اردو)',
    'advisory_form.biological_control': 'حیاتیاتی کنٹرول (انگریزی)',
    'advisory_form.biological_control_ur': 'حیاتیاتی کنٹرول (اردو)',
    'advisory_form.recommended_products': 'تجویز کردہ مصنوعات',
    'advisory_form.select_products': 'شامل کرنے کے لیے مصنوعات منتخب کریں',
    'advisory_form.submit_create': 'مشورہ بنائیں',
    'advisory_form.submit_update': 'مشورہ اپ ڈیٹ کریں',
    'advisory_form.submit_creating': 'بنایا جا رہا ہے...',
    'advisory_form.submit_updating': 'اپ ڈیٹ ہو رہا ہے...',
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


