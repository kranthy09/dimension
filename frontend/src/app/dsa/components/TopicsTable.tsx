'use client'

interface TopicStat {
  name: string
  count: number
  last_file: string
  last_updated: string
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

export default function TopicsTable({ topics }: { topics: TopicStat[] }) {
  if (topics.length === 0) return null

  return (
    <div
      className="rounded-xl p-5 border"
      style={{
        background: 'var(--bg-secondary)',
        borderColor: 'var(--border)',
      }}
    >
      <h3
        className="text-sm font-semibold mb-4"
        style={{ color: 'var(--text-primary)' }}
      >
        Topics
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr
              className="border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <th
                className="text-left py-2 pr-4 text-xs font-medium uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                Topic
              </th>
              <th
                className="text-right py-2 px-4 text-xs font-medium uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                Problems
              </th>
              <th
                className="text-right py-2 pl-4 text-xs font-medium uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}
              >
                Last Updated
              </th>
            </tr>
          </thead>
          <tbody>
            {topics.map((topic) => (
              <tr
                key={topic.name}
                className="border-b last:border-b-0"
                style={{ borderColor: 'var(--border)' }}
              >
                <td
                  className="py-2.5 pr-4 capitalize"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {topic.name.replace(/-/g, ' ')}
                </td>
                <td
                  className="py-2.5 px-4 text-right font-mono font-semibold"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  {topic.count}
                </td>
                <td
                  className="py-2.5 pl-4 text-right"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <span className="text-xs">
                    {timeAgo(topic.last_updated)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
