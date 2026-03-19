import { NextResponse } from 'next/server'
import translate from 'google-translate-api-x'

export async function POST(request: Request) {
  try {
    const { text } = await request.json()
    
    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    const result = await translate(text, { to: 'ur', from: 'en' })
    
    return NextResponse.json({ translatedText: result.text })
  } catch (error: any) {
    console.error('Translation error:', error)
    return NextResponse.json({ error: error.message || 'Translation failed' }, { status: 500 })
  }
}
