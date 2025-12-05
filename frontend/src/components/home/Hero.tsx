'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { heroContent } from '@/content/home'

export function Hero() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-20 blur-3xl"
          style={{
            background: 'var(--gradient-energy)',
            animation: 'float 6s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{
            background: 'var(--gradient-life)',
            animation: 'float 8s ease-in-out infinite',
            animationDelay: '2s',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <h1
            className={`mb-8 transition-all duration-1000 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
            style={{
              fontSize: 'clamp(2.5rem, 8vw, 5rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            <span className="gradient-text gradient-text-animated">
              {heroContent.title.primary}
            </span>
            <br />
            <span style={{ color: 'var(--text-primary)' }}>
              {heroContent.title.secondary}
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className={`mb-12 text-xl md:text-2xl leading-relaxed transition-all duration-1000 delay-200 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
            style={{
              color: 'var(--text-secondary)',
              maxWidth: '42rem',
              margin: '0 auto 3rem',
            }}
          >
            {heroContent.subtitle}
          </p>

          {/* CTA Buttons */}
          <div
            className={`flex flex-wrap gap-4 justify-center transition-all duration-1000 delay-400 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            {heroContent.cta.map((cta, index) => (
              <Link key={cta.link} href={cta.link}>
                <button
                  className={`group relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 overflow-hidden ${
                    index === 0
                      ? 'hover:shadow-2xl hover:scale-105'
                      : 'hover:shadow-lg hover:scale-102'
                  }`}
                  style={
                    index === 0
                      ? {
                          background: 'linear-gradient(135deg, var(--energy-500), var(--life-500))',
                          color: '#ffffff',
                        }
                      : {
                          backgroundColor: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          border: '2px solid var(--border)',
                        }
                  }
                >
                  {/* Gradient overlay on hover for secondary buttons */}
                  {index !== 0 && (
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: 'linear-gradient(135deg, var(--energy-500), var(--life-500))',
                        opacity: 0.1,
                      }}
                    />
                  )}

                  <span className="relative z-10 flex items-center gap-2">
                    {cta.text}
                    <svg
                      className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </span>
                </button>
              </Link>
            ))}
          </div>

          {/* Scroll indicator */}
          <div
            className={`mt-20 transition-all duration-1000 delay-600 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Scroll to explore
              </span>
              <svg
                className="w-6 h-6"
                style={{
                  color: 'var(--energy-500)',
                  animation: 'float 2s ease-in-out infinite',
                }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
