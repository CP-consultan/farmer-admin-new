import { createClient } from '@/utils/supabase/server'

export default async function TestPestsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('pests').select('*')

  if (error) {
    return (
      <div style={{ padding: '2rem', color: 'red' }}>
        <h1>Error fetching pests</h1>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Pests Data</h1>
      <p>Count: {data.length}</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}
