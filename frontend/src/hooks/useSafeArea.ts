'use client'

import { useEffect, useState } from 'react'

interface SafeAreaInsets {
  top: number
  bottom: number
  left: number
  right: number
}

export function useSafeArea(): SafeAreaInsets {
  const [insets, setInsets] = useState<SafeAreaInsets>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  })

  useEffect(() => {
    const getInset = (property: string): number => {
      if (typeof window === 'undefined') return 0

      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(property)
        .trim()

      return value ? parseInt(value, 10) : 0
    }

    const updateInsets = () => {
      setInsets({
        top: getInset('--safe-area-top'),
        bottom: getInset('--safe-area-bottom'),
        left: getInset('--safe-area-left'),
        right: getInset('--safe-area-right'),
      })
    }

    updateInsets()

    // Update on orientation change
    window.addEventListener('orientationchange', updateInsets)
    window.addEventListener('resize', updateInsets)

    return () => {
      window.removeEventListener('orientationchange', updateInsets)
      window.removeEventListener('resize', updateInsets)
    }
  }, [])

  return insets
}
