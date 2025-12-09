import { ReactNode } from 'react'
import { cx, responsiveText } from '@/lib/responsive'

interface ResponsiveTextProps {
  children: ReactNode
  variant: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small'
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div'
}

export function ResponsiveText({
  children,
  variant,
  className = '',
  as,
}: ResponsiveTextProps) {
  const Component = as || (variant.startsWith('h') ? variant : 'p')

  return (
    <Component
      className={cx(
        responsiveText[variant],
        variant.startsWith('h') && 'font-bold',
        className
      )}
    >
      {children}
    </Component>
  )
}
