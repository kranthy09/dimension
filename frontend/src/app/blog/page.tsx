import { api } from '@/lib/api'
import { Container } from '@/components/layout/Container'
import { ContentCard } from '@/components/content/ContentCard'

export const revalidate = 60

export default async function BlogPage() {
  const posts = await api.content.list('blog')

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
            <span className="gradient-text">Blog</span>
          </h1>
          <p
            className="text-lg md:text-xl max-w-2xl mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            Technical articles, tutorials, and thoughts on software development
          </p>
        </div>

        {/* Posts Grid */}
        {posts.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {posts.map((post) => (
              <ContentCard key={post.id} content={post} basePath="/blog" />
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
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              No posts yet
            </h3>
            <p style={{ color: 'var(--text-muted)' }}>
              Check back soon for technical articles and insights
            </p>
          </div>
        )}
      </Container>
    </main>
  )
}
