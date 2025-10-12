"use client"

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react'
import { toast } from 'sonner'

interface FileUploadProps {
  onUploadComplete?: (analysis: any) => void
  onUploadStart?: () => void
}

export function FileUpload({ onUploadComplete, onUploadStart }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<any>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploading(true)
    setUploadProgress(0)
    setUploadError(null)
    onUploadStart?.()

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      
      if (result.success) {
        setUploadedFile(result.data)
        onUploadComplete?.(result.data.analysis)
        toast.success('File uploaded and analyzed successfully!')
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setUploadError(error instanceof Error ? error.message : 'Upload failed')
      toast.error('Failed to upload file')
    } finally {
      setUploading(false)
    }
  }, [onUploadComplete, onUploadStart])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'text/plain': ['.txt'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: uploading
  })

  const resetUpload = () => {
    setUploadedFile(null)
    setUploadError(null)
    setUploadProgress(0)
  }

  if (uploadedFile) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            File Uploaded Successfully
          </CardTitle>
          <CardDescription>
            Your file has been uploaded and analyzed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-600" />
              <span className="font-medium">{uploadedFile.originalName}</span>
            </div>
            
            {uploadedFile.analysis && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Rows:</span>
                  <span className="ml-2 font-medium">{uploadedFile.analysis.rows.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Columns:</span>
                  <span className="ml-2 font-medium">{uploadedFile.analysis.columns}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Size:</span>
                  <span className="ml-2 font-medium">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <span className="ml-2 font-medium text-green-600">Analyzed</span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={resetUpload} variant="outline" size="sm">
                Upload Another
              </Button>
              {uploadedFile.analysis && (
                <Button onClick={() => onUploadComplete?.(uploadedFile.analysis)} size="sm">
                  View Analysis
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Upload Dataset
        </CardTitle>
        <CardDescription>
          Upload a CSV, JSON, or Excel file to start your analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
            ${uploading ? 'pointer-events-none opacity-50' : 'hover:border-primary hover:bg-primary/5'}
          `}
        >
          <input {...getInputProps()} />
          
          {uploading ? (
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-6 w-6 text-primary animate-pulse" />
              </div>
              <div>
                <h3 className="font-medium">Uploading and analyzing...</h3>
                <p className="text-sm text-muted-foreground">This may take a moment</p>
              </div>
              <div className="w-full max-w-xs mx-auto">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">{uploadProgress}% complete</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">
                  {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  or click to browse files
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                Supports CSV, JSON, Excel files up to 10MB
              </div>
            </div>
          )}
        </div>

        {uploadError && (
          <Alert className="mt-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {uploadError}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
