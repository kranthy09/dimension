import { Badge } from '@/components/ui/Badge'

interface ContentHeaderProps {
  title: string
  summary: string
  category?: string
  tags?: string[]
  readTime?: number
  publishedAt?: string
}

export function ContentHeader({
  title,
  summary,
  category,
  tags,
  readTime,
  publishedAt,
}: ContentHeaderProps) {
  return (
    <header className="mb-12">
      {category && <Badge variant="outline">{category}</Badge>}

      <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-3" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h1>

      <p className="text-lg md:text-xl" style={{ color: 'var(--text-secondary)' }}>
        {summary}
      </p>

      <div className="flex flex-wrap gap-4 mt-6 text-sm" style={{ color: 'var(--text-muted)' }}>
        {readTime && <span>{readTime} min read</span>}
        {readTime && publishedAt && <span>•</span>}
        {publishedAt && (
          <time>
            {new Date(publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        )}
      </div>

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {tags.map((tag) => (
            <Badge key={tag} variant="subtle">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </header>
  )
}
