'use client'

import type { DsaStats } from '@/lib/github'

interface StatCardProps {
  label: string
  value: number
  accent?: string
  mono?: boolean
}

function StatCard({ label, value, accent, mono }: StatCardProps) {
  return (
    <div
      className="rounded-lg p-4 border transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: 'var(--bg-primary)',
        borderColor: 'var(--border)',
      }}
    >
      <p
        className="text-[10px] font-medium uppercase tracking-wider mb-1.5"
        style={{ color: 'var(--text-muted)' }}
      >
        {label}
      </p>
      <p
        className={`text-xl font-bold ${mono ? 'font-mono' : ''}`}
        style={{ color: accent || 'var(--text-primary)' }}
      >
        {value}
      </p>
    </div>
  )
}

export default function StatCards({ stats }: { stats: DsaStats }) {
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
        Metrics
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total Solved" value={stats.total_problems} />
        <StatCard label="Today" value={stats.today} accent="var(--accent-primary)" />
        <StatCard label="This Week" value={stats.this_week} accent="var(--accent-primary)" />
        <StatCard label="Streak" value={stats.current_streak} accent="#22c55e" mono />
        <StatCard label="Easy" value={stats.difficulty.easy} accent="#22c55e" />
        <StatCard label="Medium" value={stats.difficulty.medium} accent="#f59e0b" />
        <StatCard label="Hard" value={stats.difficulty.hard} accent="#ef4444" />
      </div>
    </div>
  )
}
