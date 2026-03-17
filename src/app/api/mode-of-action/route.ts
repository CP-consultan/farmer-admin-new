import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const ingredient = searchParams.get('ingredient')

  if (!ingredient) {
    return NextResponse.json({ error: 'Missing ingredient parameter' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('mode_of_action_lookup')
    .select('mode_of_action, chemical_class, main_group, target_site, source')
    .ilike('active_ingredient', ingredient)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data) {
    // Try fuzzy match - partial search
    const { data: fuzzyData } = await supabase
      .from('mode_of_action_lookup')
      .select('mode_of_action, chemical_class, main_group, target_site, source')
      .ilike('active_ingredient', `%${ingredient}%`)
      .limit(1)
      .maybeSingle()

    if (fuzzyData) {
      return NextResponse.json(fuzzyData)
    }
    return NextResponse.json({ mode_of_action: null, message: 'Mode of action not found' })
  }

  return NextResponse.json(data)
}
