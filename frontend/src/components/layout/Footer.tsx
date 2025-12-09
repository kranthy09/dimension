'use client'

import { usePathname } from 'next/navigation'
import { Container } from './Container'

export function Footer() {
  const pathname = usePathname()
  const currentYear = new Date().getFullYear()

  // Don't render footer on admin pages
  if (pathname?.startsWith('/admin')) {
    return null
  }

  return (
    <footer
      className="relative mt-16 md:mt-24 lg:mt-32 border-t"
      style={{
        borderColor: 'var(--border)',
        paddingBottom: 'var(--safe-area-bottom)',
      }}
    >
      {/* Gradient accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: 'var(--gradient-evolution)',
          opacity: 0.3,
        }}
      />

      <Container>
        <div className="py-8 md:py-12">
          {/* Main content */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
            {/* Brand */}
            <div className="text-center md:text-left">
              {/* Logo and Evolune text */}
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <img
                  src="/images/evolune_logo.png"
                  alt="Evolune Logo"
                  className="h-8 w-auto sm:h-10 md:h-12 object-contain"
                  style={{
                    filter: 'drop-shadow(0 2px 8px rgba(255, 107, 53, 0.3))'
                  }}
                />
                <h3 className="text-lg md:text-xl font-bold gradient-text">Evolune</h3>
              </div>
              <p style={{ color: 'var(--text-muted)' }} className="text-xs md:text-sm">
                Building with <span style={{ color: 'var(--energy-500)' }}>energy</span> &amp;{' '}
                <span style={{ color: 'var(--life-500)' }}>evolution</span>
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 lg:gap-8">
              <a
                href="/blog"
                className="text-sm font-medium transition-colors hover:text-[var(--energy-500)] min-h-[44px] flex items-center"
                style={{ color: 'var(--text-secondary)' }}
              >
                Blog
              </a>
              <a
                href="/projects"
                className="text-sm font-medium transition-colors hover:text-[var(--energy-500)] min-h-[44px] flex items-center"
                style={{ color: 'var(--text-secondary)' }}
              >
                Projects
              </a>
              <a
                href="/case-studies"
                className="text-sm font-medium transition-colors hover:text-[var(--energy-500)] min-h-[44px] flex items-center"
                style={{ color: 'var(--text-secondary)' }}
              >
                Case Studies
              </a>
              <a
                href="/admin/upload"
                className="text-sm font-medium transition-colors hover:text-[var(--life-500)] min-h-[44px] flex items-center"
                style={{ color: 'var(--text-muted)' }}
              >
                Admin
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t text-center" style={{ borderColor: 'var(--border)' }}>
            <p style={{ color: 'var(--text-muted)' }} className="text-xs md:text-sm">
              &copy; {currentYear} Evolune. Crafted with passion and code.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  )
}
