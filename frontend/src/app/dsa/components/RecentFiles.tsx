'use client'

import Link from 'next/link'

interface RecentFile {
  filename: string
  path: string
  difficulty: string
  tags: string[]
  committed_at: string
  folder: string
}

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string }> = {
  Easy: { bg: 'rgba(34, 197, 94, 0.12)', text: '#22c55e' },
  Medium: { bg: 'rgba(245, 158, 11, 0.12)', text: '#f59e0b' },
  Hard: { bg: 'rgba(239, 68, 68, 0.12)', text: '#ef4444' },
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return ''
  const now = new Date()
  const date = new Date(dateStr)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

export default function RecentFiles({ recent }: { recent: RecentFile[] }) {
  const files = recent.slice(0, 3)

  if (files.length === 0) return null

  return (
    <div>
      <h3
        className="text-sm font-semibold mb-3"
        style={{ color: 'var(--text-primary)' }}
      >
        Recent Files
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {files.map((file, idx) => {
          const diffColors = DIFFICULTY_COLORS[file.difficulty] || DIFFICULTY_COLORS.Medium
          const name = file.filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')

          return (
            <Link
              key={`${file.path}-${idx}`}
              href={`/dsa/${encodeURIComponent(file.path)}`}
              className="rounded-xl p-4 border transition-all duration-200 hover:-translate-y-0.5 block"
              style={{
                background: 'var(--bg-secondary)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span
                  className="text-sm font-semibold capitalize truncate"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {name}
                </span>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-semibold flex-shrink-0"
                  style={{
                    background: diffColors.bg,
                    color: diffColors.text,
                  }}
                >
                  {file.difficulty}
                </span>
              </div>

              <div className="flex items-center justify-between">
                {file.folder && (
                  <span
                    className="text-xs capitalize"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {file.folder.replace(/-/g, ' ')}
                  </span>
                )}
                <span
                  className="text-[11px]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {timeAgo(file.committed_at)}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
