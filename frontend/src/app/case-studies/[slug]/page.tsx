'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Container } from '@/components/layout/Container'
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer'
import { ContentHeader } from '@/components/content/ContentHeader'

export default function CaseStudyPage() {
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
          api.content.get('case-study', slug),
          api.content.getMarkdown('case-study', slug)
        ])
        setContent(contentData)
        setMarkdown(markdownData)
      } catch (err) {
        console.error('Failed to fetch case study:', err)
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

  const { title, summary, category, tags } = content.metajson

  return (
    <Container className="max-w-4xl py-16">
      <ContentHeader
        title={title}
        summary={summary}
        category={category}
        tags={tags}
        publishedAt={content.published_at || undefined}
      />

      <MarkdownRenderer content={markdown} />
    </Container>
  )
}
