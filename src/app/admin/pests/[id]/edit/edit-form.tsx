'use client'

export function EditPestForm({ pest, updatePest, error }: { pest: any; updatePest: (formData: FormData) => void; error?: string }) {
  return (
    <form action={updatePest} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Scientific Name
        </label>
        <input
          type="text"
          name="scientific_name"
          defaultValue={pest.scientific_name}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Common Name
        </label>
        <input
          type="text"
          name="common_name"
          defaultValue={pest.common_name}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          name="category"
          defaultValue={pest.category}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        >
          <option value="insect">Insect</option>
          <option value="fungus">Fungus</option>
          <option value="bacteria">Bacteria</option>
          <option value="virus">Virus</option>
          <option value="weed">Weed</option>
        </select>
      </div>
      <div className="flex gap-4">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Update
        </button>
        <a
          href="/admin/pests"
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}
