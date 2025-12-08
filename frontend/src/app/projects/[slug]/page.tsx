'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Container } from '@/components/layout/Container'
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer'
import { ContentHeader } from '@/components/content/ContentHeader'
import { Badge } from '@/components/ui/Badge'

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [content, setContent] = useState<any>(null)
  const [markdown, setMarkdown] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchContent() {
      try {
        const [contentData, markdownData] = await Promise.all([
          api.content.get('project', slug),
          api.content.getMarkdown('project', slug)
        ])
        setContent(contentData)
        setMarkdown(markdownData)
      } catch (err) {
        console.error('Failed to fetch project:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchContent()
  }, [slug])

  if (loading) {
    return (
      <Container className="max-w-4xl py-16">
        <div className="text-center py-20">
          <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
        </div>
      </Container>
    )
  }

  if (error || !content) {
    router.push('/404')
    return null
  }

  const {
    title,
    summary,
    techStack,
    deployedUrl,
    codebaseUrl,
  } = content.metajson

  return (
    <Container className="max-w-4xl py-16">
      <ContentHeader
        title={title}
        summary={summary}
        publishedAt={content.published_at || undefined}
      />

      {techStack && techStack.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Tech Stack</h3>
          <div className="flex flex-wrap gap-2">
            {techStack.map((tech: string) => (
              <Badge key={tech} variant="subtle">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4 mb-12">
        {deployedUrl && (
          <a
            href={deployedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline transition-colors"
            style={{ color: 'var(--energy-500)' }}
          >
            Live Demo →
          </a>
        )}
        {codebaseUrl && (
          <a
            href={codebaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline transition-colors"
            style={{ color: 'var(--energy-500)' }}
          >
            View Code →
          </a>
        )}
      </div>

      <MarkdownRenderer content={markdown} />
    </Container>
  )
}
