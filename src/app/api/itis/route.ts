import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const scientificName = searchParams.get('name');

  if (!scientificName) {
    return NextResponse.json({ error: 'Missing name' }, { status: 400 });
  }

  try {
    const matchUrl = `https://api.gbif.org/v1/species/match?name=${encodeURIComponent(scientificName)}&verbose=true`;
    const matchRes = await fetch(matchUrl);
    const matchData = await matchRes.json();

    if (!matchData.usageKey) {
      return NextResponse.json({ error: 'No match found' }, { status: 404 });
    }

    const vernUrl = `https://api.gbif.org/v1/species/${matchData.usageKey}/vernacularNames`;
    const vernRes = await fetch(vernUrl);
    const vernData = await vernRes.json();

    const englishName = vernData.results?.find((n: any) => n.language === 'eng')?.vernacularName
      || vernData.results?.[0]?.vernacularName;

    return NextResponse.json({ commonName: englishName || null });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
