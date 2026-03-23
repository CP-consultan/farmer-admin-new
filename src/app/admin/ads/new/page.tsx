import { LanguageProvider } from '@/contexts/language-context'
import ClientOnly from '@/components/client-only'
import AdForm from './ad-form'

export default function NewAdPage() {
  return (
    <LanguageProvider>
      <ClientOnly>
        <AdForm />
      </ClientOnly>
    </LanguageProvider>
  )
}
