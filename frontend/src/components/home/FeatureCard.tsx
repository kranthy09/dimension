'use client'

import { useEffect, useRef, useState } from 'react'

interface FeatureCardProps {
  title: string
  description: string
  icon: 'pen' | 'code' | 'search'
  index: number
}

const icons = {
  pen: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  ),
  code: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  search: (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )
}

export function FeatureCard({ title, description, icon, index }: FeatureCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 150)
        }
      },
      { threshold: 0.2 }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [index])

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative p-8 rounded-2xl border-2 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: isHovered ? 'var(--energy-500)' : 'var(--border)',
        transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: isHovered
          ? '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px var(--energy-500)'
          : '0 4px 6px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Gradient overlay on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at top left, var(--energy-500) 0%, transparent 70%)',
          opacity: isHovered ? 0.05 : 0,
        }}
      />

      {/* Icon */}
      <div
        className="relative w-16 h-16 rounded-xl mb-6 flex items-center justify-center transition-all duration-500"
        style={{
          background: isHovered
            ? 'linear-gradient(135deg, var(--energy-500), var(--life-500))'
            : 'var(--sand-200)',
          color: isHovered ? '#ffffff' : 'var(--energy-500)',
          transform: isHovered ? 'rotate(5deg) scale(1.1)' : 'rotate(0deg) scale(1)',
        }}
      >
        {icons[icon]}
      </div>

      {/* Content */}
      <h3
        className="text-xl font-bold mb-3 transition-colors duration-300"
        style={{ color: isHovered ? 'var(--energy-500)' : 'var(--text-primary)' }}
      >
        {title}
      </h3>

      <p
        className="leading-relaxed transition-colors duration-300"
        style={{
          color: 'var(--text-secondary)',
          lineHeight: '1.7',
        }}
      >
        {description}
      </p>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 h-1 rounded-b-2xl transition-all duration-500"
        style={{
          width: isHovered ? '100%' : '0%',
          background: 'linear-gradient(90deg, var(--energy-500), var(--life-500))',
        }}
      />
    </div>
  )
}
