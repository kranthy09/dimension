import Link from 'next/link'
import { ContentFile } from '@/lib/api'

interface ContentCardProps {
  content: ContentFile
  basePath: string
}

export function ContentCard({ content, basePath }: ContentCardProps) {
  const { slug, title, summary, category, tags, readTime } = content.metajson

  return (
    <Link href={`${basePath}/${slug}`} className="group block">
      <article className="card card-interactive h-full flex flex-col p-4 sm:p-6 lg:p-8">
        {/* Category badge */}
        {category && (
          <div className="mb-3 sm:mb-4">
            <span
              className="inline-block px-2.5 py-1 text-xs sm:text-sm font-medium rounded-full"
              style={{
                background: 'var(--gradient-energy)',
                color: 'white',
              }}
            >
              {category}
            </span>
          </div>
        )}

        {/* Title */}
        <h3
          className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 group-hover:text-[var(--energy-500)] transition-colors"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </h3>

        {/* Summary */}
        <p className="text-sm sm:text-base mb-3 sm:mb-4 flex-grow" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          {summary}
        </p>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            {tags.slice(0, 3).map((tag: string) => (
              <span
                key={tag}
                className="px-2 py-0.5 sm:py-1 text-xs font-medium rounded bg-[var(--sand-200)] text-[var(--sand-700)] dark:bg-[var(--sand-800)] dark:text-[var(--sand-200)]"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span
                className="px-2 py-0.5 sm:py-1 text-xs font-medium rounded bg-[var(--sand-200)] text-[var(--sand-600)] dark:bg-[var(--sand-800)] dark:text-[var(--sand-400)]"
              >
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Meta info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2 pt-3 sm:pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          {content.published_at && (
            <time
              className="text-xs sm:text-sm"
              style={{ color: 'var(--text-muted)' }}
              dateTime={content.published_at}
            >
              {new Date(content.published_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </time>
          )}

          {readTime && (
            <span className="text-xs sm:text-sm flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {readTime}
            </span>
          )}
        </div>

        {/* Hover arrow indicator */}
        <div className="flex items-center gap-2 mt-3 sm:mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs sm:text-sm font-medium" style={{ color: 'var(--energy-500)' }}>
            Read more
          </span>
          <svg
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform"
            style={{ color: 'var(--energy-500)' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </article>
    </Link>
  )
}
