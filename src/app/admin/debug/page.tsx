export default function DebugPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Environment Variables Debug</h1>
      <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ MISSING'}</p>
      <p>ANON KEY length: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0}</p>
    </div>
  )
}
