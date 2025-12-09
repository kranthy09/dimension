'use client'

import { useResponsiveStore } from '@/store/useResponsiveStore'

export function HamburgerButton() {
  const { toggleMobileMenu } = useResponsiveStore()

  return (
    <button
      onClick={toggleMobileMenu}
      className="
        p-2 rounded-lg
        text-[var(--text-secondary)]
        hover:text-[var(--text-primary)]
        hover:bg-[var(--bg-secondary)]
        transition-colors duration-200
        min-w-[44px] min-h-[44px]
        flex items-center justify-center
        lg:hidden
      "
      aria-label="Toggle menu"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>
  )
}
