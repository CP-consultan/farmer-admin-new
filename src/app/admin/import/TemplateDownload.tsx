'use client'

export default function TemplateDownload() {
  const downloadPestsTemplate = () => {
    const headers = ['scientific_name', 'common_name', 'category']
    const sampleRow = ['Plutella xylostella', 'Diamondback Moth', 'insect']
    const csvContent = [
      headers.join(','),
      sampleRow.map(cell => `"${cell}"`).join(',')
    ].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pests_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadAdvisoriesTemplate = () => {
    const headers = ['pest_id', 'chemical_control', 'cultural_control', 'biological_control']
    const sampleRow = ['1', 'Spinosad 2ml/L', 'Crop rotation', 'Bacillus thuringiensis']
    const csvContent = [
      headers.join(','),
      sampleRow.map(cell => `"${cell}"`).join(',')
    ].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'advisories_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mb-6 flex gap-4">
      <button
        onClick={downloadPestsTemplate}
        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
      >
        Download Pests Template
      </button>
      <button
        onClick={downloadAdvisoriesTemplate}
        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
      >
        Download Advisories Template
      </button>
    </div>
  )
}
