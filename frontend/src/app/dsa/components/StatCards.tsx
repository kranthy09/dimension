'use client'

import { useState } from 'react'
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

// ── Weekly Performance Chart ──────────────────────────────────────────────────

interface WeekPoint {
  week_start: string
  label: string
  total: number
}

type RangeWeeks = 4 | 8 | 12

// SVG layout constants
const W = 420
const H = 130
const PAD = { top: 22, right: 14, bottom: 34, left: 28 }
const PLOT_W = W - PAD.left - PAD.right  // 378
const PLOT_H = H - PAD.top - PAD.bottom  // 74

function toX(i: number, n: number): number {
  return PAD.left + (n > 1 ? (i * PLOT_W) / (n - 1) : PLOT_W / 2)
}

function toY(v: number, maxVal: number): number {
  return PAD.top + PLOT_H - (v / maxVal) * PLOT_H
}

function niceMax(raw: number): number {
  if (raw <= 0) return 4
  if (raw <= 4) return raw
  return Math.ceil(raw / 2) * 2
}

function WeeklyChart({ data }: { data: WeekPoint[] }) {
  const [range, setRange] = useState<RangeWeeks>(4)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const visible = data.slice(-range)
  const n = visible.length
  const maxVal = niceMax(Math.max(...visible.map((d) => d.total)))
  const allZero = visible.every((d) => d.total === 0)

  // Y axis ticks: 0 / 50% / 100% of maxVal
  const yTicks = [0, 0.5, 1].map((f) => ({
    y: PAD.top + PLOT_H - f * PLOT_H,
    label: Math.round(f * maxVal),
  }))

  // Polyline and area polygon
  const pts = visible.map((d, i) => ({
    x: toX(i, n),
    y: toY(d.total, maxVal),
  }))
  const linePoints = pts.map((p) => `${p.x},${p.y}`).join(' ')
  const areaPoints = [
    `${pts[0].x},${PAD.top + PLOT_H}`,
    ...pts.map((p) => `${p.x},${p.y}`),
    `${pts[n - 1].x},${PAD.top + PLOT_H}`,
  ].join(' ')

  return (
    <div>
      {/* Header row with range filter pills */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4
            className="text-sm font-semibold"
            style={{ color: 'var(--text-primary)' }}
          >
            Weekly Performance
          </h4>
          <p
            className="text-[10px] mt-0.5"
            style={{ color: 'var(--text-muted)' }}
          >
            problems solved / week
          </p>
        </div>
        <div className="flex gap-1">
          {([4, 8, 12] as const).map((w) => (
            <button
              key={w}
              onClick={() => setRange(w)}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md transition-colors"
              style={{
                background: range === w ? '#f97316' : 'var(--bg-primary)',
                color: range === w ? '#fff' : 'var(--text-muted)',
                border: `1px solid ${range === w ? '#f97316' : 'var(--border)'}`,
              }}
            >
              {w}W
            </button>
          ))}
        </div>
      </div>

      {/* SVG chart */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ overflow: 'visible', display: 'block' }}
        aria-label="Weekly problems solved"
      >
        <defs>
          <linearGradient
            id="wperf-area"
            x1="0" y1="0" x2="0" y2="1"
          >
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Y-axis gridlines + labels */}
        {yTicks.map(({ y, label }, i) => (
          <g key={i}>
            <line
              x1={PAD.left} y1={y}
              x2={W - PAD.right} y2={y}
              stroke="var(--border)"
              strokeWidth={0.5}
              strokeDasharray={label === 0 ? undefined : '3 3'}
            />
            <text
              x={PAD.left - 5} y={y + 3.5}
              textAnchor="end"
              fontSize={8}
              fill="var(--text-muted)"
            >
              {label}
            </text>
          </g>
        ))}

        {/* Area fill */}
        {!allZero && n > 1 && (
          <polygon points={areaPoints} fill="url(#wperf-area)" />
        )}

        {/* Line */}
        {!allZero && n > 1 && (
          <polyline
            points={linePoints}
            fill="none"
            stroke="#f97316"
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* X-axis week labels */}
        {visible.map((d, i) => {
          // Skip odd indices when ≥8 weeks to prevent overlap
          if (range >= 8 && i % 2 !== 0) return null
          return (
            <text
              key={i}
              x={toX(i, n)}
              y={H - 4}
              textAnchor="middle"
              fontSize={8.5}
              fill="var(--text-muted)"
            >
              {d.label}
            </text>
          )
        })}

        {/* Interactive markers + tooltips */}
        {visible.map((d, i) => {
          const x = toX(i, n)
          const y = toY(d.total, maxVal)
          const hovered = hoveredIdx === i

          // Clamp tooltip so it never clips outside the plot area
          const tipW = 44
          const rawTx = x - tipW / 2
          const tx = Math.max(PAD.left, Math.min(rawTx, W - PAD.right - tipW))
          const ty = y - 30

          return (
            <g
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{ cursor: 'default' }}
            >
              {/* Invisible enlarged hit area */}
              <circle cx={x} cy={y} r={12} fill="transparent" />

              {/* Outer glow ring on hover */}
              {hovered && (
                <circle
                  cx={x} cy={y} r={7}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth={1}
                  strokeOpacity={0.35}
                />
              )}

              {/* Marker */}
              <circle
                cx={x} cy={y}
                r={hovered ? 4.5 : 3}
                fill={d.total === 0 ? 'var(--bg-secondary)' : '#f97316'}
                stroke="#f97316"
                strokeWidth={1.5}
              />

              {/* Tooltip bubble */}
              {hovered && (
                <>
                  <rect
                    x={tx} y={ty}
                    width={tipW} height={22}
                    rx={4}
                    fill="var(--bg-primary)"
                    stroke="var(--border)"
                    strokeWidth={0.5}
                  />
                  <text
                    x={tx + tipW / 2} y={ty + 14}
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight={700}
                    fill="var(--text-primary)"
                  >
                    {d.total}
                  </text>
                </>
              )}
            </g>
          )
        })}
      </svg>

      {allZero && (
        <p
          className="text-center text-[11px] -mt-1"
          style={{ color: 'var(--text-muted)' }}
        >
          No activity in selected range
        </p>
      )}
    </div>
  )
}

// ── StatCards ─────────────────────────────────────────────────────────────────

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
        <StatCard
          label="Today"
          value={stats.today}
          accent="var(--accent-primary)"
        />
        <StatCard
          label="This Week"
          value={stats.this_week}
          accent="var(--accent-primary)"
        />
        <StatCard label="Easy" value={stats.difficulty.easy} accent="#22c55e" />
        <StatCard
          label="Medium"
          value={stats.difficulty.medium}
          accent="#f59e0b"
        />
        <StatCard
          label="Hard"
          value={stats.difficulty.hard}
          accent="#ef4444"
        />
      </div>

      {stats.weekly_performance?.length > 0 && (
        <div
          className="mt-5 pt-4 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <WeeklyChart data={stats.weekly_performance} />
        </div>
      )}
    </div>
  )
}
