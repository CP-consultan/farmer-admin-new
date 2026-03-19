import { NextResponse } from 'next/server'
import translate from 'google-translate-api-x'

export async function POST(request: Request) {
  try {
    const { text } = await request.json()
    
    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    const result = await translate(text, { to: 'ur', from: 'en' })
    
    // Safe access to the translated text
    const translatedText = (result as any).text
    
    if (!translatedText) {
      console.error('Unexpected translate result:', result)
      return NextResponse.json({ error: 'Translation failed: unexpected response' }, { status: 500 })
    }

    return NextResponse.json({ translatedText })
  } catch (error: any) {
    console.error('Translation error:', error)
    return NextResponse.json({ error: error.message || 'Translation failed' }, { status: 500 })
  }
}
