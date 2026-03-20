'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Papa from 'papaparse'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Upload, CheckCircle, XCircle, FileText } from 'lucide-react'

export default function ProductUploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string; count?: number } | null>(null)
  const [preview, setPreview] = useState<any[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setResult(null)

    // Parse CSV for preview
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setPreview(results.data.slice(0, 5)) // show first 5 rows
      },
      error: (error) => {
        setResult({ success: false, message: `CSV parse error: ${error.message}` })
      }
    })
  }

  const handleUpload = async () => {
    if (!file) {
      setResult({ success: false, message: 'Please select a file first.' })
      return
    }

    setUploading(true)
    setResult(null)

    // Parse full CSV
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const data = results.data
        if (data.length === 0) {
          setResult({ success: false, message: 'CSV file is empty.' })
          setUploading(false)
          return
        }

        // Validate required columns (adjust as needed)
        const requiredColumns = ['name', 'type']
        const firstRow = data[0]
        const missing = requiredColumns.filter(col => !(col in firstRow))
        if (missing.length) {
          setResult({ success: false, message: `Missing required columns: ${missing.join(', ')}` })
          setUploading(false)
          return
        }

        try {
          const response = await fetch('/api/products/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ products: data })
          })
          const resultData = await response.json()
          if (!response.ok) throw new Error(resultData.error || 'Upload failed')
          setResult({ success: true, message: resultData.message, count: resultData.count })
          // Optionally redirect after short delay
          setTimeout(() => router.push('/admin/products'), 2000)
        } catch (error: any) {
          setResult({ success: false, message: error.message })
        } finally {
          setUploading(false)
        }
      },
      error: (error) => {
        setResult({ success: false, message: `CSV parse error: ${error.message}` })
        setUploading(false)
      }
    })
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Product Templates
          </CardTitle>
          <CardDescription>
            Upload a CSV file with product information. The first row must contain column headers.
            Required: <code className="bg-muted px-1 rounded">name</code>, <code>type</code> (pesticide/fertilizer).
            Optional: sub_type, active_ingredient, mode_of_action, application_method, dosage, safety_info, manufacturer, name_ur, active_ingredient_ur, mode_of_action_ur, etc.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              Drag and drop your CSV file here, or click to browse
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <Button variant="outline" asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                Select CSV File
              </label>
            </Button>
            {file && (
              <p className="text-xs mt-2 text-muted-foreground">
                Selected: {file.name}
              </p>
            )}
          </div>

          {preview.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Preview (first 5 rows)</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border">
                  <thead>
                    <tr className="bg-muted">
                      {Object.keys(preview[0] || {}).map(key => (
                        <th key={key} className="p-2 border text-left">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, idx) => (
                      <tr key={idx}>
                        {Object.values(row).map((val: any, i) => (
                          <td key={i} className="p-2 border">{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {result && (
            <Alert variant={result.success ? 'default' : 'destructive'}>
              <div className="flex items-center gap-2">
                {result.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                <AlertDescription>{result.message}</AlertDescription>
              </div>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full"
          >
            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            {uploading ? 'Importing...' : 'Import Products'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
