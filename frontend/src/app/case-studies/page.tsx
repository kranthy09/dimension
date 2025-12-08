'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Container } from '@/components/layout/Container'
import { ContentCard } from '@/components/content/ContentCard'

export default function CaseStudiesPage() {
  const [caseStudies, setCaseStudies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCaseStudies() {
      try {
        const data = await api.content.list('case-study')
        setCaseStudies(data)
      } catch (error) {
        console.error('Failed to fetch case studies:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCaseStudies()
  }, [])

  return (
    <main className="pt-24">
      <Container className="py-16">
        {/* Page Header */}
        <div className="mb-16 text-center">
          <h1
            className="mb-4"
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
            }}
          >
            <span className="gradient-text">Case Studies</span>
          </h1>
          <p
            className="text-lg md:text-xl max-w-2xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            Deep dives into real-world problem solving and architectural decisions
          </p>
        </div>

        {/* Case Studies Grid */}
        {loading ? (
          <div className="text-center py-20">
            <p style={{ color: 'var(--text-muted)' }}>Loading case studies...</p>
          </div>
        ) : caseStudies.length > 0 ? (
          <div className="grid gap-8 max-w-4xl mx-auto">
            {caseStudies.map((caseStudy) => (
              <ContentCard key={caseStudy.id} content={caseStudy} basePath="/case-studies" />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="mb-6">
              <div
                className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
                style={{ background: 'var(--gradient-subtle)' }}
              >
                <svg
                  className="w-10 h-10"
                  style={{ color: 'var(--energy-500)' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              No case studies yet
            </h3>
            <p style={{ color: 'var(--text-muted)' }}>
              Check back soon for deep dives into problem solving
            </p>
          </div>
        )}
      </Container>
    </main>
  )
}
