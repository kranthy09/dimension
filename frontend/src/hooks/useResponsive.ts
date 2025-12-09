'use client'

import { useEffect } from 'react'
import { useResponsiveStore } from '@/store/useResponsiveStore'

export function useResponsive() {
  const { isMobile, isTablet, isDesktop, screenWidth, setBreakpoint } = useResponsiveStore()

  useEffect(() => {
    // Set initial breakpoint
    setBreakpoint(window.innerWidth)

    // Update on resize
    const handleResize = () => {
      setBreakpoint(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [setBreakpoint])

  return {
    isMobile,
    isTablet,
    isDesktop,
    screenWidth,
    breakpoint: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
  }
}
