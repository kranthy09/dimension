import { create } from 'zustand'

interface ResponsiveState {
  isMobileMenuOpen: boolean
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  screenWidth: number

  // Actions
  openMobileMenu: () => void
  closeMobileMenu: () => void
  toggleMobileMenu: () => void
  setBreakpoint: (width: number) => void
}

export const useResponsiveStore = create<ResponsiveState>((set) => ({
  // Initial state
  isMobileMenuOpen: false,
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1024,

  // Actions
  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  setBreakpoint: (width: number) => set({
    screenWidth: width,
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
  }),
}))
