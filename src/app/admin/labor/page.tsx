import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { DeleteButton } from './delete-button'

export default async function LaborPage() {
  const supabase = await createClient()
  const { data: labor, error } = await supabase
    .from('labor')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching labor:', error)
    return <div className="p-8 text-red-600">Failed to load labor listings.</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Labor Marketplace</h1>
        <Link
          href="/admin/labor/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + Add Labor
        </Link>
      </div>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Daily Rate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Work Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {labor.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.daily_rate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.work_type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.experience}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.user_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/admin/labor/${item.id}/edit`} className="text-blue-600 mr-4">Edit</Link>
                  <DeleteButton id={item.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
