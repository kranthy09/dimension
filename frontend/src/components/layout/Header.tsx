'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Container } from './Container'
import { MobileNav } from './MobileNav'
import { HamburgerButton } from './HamburgerButton'
import { useEffect, useState } from 'react'

export function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  // Don't render header on admin pages
  if (pathname?.startsWith('/admin')) {
    return null
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Check for saved theme or system preference
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const initialTheme = savedTheme || systemTheme

    setTheme(initialTheme)
    document.documentElement.classList.toggle('dark', initialTheme === 'dark')
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
    localStorage.setItem('theme', newTheme)
  }

  const navLinks = [
    { href: '/blog', label: 'Blog' },
    { href: '/projects', label: 'Projects' },
    { href: '/case-studies', label: 'Case Studies' },
  ]

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass shadow-md' : 'bg-transparent'
          }`}
        style={{
          borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
          paddingTop: 'var(--safe-area-top)',
          paddingLeft: 'var(--safe-area-left)',
          paddingRight: 'var(--safe-area-right)',
        }}
      >
        <Container>
          <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="relative group">
            <span className="text-2xl font-bold gradient-text gradient-text-animated">
              Portfolio
            </span>
          </Link>

          {/* Navigation Links - Desktop only */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname?.startsWith(link.href + '/')
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative py-2 font-medium transition-colors duration-300"
                  style={{
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  }}
                >
                  <span className="relative z-10 hover:text-[var(--text-primary)] transition-colors">
                    {link.label}
                  </span>

                  {/* Active/Hover indicator */}
                  <span
                    className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[var(--energy-500)] to-[var(--life-500)] transition-all duration-300"
                    style={{
                      width: isActive ? '100%' : '0%',
                    }}
                  />

                  {/* Hover glow */}
                  <span
                    className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-[80%] h-[6px] opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                    style={{
                      background: 'radial-gradient(ellipse, var(--life-500), transparent)',
                    }}
                  />
                </Link>
              )
            })}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="relative w-12 h-6 sm:w-14 sm:h-7 rounded-full transition-all duration-300"
              style={{
                background: 'var(--sand-200)',
                border: '2px solid var(--border)',
              }}
              aria-label="Toggle theme"
            >
              <div
                className="absolute top-[2px] left-[2px] w-4 h-4 sm:w-5 sm:h-5 rounded-full shadow-md transition-all duration-300 flex items-center justify-center"
                style={{
                  transform: theme === 'dark' ? 'translateX(24px)' : 'translateX(0)',
                  background: theme === 'dark' ? 'var(--life-500)' : 'var(--energy-500)',
                }}
              >
                {theme === 'dark' ? (
                  <svg
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                )}
              </div>
            </button>

            {/* Hamburger Button - Mobile/Tablet only */}
            <HamburgerButton />
          </div>
        </nav>
      </Container>
    </header>

    {/* Mobile Navigation Drawer */}
    <MobileNav />
  </>
  )
}
