'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Container } from '@/components/layout/Container'
import { ContentCard } from '@/components/content/ContentCard'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProjects() {
      try {
        const data = await api.content.list('project')
        setProjects(data)
      } catch (error) {
        console.error('Failed to fetch projects:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  return (
    <main className="pt-24">
      <Container className="py-8 sm:py-12 lg:py-16">
        {/* Page Header */}
        <div className="mb-8 sm:mb-12 lg:mb-16 text-center">
          <h1
            className="mb-3 sm:mb-4"
            style={{
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
            }}
          >
            <span className="gradient-text">Projects</span>
          </h1>
          <p
            className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto px-4"
            style={{ color: 'var(--text-secondary)' }}
          >
            Open source contributions and personal projects built with modern tech
          </p>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="text-center py-12 sm:py-16 md:py-20">
            <p style={{ color: 'var(--text-muted)' }}>Loading projects...</p>
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
            {projects.map((project) => (
              <ContentCard key={project.id} content={project} basePath="/projects" />
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
                  style={{ color: 'var(--life-500)' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              No projects yet
            </h3>
            <p style={{ color: 'var(--text-muted)' }}>
              Check back soon for exciting projects and code
            </p>
          </div>
        )}
      </Container>
    </main>
  )
}
