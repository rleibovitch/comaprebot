'use client'

import { useState, useEffect } from 'react'
import { Upload, FileText, BarChart3, Shield } from 'lucide-react'
import LoginForm from '@/components/LoginForm'
import UploadForm from '@/components/UploadForm'
import ComparisonResults from '@/components/ComparisonResults'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

interface ComparisonData {
  summary: string
  highlights: string[]
  week_number: number
  previous_week_number: number
  created_at: string
}

function Dashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<'upload' | 'results'>('upload')
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null)

  return (
    <div className="space-y-6">
      {/* User Info */}
      <div className="bg-white rounded-lg shadow-sm border border-horseradish-200 p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Welcome, {user?.clientId}
            </h2>
            <p className="text-sm text-gray-500">
              Upload your weekly reports and get AI-powered comparisons
            </p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-horseradish-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-horseradish-500 text-horseradish-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Upload Report
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'results'
                  ? 'border-horseradish-500 text-horseradish-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              View Results
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'upload' && (
            <UploadForm onUploadSuccess={() => setActiveTab('results')} />
          )}
          {activeTab === 'results' && (
            <ComparisonResults onDataLoaded={setComparisonData} />
          )}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <div className="min-h-screen">
        <LoginForm>
          <Dashboard />
        </LoginForm>
      </div>
    </AuthProvider>
  )
}
