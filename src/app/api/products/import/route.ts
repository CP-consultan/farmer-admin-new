import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
    let products
    try {
      const body = await request.json()
      products = body.products
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON. Please check your request body.' },
        { status: 400 }
      )
    }

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: 'No products provided or invalid format' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    let inserted = 0
    let updated = 0

    for (const prod of products) {
      if (!prod.name || !prod.type) {
        continue
      }

      const { data: existing, error: selectError } = await supabase
        .from('agrochemicals')
        .select('id')
        .ilike('name', prod.name)
        .maybeSingle()

      if (selectError) {
        console.error('Error checking existing product:', selectError)
        continue
      }

      const productData = {
        name: prod.name,
        name_ur: prod.name_ur || null,
        type: prod.type,
        sub_type: prod.sub_type || null,
        active_ingredient: prod.active_ingredient || null,
        active_ingredient_ur: prod.active_ingredient_ur || null,
        mode_of_action: prod.mode_of_action || null,
        mode_of_action_ur: prod.mode_of_action_ur || null,
        application_method: prod.application_method || null,
        dosage: prod.dosage || null,
        safety_info: prod.safety_info || null,
        manufacturer: prod.manufacturer || null,
      }

      if (existing) {
        const { error: updateError } = await supabase
          .from('agrochemicals')
          .update(productData)
          .eq('id', existing.id)
        if (!updateError) updated++
        else console.error('Update error:', updateError)
      } else {
        const { error: insertError } = await supabase
          .from('agrochemicals')
          .insert([productData])
        if (!insertError) inserted++
        else console.error('Insert error:', insertError)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${inserted} new, updated ${updated} products.`,
      count: inserted + updated
    })
  } catch (error: any) {
    console.error('Import API error:', error)
    return NextResponse.json(
      { error: error.message || 'Import failed' },
      { status: 500 }
    )
  }
}
