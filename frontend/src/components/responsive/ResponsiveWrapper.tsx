'use client'

import { ReactNode } from 'react'
import { useResponsive } from '@/hooks/useResponsive'

interface ResponsiveWrapperProps {
  mobile?: ReactNode
  tablet?: ReactNode
  desktop?: ReactNode
  children?: ReactNode
}

export function ResponsiveWrapper({ mobile, tablet, desktop, children }: ResponsiveWrapperProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive()

  if (isMobile && mobile) return <>{mobile}</>
  if (isTablet && tablet) return <>{tablet}</>
  if (isDesktop && desktop) return <>{desktop}</>

  return <>{children}</>
}
