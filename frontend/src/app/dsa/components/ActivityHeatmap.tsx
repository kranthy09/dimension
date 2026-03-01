'use client'

import { useMemo } from 'react'

interface ActivityDay {
  date: string
  count: number
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Mon', '', 'Wed', '', 'Fri', '', '']

function getIntensity(count: number, max: number): number {
  if (count === 0) return 0
  if (max === 0) return 0
  const ratio = count / max
  if (ratio <= 0.25) return 1
  if (ratio <= 0.5) return 2
  if (ratio <= 0.75) return 3
  return 4
}

const INTENSITY_COLORS: Record<number, { light: string; dark: string }> = {
  0: { light: '#f0ece8', dark: '#2a2520' },
  1: { light: '#fde6d0', dark: '#4a2f1a' },
  2: { light: '#fdba74', dark: '#9a4f1a' },
  3: { light: '#f97316', dark: '#d4691a' },
  4: { light: '#c2410c', dark: '#f97316' },
}

export default function ActivityHeatmap({ activity }: { activity: ActivityDay[] }) {
  const { weeks, monthLabels, maxCount } = useMemo(() => {
    const activityMap = new Map<string, number>()
    for (const a of activity) {
      activityMap.set(a.date, a.count)
    }

    const today = new Date()
    const totalDays = 100
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - totalDays + 1)

    // Adjust start to Monday (Monday-based week: Mon=0 ... Sun=6)
    const startDay = startDate.getDay()
    const mondayOffset = (startDay + 6) % 7  // days to subtract to reach Monday
    if (mondayOffset !== 0) {
      startDate.setDate(startDate.getDate() - mondayOffset)
    }

    const weeks: { date: string; count: number; day: number }[][] = []
    let currentWeek: { date: string; count: number; day: number }[] = []
    const monthLabelsMap = new Map<number, string>()

    const current = new Date(startDate)
    let maxCount = 1  // minimum to avoid division by zero; real scale driven by actual data
    let weekIndex = 0

    while (current <= today) {
      const dateStr = current.toISOString().split('T')[0]
      const count = activityMap.get(dateStr) || 0
      if (count > maxCount) maxCount = count

      if (current.getDate() <= 7 && current.getDay() === 1) {  // first Monday of month
        monthLabelsMap.set(weekIndex, MONTHS[current.getMonth()])
      }

      const dayMon = (current.getDay() + 6) % 7  // 0=Mon, 1=Tue, ..., 6=Sun
      currentWeek.push({
        date: dateStr,
        count,
        day: dayMon,
      })

      if (dayMon === 6) {  // Sunday ends the week
        weeks.push(currentWeek)
        currentWeek = []
        weekIndex++
      }

      current.setDate(current.getDate() + 1)
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek)
    }

    return {
      weeks,
      monthLabels: monthLabelsMap,
      maxCount,
    }
  }, [activity])

  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  const mode = isDark ? 'dark' : 'light'

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
        Activity
      </h3>

      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-0.5 min-w-fit">
          {/* Month labels */}
          <div className="flex ml-8 mb-1">
            {weeks.map((_, weekIdx) => (
              <div key={weekIdx} className="w-[13px] mx-[1.5px] flex-shrink-0">
                {monthLabels.has(weekIdx) && (
                  <span
                    className="text-[10px]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {monthLabels.get(weekIdx)}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Grid rows (7 days) */}
          {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
            <div key={dayIndex} className="flex items-center">
              <span
                className="w-7 text-[10px] text-right pr-2 flex-shrink-0"
                style={{ color: 'var(--text-muted)' }}
              >
                {DAYS[dayIndex]}
              </span>
              <div className="flex gap-[3px]">
                {weeks.map((week, weekIdx) => {
                  const cell = week.find((d) => d.day === dayIndex)
                  if (!cell) {
                    return (
                      <div
                        key={weekIdx}
                        className="w-[13px] h-[13px] rounded-sm"
                      />
                    )
                  }
                  const intensity = getIntensity(cell.count, maxCount)
                  return (
                    <div
                      key={weekIdx}
                      className="w-[13px] h-[13px] rounded-sm transition-colors"
                      style={{
                        background: INTENSITY_COLORS[intensity][mode],
                      }}
                      title={`${cell.count} problem${cell.count !== 1 ? 's' : ''} on ${cell.date}`}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 mt-3">
        <span
          className="text-[10px] mr-1"
          style={{ color: 'var(--text-muted)' }}
        >
          Less
        </span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className="w-[11px] h-[11px] rounded-sm"
            style={{ background: INTENSITY_COLORS[level][mode] }}
          />
        ))}
        <span
          className="text-[10px] ml-1"
          style={{ color: 'var(--text-muted)' }}
        >
          More
        </span>
      </div>
    </div>
  )
}
