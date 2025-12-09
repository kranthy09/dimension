'use client'

import { ReactNode } from 'react'
import { useResponsive } from '@/hooks/useResponsive'

interface MobileOnlyProps {
  children: ReactNode
}

export function MobileOnly({ children }: MobileOnlyProps) {
  const { isMobile } = useResponsive()

  if (!isMobile) return null

  return <>{children}</>
}
