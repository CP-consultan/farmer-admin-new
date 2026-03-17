import { Suspense } from 'react'
import ImportForm from './import-form'

export default function ImportPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">CSV Import</h1>

      {/* Template Download Section */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Download Templates</h2>
        <p className="text-sm text-gray-600 mb-4">
          Download the appropriate template, fill it with your data, and upload it below.
        </p>
        <div className="flex gap-4">
          <a
            href="/pests_template.csv"
            download
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Pests Template (CSV)
          </a>
          <a
            href="/advisories_template.csv"
            download
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Advisories Template (CSV)
          </a>
        </div>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <ImportForm />
      </Suspense>
    </div>
  )
}
