'use client'

import { Button } from '@/components/ui/button'
import { Volume2 } from 'lucide-react'
import { useState, useEffect } from 'react'

export function SpeakButton({ text }: { text: string }) {
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

  const speak = () => {
    if (!isSupported) {
      alert('Your browser does not support text-to-speech.')
      return
    }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)

    const urduVoice = voices.find(voice => voice.lang.startsWith('ur'))
    if (urduVoice) {
      utterance.voice = urduVoice
    } else {
      console.log('No Urdu voice found, using default voice.')
    }

    window.speechSynthesis.speak(utterance)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={speak}
      disabled={!isSupported}
      title="Read aloud"
    >
      <Volume2 className="h-4 w-4" />
    </Button>
  )
}
