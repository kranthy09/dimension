import { ReactNode } from 'react'
import { cx, responsiveSpacing } from '@/lib/responsive'

interface ResponsiveCardProps {
  children: ReactNode
  padding?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
  hover?: boolean
}

export function ResponsiveCard({
  children,
  padding = 'md',
  className = '',
  onClick,
  hover = false,
}: ResponsiveCardProps) {
  return (
    <div
      className={cx(
        'rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]',
        'shadow-[var(--shadow-sm)]',
        responsiveSpacing.padding[padding],
        hover && 'transition-all duration-300 hover:shadow-[var(--shadow-lg)] hover:border-[var(--energy-500)]',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
