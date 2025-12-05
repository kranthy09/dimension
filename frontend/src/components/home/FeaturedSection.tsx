'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { FeatureCard } from './FeatureCard'
import type { SectionContent } from '@/content/home'

interface FeaturedSectionProps {
  section: SectionContent
  reversed?: boolean
}

export function FeaturedSection({ section, reversed = false }: FeaturedSectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative py-24 overflow-hidden"
      style={{
        backgroundColor: reversed ? 'var(--bg-secondary)' : 'var(--bg-primary)',
      }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-96 h-96 rounded-full blur-3xl transition-all duration-1000"
          style={{
            top: reversed ? 'auto' : '10%',
            bottom: reversed ? '10%' : 'auto',
            left: reversed ? '10%' : 'auto',
            right: reversed ? 'auto' : '10%',
            background: 'var(--gradient-energy)',
            opacity: isVisible ? 0.08 : 0,
          }}
        />
        <div
          className="absolute w-80 h-80 rounded-full blur-3xl transition-all duration-1000 delay-300"
          style={{
            top: reversed ? '20%' : 'auto',
            bottom: reversed ? 'auto' : '20%',
            left: reversed ? 'auto' : '15%',
            right: reversed ? '15%' : 'auto',
            background: 'var(--gradient-life)',
            opacity: isVisible ? 0.06 : 0,
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2
            className={`mb-4 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
              fontWeight: 800,
              color: 'var(--text-primary)',
            }}
          >
            <span className="gradient-text gradient-text-animated">{section.title}</span>
          </h2>
          <p
            className={`text-xl max-w-2xl mx-auto transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ color: 'var(--text-secondary)' }}
          >
            {section.subtitle}
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {section.features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              index={index}
            />
          ))}
        </div>

        {/* CTA Button */}
        <div
          className={`text-center transition-all duration-700 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Link href={section.ctaLink}>
            <button
              className="group relative px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, var(--energy-500), var(--life-500))',
                color: '#ffffff',
              }}
            >
              <span className="relative z-10">{section.ctaText}</span>

              {/* Hover glow effect */}
              <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
                style={{
                  background: 'linear-gradient(135deg, var(--energy-500), var(--life-500))',
                }}
              />

              {/* Arrow icon */}
              <svg
                className="inline-block w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}
