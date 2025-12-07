import { api } from '@/lib/api'
import { Container } from '@/components/layout/Container'
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer'
import { ContentHeader } from '@/components/content/ContentHeader'
import { Badge } from '@/components/ui/Badge'
import { notFound } from 'next/navigation'

interface Props {
  params: { slug: string }
}

// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic'
export const revalidate = 60

export default async function ProjectPage({ params }: Props) {
  try {
    const content = await api.content.get('project', params.slug)
    const markdown = await api.content.getMarkdown('project', params.slug)

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
  } catch (error) {
    notFound()
  }
}
