'use client'

import { useState, useEffect } from 'react'
import { fetchStats, type DsaStats } from '@/lib/github'
import RecentFiles from './components/RecentFiles'
import StatCards from './components/StatCards'
import ActivityHeatmap from './components/ActivityHeatmap'
import TopicsTable from './components/TopicsTable'

export default function DSAPage() {
  const [stats, setStats] = useState<DsaStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await fetchStats()
        console.log(data)
        setStats(data)
        setError(null)
      } catch {
        setError('Failed to load dashboard stats.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div
          className="animate-spin rounded-full h-10 w-10 border-b-2"
          style={{ borderColor: 'var(--accent-primary)' }}
        />
        <p className="text-sm animate-pulse" style={{ color: 'var(--text-muted)' }}>
          Loading dashboard...
        </p>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <svg
            className="w-16 h-16 mx-auto mb-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{ color: 'var(--text-muted)' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            {error || 'No data available'}
          </h2>
          <button
            onClick={() => window.location.reload()}
            className="text-sm font-medium"
            style={{ color: 'var(--accent-primary)' }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Recent Files */}
      <RecentFiles recent={stats.recent} />

      {/* Activity Heatmap */}
      <ActivityHeatmap activity={stats.activity} />

      {/* Topics Table + Metrics side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopicsTable topics={stats.topics} />
        <StatCards stats={stats} />
      </div>
    </div>
  )
}
