import { ReactNode } from 'react'
import { cx, responsiveGrid, responsiveSpacing } from '@/lib/responsive'

interface ResponsiveGridProps {
  children: ReactNode
  cols?: '1-2' | '1-2-3' | '1-2-4' | '2-3-4'
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ResponsiveGrid({
  children,
  cols = '1-2',
  gap = 'md',
  className = '',
}: ResponsiveGridProps) {
  return (
    <div
      className={cx(
        responsiveGrid[cols],
        responsiveSpacing.gap[gap],
        className
      )}
    >
      {children}
    </div>
  )
}
