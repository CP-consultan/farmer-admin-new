'use client'

export default function LaborForm({ action, initialData = {} }: { action: (formData: FormData) => void; initialData?: any }) {
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Worker Name</label>
        <input type="text" name="name" defaultValue={initialData.name || ''} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Daily Rate</label>
        <input type="text" name="daily_rate" defaultValue={initialData.daily_rate || ''} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Work Type</label>
        <input type="text" name="work_type" defaultValue={initialData.work_type || ''} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Experience</label>
        <input type="text" name="experience" defaultValue={initialData.experience || ''} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">User ID</label>
        <input type="text" name="user_id" defaultValue={initialData.user_id || ''} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
      </div>
      <div className="flex gap-4">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          {initialData.id ? 'Update' : 'Create'}
        </button>
        <a href="/admin/labor" className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">Cancel</a>
      </div>
    </form>
  )
}
