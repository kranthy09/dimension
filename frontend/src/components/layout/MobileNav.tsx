'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useResponsiveStore } from '@/store/useResponsiveStore'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/projects', label: 'Projects' },
  { href: '/case-studies', label: 'Case Studies' },
  { href: '/dsa', label: 'DSA' },
]

export function MobileNav() {
  const pathname = usePathname()
  const { isMobileMenuOpen, closeMobileMenu } = useResponsiveStore()

  // Lock body scroll when menu is open
  useLockBodyScroll(isMobileMenuOpen)

  // Close menu on route change
  useEffect(() => {
    closeMobileMenu()
  }, [pathname, closeMobileMenu])

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMobileMenu()
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isMobileMenuOpen, closeMobileMenu])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 bg-black/50 backdrop-blur-sm z-40
          transition-opacity duration-300
          ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={closeMobileMenu}
        aria-hidden="true"
      />

      {/* Mobile Menu Drawer */}
      <nav
        className={`
          fixed top-0 right-0 bottom-0 w-[280px] max-w-[85vw]
          bg-[var(--bg-primary)] border-l border-[var(--border)]
          shadow-[var(--shadow-xl)] z-50
          transform transition-transform duration-300 ease-[var(--ease-organic)]
          ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        style={{
          paddingTop: 'max(var(--safe-area-top), 1rem)',
          paddingBottom: 'var(--safe-area-bottom)',
          paddingRight: 'var(--safe-area-right)',
        }}
        aria-label="Mobile navigation"
      >
        {/* Close button */}
        <div className="flex justify-end px-4 mb-8">
          <button
            onClick={closeMobileMenu}
            className="
              p-2 rounded-lg
              text-[var(--text-secondary)]
              hover:text-[var(--text-primary)]
              hover:bg-[var(--bg-secondary)]
              transition-colors duration-200
              min-w-[44px] min-h-[44px]
              flex items-center justify-center
            "
            aria-label="Close menu"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col px-4 space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  px-4 py-3 rounded-lg
                  text-lg font-medium
                  transition-all duration-200
                  min-h-[44px] flex items-center
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-[var(--energy-500)] to-[var(--life-500)] text-white'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                  }
                `}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Footer section (optional) */}
        <div className="absolute bottom-8 left-0 right-0 px-8">
          <div className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            <p>© 2024 Portfolio</p>
          </div>
        </div>
      </nav>
    </>
  )
}
