'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface UploadFormProps {
  onUploadSuccess: () => void
}

export default function UploadForm({ onUploadSuccess }: UploadFormProps) {
  const { user } = useAuth()
  const [weekNumber, setWeekNumber] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file)
      setUploadStatus('idle')
      setErrorMessage('')
    } else {
      setErrorMessage('Please select a valid PDF file')
      setUploadStatus('error')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  })

  const handleUpload = async () => {
    if (!selectedFile || !weekNumber || !user) return

    setIsUploading(true)
    setUploadStatus('idle')
    setErrorMessage('')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('client_id', user.clientId)
      formData.append('week_number', weekNumber)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload_report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
        body: formData,
      })

      if (response.ok) {
        setUploadStatus('success')
        setSelectedFile(null)
        setWeekNumber('')
        setTimeout(() => {
          onUploadSuccess()
        }, 1500)
      } else {
        const errorData = await response.json()
        setErrorMessage(errorData.detail || 'Upload failed')
        setUploadStatus('error')
      }
    } catch (error) {
      setErrorMessage('Network error. Please try again.')
      setUploadStatus('error')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Weekly Report</h3>
        <p className="text-sm text-gray-600">
          Upload your weekly PDF report to get AI-powered comparison with the previous week.
        </p>
      </div>

      {/* Week Number Input */}
      <div>
        <label htmlFor="weekNumber" className="block text-sm font-medium text-gray-700 mb-2">
          Week Number
        </label>
        <input
          id="weekNumber"
          type="number"
          min="1"
          value={weekNumber}
          onChange={(e) => setWeekNumber(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-horseradish-500 focus:border-horseradish-500"
          placeholder="e.g., 15"
        />
      </div>

      {/* File Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-horseradish-400 bg-horseradish-50'
            : selectedFile
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 hover:border-horseradish-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        {selectedFile ? (
          <div className="space-y-2">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <p className="text-sm font-medium text-green-700">{selectedFile.name}</p>
            <p className="text-xs text-green-600">Ready to upload</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="text-sm text-gray-600">
              <p className="font-medium">
                {isDragActive ? 'Drop the PDF here' : 'Drag & drop a PDF file here'}
              </p>
              <p>or click to select a file</p>
            </div>
            <p className="text-xs text-gray-500">Only PDF files are accepted</p>
          </div>
        )}
      </div>

      {/* Status Messages */}
      {uploadStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
          <CheckCircle className="h-4 w-4 mr-2" />
          Report uploaded successfully! Processing comparison...
        </div>
      )}

      {uploadStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          {errorMessage}
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!selectedFile || !weekNumber || isUploading}
        className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-horseradish-600 hover:bg-horseradish-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-horseradish-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Uploading...
          </>
        ) : (
          <>
            <FileText className="h-4 w-4 mr-2" />
            Upload Report
          </>
        )}
      </button>
    </div>
  )
}
