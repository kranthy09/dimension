'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer'
import { ContentHeader } from '@/components/content/ContentHeader'
import { TableOfContents } from '@/components/content/TableOfContents'

export default function BlogPost() {
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
          api.content.get('blog', slug),
          api.content.getMarkdown('blog', slug)
        ])
        setContent(contentData)
        setMarkdown(markdownData)
      } catch (err) {
        console.error('Failed to fetch blog post:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchContent()
  }, [slug])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center py-20">
          <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !content) {
    router.push('/404')
    return null
  }

  const { title, summary, category, tags, readTime } = content.metajson

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Three Column Layout: Left Space | Content | TOC */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_3fr_1fr] gap-8">
        {/* Left Empty Space (hidden on mobile) */}
        <div className="hidden xl:block" />

        {/* Main Content */}
        <article className="max-w-3xl">
          <ContentHeader
            title={title}
            summary={summary}
            category={category}
            tags={tags}
            readTime={readTime}
            publishedAt={content.published_at || undefined}
          />

          <MarkdownRenderer content={markdown} />
        </article>

        {/* Right Table of Contents (hidden on mobile) */}
        <aside className="hidden xl:block">
          <TableOfContents markdown={markdown} />
        </aside>
      </div>
    </div>
  )
}
