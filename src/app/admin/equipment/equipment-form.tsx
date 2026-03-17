'use client'

export default function EquipmentForm({ action, initialData = {} }: { action: (formData: FormData) => void; initialData?: any }) {
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input type="text" name="title" defaultValue={initialData.title || ''} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Price</label>
        <input type="text" name="price" defaultValue={initialData.price || ''} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <input type="text" name="category" defaultValue={initialData.category || ''} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea name="description" defaultValue={initialData.description || ''} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">User ID</label>
        <input type="text" name="user_id" defaultValue={initialData.user_id || ''} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
      </div>
      <div className="flex gap-4">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          {initialData.id ? 'Update' : 'Create'}
        </button>
        <a href="/admin/equipment" className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">Cancel</a>
      </div>
    </form>
  )
}
