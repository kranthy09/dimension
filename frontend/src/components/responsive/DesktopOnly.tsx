'use client'

import { ReactNode } from 'react'
import { useResponsive } from '@/hooks/useResponsive'

interface DesktopOnlyProps {
  children: ReactNode
}

export function DesktopOnly({ children }: DesktopOnlyProps) {
  const { isDesktop } = useResponsive()

  if (!isDesktop) return null

  return <>{children}</>
}
