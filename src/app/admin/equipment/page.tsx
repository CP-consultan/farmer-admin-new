import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { DeleteButton } from './delete-button'

export default async function EquipmentPage() {
  const supabase = await createClient()
  const { data: equipment, error } = await supabase
    .from('equipment')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching equipment:', error)
    return <div className="p-8 text-red-600">Failed to load equipment.</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Equipment Marketplace</h1>
        <Link
          href="/admin/equipment/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + Add Equipment
        </Link>
      </div>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {equipment.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.price}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{item.user_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/admin/equipment/${item.id}/edit`} className="text-blue-600 mr-4">Edit</Link>
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
