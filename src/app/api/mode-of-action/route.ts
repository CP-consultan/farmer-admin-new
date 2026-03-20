import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const ingredient = searchParams.get('ingredient')

  if (!ingredient) {
    return NextResponse.json({ error: 'Missing ingredient' }, { status: 400 })
  }

  const supabase = await createClient()

  // Search for existing products with this active ingredient (case‑insensitive)
  const { data, error } = await supabase
    .from('agrochemicals')
    .select('mode_of_action')
    .ilike('active_ingredient', `%${ingredient}%`)
    .limit(1)  // just need one sample
    .maybeSingle()

  if (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Database lookup failed' }, { status: 500 })
  }

  if (data?.mode_of_action) {
    return NextResponse.json({ mode_of_action: data.mode_of_action })
  }

  // Not found – return a helpful placeholder
  return NextResponse.json({
    mode_of_action: `[Mode of action for "${ingredient}" not yet added. Save this product to store it for future use.]`
  })
}
