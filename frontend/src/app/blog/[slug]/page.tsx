import { api } from '@/lib/api'
import { Container } from '@/components/layout/Container'
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer'
import { ContentHeader } from '@/components/content/ContentHeader'
import { notFound } from 'next/navigation'

interface Props {
  params: { slug: string }
}

export const revalidate = 60

export default async function BlogPost({ params }: Props) {
  try {
    const content = await api.content.get('blog', params.slug)
    const markdown = await api.content.getMarkdown('blog', params.slug)

    const { title, summary, category, tags, readTime } = content.metajson

    return (
      <Container className="max-w-4xl py-16">
        <ContentHeader
          title={title}
          summary={summary}
          category={category}
          tags={tags}
          readTime={readTime}
          publishedAt={content.published_at || undefined}
        />

        <MarkdownRenderer content={markdown} />
      </Container>
    )
  } catch (error) {
    console.log("error: ", error)
    notFound()
  }
}
