'use client'

import { useState, useEffect } from 'react'
import { BarChart3, RefreshCw, AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface ComparisonData {
  summary: string
  highlights: string[]
  week_number: number
  previous_week_number: number
  created_at: string
}

interface ComparisonResultsProps {
  onDataLoaded: (data: ComparisonData | null) => void
}

export default function ComparisonResults({ onDataLoaded }: ComparisonResultsProps) {
  const { user } = useAuth()
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [weekNumber, setWeekNumber] = useState('')

  const fetchComparison = async (weekNum?: number) => {
    if (!user) return

    setIsLoading(true)
    setError('')

    try {
      const week = weekNum || weekNumber
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/compare_reports?client_id=${user.clientId}&week_number=${week}`,
        {
          headers: {
            'Authorization': `Bearer ${user.token}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setComparisonData(data)
        onDataLoaded(data)
      } else if (response.status === 404) {
        setError('No comparison data found for this week. Make sure you have uploaded reports for both this week and the previous week.')
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Failed to fetch comparison data')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (weekNumber) {
      fetchComparison(parseInt(weekNumber))
    }
  }

  // Auto-fetch latest comparison on component mount
  useEffect(() => {
    fetchComparison()
  }, [user])

  const getTrendIcon = (highlight: string) => {
    if (highlight.toLowerCase().includes('increase') || highlight.toLowerCase().includes('up') || highlight.toLowerCase().includes('higher')) {
      return <TrendingUp className="h-4 w-4 text-green-500" />
    } else if (highlight.toLowerCase().includes('decrease') || highlight.toLowerCase().includes('down') || highlight.toLowerCase().includes('lower')) {
      return <TrendingDown className="h-4 w-4 text-red-500" />
    }
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Comparison Results</h3>
          <p className="text-sm text-gray-600">
            AI-powered analysis comparing consecutive weekly reports
          </p>
        </div>
        <button
          onClick={() => fetchComparison()}
          disabled={isLoading}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-4">
        <input
          type="number"
          min="1"
          value={weekNumber}
          onChange={(e) => setWeekNumber(e.target.value)}
          placeholder="Enter week number to compare"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-horseradish-500 focus:border-horseradish-500"
        />
        <button
          type="submit"
          disabled={!weekNumber || isLoading}
          className="px-4 py-2 bg-horseradish-600 text-white rounded-md hover:bg-horseradish-700 disabled:opacity-50"
        >
          Search
        </button>
      </form>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-horseradish-500"></div>
          <span className="ml-3 text-gray-600">Analyzing reports...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          {error}
        </div>
      )}

      {/* Results */}
      {comparisonData && !isLoading && (
        <div className="space-y-6">
          {/* Header Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Week {comparisonData.week_number} vs Week {comparisonData.previous_week_number}
                </h4>
                <p className="text-sm text-gray-500">
                  Generated on {new Date(comparisonData.created_at).toLocaleDateString()}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-horseradish-500" />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h5 className="text-md font-semibold text-gray-900 mb-3">Summary</h5>
            <p className="text-gray-700 leading-relaxed">{comparisonData.summary}</p>
          </div>

          {/* Highlights */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h5 className="text-md font-semibold text-gray-900 mb-4">Key Highlights</h5>
            <div className="space-y-3">
              {comparisonData.highlights.map((highlight, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  {getTrendIcon(highlight)}
                  <p className="text-sm text-gray-700 flex-1">{highlight}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!comparisonData && !isLoading && !error && (
        <div className="text-center py-12">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No comparison data</h3>
          <p className="mt-1 text-sm text-gray-500">
            Upload reports for consecutive weeks to see AI-powered comparisons.
          </p>
        </div>
      )}
    </div>
  )
}
