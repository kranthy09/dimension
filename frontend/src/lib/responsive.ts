// Breakpoint constants
export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
  ultrawide: 1536,
} as const

export type Breakpoint = keyof typeof BREAKPOINTS

// Responsive spacing utilities
export const responsiveSpacing = {
  padding: {
    sm: 'p-4 sm:p-6 lg:p-8',
    md: 'p-6 sm:p-8 lg:p-12',
    lg: 'p-8 sm:p-12 lg:p-16',
  },
  gap: {
    sm: 'gap-4 md:gap-6 lg:gap-8',
    md: 'gap-6 md:gap-8 lg:gap-12',
    lg: 'gap-8 md:gap-12 lg:gap-16',
  },
  margin: {
    sm: 'mb-4 md:mb-6 lg:mb-8',
    md: 'mb-6 md:mb-8 lg:mb-12',
    lg: 'mb-8 md:mb-12 lg:mb-16',
  },
} as const

// Responsive text utilities
export const responsiveText = {
  h1: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl',
  h2: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl',
  h3: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl',
  h4: 'text-lg sm:text-xl md:text-2xl',
  body: 'text-sm sm:text-base md:text-lg',
  small: 'text-xs sm:text-sm',
} as const

// Grid utilities
export const responsiveGrid = {
  '1-2': 'grid grid-cols-1 md:grid-cols-2',
  '1-2-3': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  '1-2-4': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  '2-3-4': 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
} as const

// Check if screen width matches breakpoint
export function isBreakpoint(width: number, breakpoint: Breakpoint): boolean {
  return width >= BREAKPOINTS[breakpoint]
}

// Get current breakpoint
export function getCurrentBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINTS.ultrawide) return 'ultrawide'
  if (width >= BREAKPOINTS.wide) return 'wide'
  if (width >= BREAKPOINTS.desktop) return 'desktop'
  if (width >= BREAKPOINTS.tablet) return 'tablet'
  return 'mobile'
}

// Touch target validator
export function validateTouchTarget(size: number): boolean {
  const MIN_TOUCH_TARGET = 44 // iOS HIG recommendation
  return size >= MIN_TOUCH_TARGET
}

// Combine responsive classes
export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}
