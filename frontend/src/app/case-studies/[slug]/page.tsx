import { api } from '@/lib/api'
import { Container } from '@/components/layout/Container'
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer'
import { ContentHeader } from '@/components/content/ContentHeader'
import { notFound } from 'next/navigation'

interface Props {
  params: { slug: string }
}

// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic'
export const revalidate = 60

export default async function CaseStudyPage({ params }: Props) {
  try {
    const content = await api.content.get('case-study', params.slug)
    const markdown = await api.content.getMarkdown('case-study', params.slug)

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
  } catch (error) {
    notFound()
  }
}
