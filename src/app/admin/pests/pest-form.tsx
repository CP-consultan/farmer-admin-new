'use client'

import { useState } from 'react'
import ScientificNameField from './scientific-name-field'

export default function PestForm({ action, initialData = {}, categorizedNames = {} }: {
  action: (formData: FormData) => void;
  initialData?: any;
  categorizedNames: Record<string, string[]>;
}) {
  const [category, setCategory] = useState(initialData.category || '')
  const [scientificName, setScientificName] = useState(initialData.scientific_name || '')
  const [commonNameEn, setCommonNameEn] = useState(initialData.common_name_en || '')
  const [commonNameUr, setCommonNameUr] = useState(initialData.common_name_ur || '')

  const filteredNames = category ? categorizedNames[category] || [] : []

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        >
          <option value="">Select category</option>
          <option value="insect">Insect</option>
          <option value="fungus">Fungus</option>
          <option value="bacteria">Bacteria</option>
          <option value="virus">Virus</option>
          <option value="weed">Weed</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Scientific Name
        </label>
        <ScientificNameField
          value={scientificName}
          onChange={setScientificName}
          onCommonNameFetched={setCommonNameEn}
        />
        <input type="hidden" name="scientific_name" value={scientificName} />
        <datalist id="scientificNames">
          {filteredNames.map((name, idx) => (
            <option key={idx} value={name} />
          ))}
        </datalist>
        {!category && (
          <p className="text-sm text-amber-600 mt-1">Please select a category first to see suggestions.</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Common Name (English)
        </label>
        <input
          type="text"
          name="common_name_en"
          value={commonNameEn}
          onChange={(e) => setCommonNameEn(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Common Name (Urdu)
        </label>
        <input
          type="text"
          name="common_name_ur"
          value={commonNameUr}
          onChange={(e) => setCommonNameUr(e.target.value)}
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
          href="/admin/pests"
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
        >
          Cancel
        </a>
      </div>
    </form>
  )
}
