export const breakpoints = {
  mobile: { min: 0, max: 767 },
  tablet: { min: 768, max: 1023 },
  desktop: { min: 1024, max: 1279 },
  wide: { min: 1280, max: 1535 },
  ultrawide: { min: 1536, max: Infinity },
} as const

export type BreakpointName = keyof typeof breakpoints

export function getBreakpointName(width: number): BreakpointName {
  for (const [name, { min, max }] of Object.entries(breakpoints)) {
    if (width >= min && width <= max) {
      return name as BreakpointName
    }
  }
  return 'desktop'
}
