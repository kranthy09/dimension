interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'outline' | 'subtle'
  className?: string
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    default: 'text-white',
    outline: 'border bg-transparent text-[var(--sand-700)] dark:text-[var(--sand-200)]',
    subtle: 'bg-[var(--sand-200)] text-[var(--sand-700)] dark:bg-[var(--sand-800)] dark:text-[var(--sand-200)]',
  }

  const defaultStyle = variant === 'default' ? { background: 'var(--gradient-energy)' } : {}
  const outlineStyle = variant === 'outline' ? { borderColor: 'var(--border)' } : {}

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
      style={{ ...defaultStyle, ...outlineStyle }}
    >
      {children}
    </span>
  )
}
