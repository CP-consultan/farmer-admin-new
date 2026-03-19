'use client'

import { Button } from '@/components/ui/button'
import { Volume2 } from 'lucide-react'
import { useState, useEffect } from 'react'

interface ReadFormButtonProps {
  sections: { label: string; value: string }[]
}

export function ReadFormButton({ sections }: ReadFormButtonProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [isSupported, setIsSupported] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices()
        setVoices(availableVoices)
      }
      loadVoices()
      window.speechSynthesis.onvoiceschanged = loadVoices
    } else {
      setIsSupported(false)
    }
  }, [])

  const readForm = () => {
    if (!isSupported) {
      alert('Your browser does not support text-to-speech.')
      return
    }

    // Combine all sections into one text with pauses
    const text = sections
      .filter(s => s.value && s.value.trim() !== '')
      .map(s => `${s.label}: ${s.value}`)
      .join('. ')

    if (!text) {
      alert('No content to read.')
      return
    }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)

    const urduVoice = voices.find(voice => voice.lang.startsWith('ur'))
    if (urduVoice) {
      utterance.voice = urduVoice
    }

    window.speechSynthesis.speak(utterance)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={readForm}
      disabled={!isSupported}
      className="flex items-center gap-2"
    >
      <Volume2 className="h-4 w-4" />
      Read Form
    </Button>
  )
}
