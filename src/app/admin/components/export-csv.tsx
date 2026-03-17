'use client'

export default function ExportCSV({ data, filename, headers }: { data: any[]; filename: string; headers: string[] }) {
  const exportToCSV = () => {
    if (!data || data.length === 0) {
      alert('No data to export')
      return
    }

    // Convert data to CSV
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={exportToCSV}
      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
    >
      Export CSV
    </button>
  )
}
