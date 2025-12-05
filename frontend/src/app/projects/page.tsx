import { api } from '@/lib/api'
import { Container } from '@/components/layout/Container'
import { ContentCard } from '@/components/content/ContentCard'

export const revalidate = 60

export default async function ProjectsPage() {
  const projects = await api.content.list('project')

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
            <span className="gradient-text">Projects</span>
          </h1>
          <p
            className="text-lg md:text-xl max-w-2xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            Open source contributions and personal projects built with modern tech
          </p>
        </div>

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
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
