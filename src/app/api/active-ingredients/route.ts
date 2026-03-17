import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  const category = searchParams.get('category')

  if (!query) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 })
  }

  const supabase = await createClient()
  let dbQuery = supabase
    .from('active_ingredients')
    .select('name')
    .ilike('name', `%${query}%`)
    .order('name')
    .limit(10)

  if (category) {
    dbQuery = dbQuery.eq('category', category)
  }

  const { data, error } = await dbQuery

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
