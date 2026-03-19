import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query || query.length < 2) {
    return NextResponse.json([])
  }

  try {
    // Use PubChem autocomplete API (no API key required)
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound/${encodeURIComponent(query)}/json`
    const response = await fetch(url)
    const data = await response.json()

    if (!data?.dictionary_terms?.compound) {
      return NextResponse.json([])
    }

    // Extract compound names and limit to 20 results
    const names = data.dictionary_terms.compound.slice(0, 20)

    // Return in the format expected by ActiveIngredientInput
    return NextResponse.json(names.map((name: string) => ({ name })))
  } catch (error) {
    console.error('PubChem fetch error:', error)
    return NextResponse.json([])
  }
}
