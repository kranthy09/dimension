import { ReactNode } from 'react'
import { cx } from '@/lib/responsive'

interface TouchTargetProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function TouchTarget({ children, className = '', onClick }: TouchTargetProps) {
  return (
    <button
      className={cx(
        'min-w-[44px] min-h-[44px]',
        'flex items-center justify-center',
        'touch-manipulation',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--energy-500)]',
        className
      )}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}
