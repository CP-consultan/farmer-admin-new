'use client'

export default function AdvisoryForm({ pests, action, initialData = {} }: { pests: any[]; action: (formData: FormData) => void; initialData?: any }) {
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Select Pest
        </label>
        <select
          name="pest_id"
          defaultValue={initialData.pest_id || ''}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        >
          <option value="">Choose a pest...</option>
          {pests.map(pest => (
            <option key={pest.id} value={pest.id}>
              {pest.scientific_name} ({pest.common_name})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Chemical Control
        </label>
        <textarea
          name="chemical_control"
          defaultValue={initialData.chemical_control || ''}
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Cultural Control
        </label>
        <textarea
          name="cultural_control"
          defaultValue={initialData.cultural_control || ''}
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Biological Control
        </label>
        <textarea
          name="biological_control"
          defaultValue={initialData.biological_control || ''}
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
      <div className="flex gap-4">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          {initialData.id ? 'Update' : 'Create'}
        </button>
        <a
          href="/admin/advisories"
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}
