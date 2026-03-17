'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ImportForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const error = searchParams.get('error')
  const errors = searchParams.get('errors')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedFile) return

    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)

    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Import failed')
      }

      // Build query string for results
      const params = new URLSearchParams()
      params.set('message', result.message)
      if (result.errors.length > 0) {
        params.set('errors', encodeURIComponent(result.errors.join('\n')))
      }
      router.push(`/admin/import?${params.toString()}`)
    } catch (err: any) {
      router.push(`/admin/import?error=${encodeURIComponent(err.message)}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {(message || error) && (
        <div className={`p-4 rounded ${error ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700'}`}>
          <p>{message || error}</p>
          {errors && <pre className="mt-2 text-sm whitespace-pre-wrap">{errors}</pre>}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Data Type</label>
          <select
            name="type"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="">Select type</option>
            <option value="pests">Pests</option>
            <option value="advisories">Advisories</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">CSV File</label>
          <input
            type="file"
            name="file"
            accept=".csv"
            required
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="mt-1 block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>
        <button
          type="submit"
          disabled={!selectedFile || isSubmitting}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Uploading...' : 'Upload and Import'}
        </button>
      </form>
    </div>
  )
}
