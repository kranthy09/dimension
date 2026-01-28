'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useEffect, useState } from 'react'
import { ContentFile } from '@/lib/api'

interface MarkdownRendererProps {
  content: string
  className?: string
  contentFile?: ContentFile
}

export function MarkdownRenderer({ content, className = '', contentFile }: MarkdownRendererProps) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check initial theme
    setIsDark(document.documentElement.classList.contains('dark'))

    // Watch for theme changes
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  // Generate heading ID from text
  const generateId = (text: string): string => {
    return text
      .toString()
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
  }

  // Extract folder name from file_path
  const getFolderFromPath = (filePath: string): string => {
    // "markdown/blog/Blog_Title_Name/content.md" → "Blog_Title_Name"
    const parts = filePath.split('/')
    return parts[parts.length - 2]
  }

  // Resolve relative image paths to absolute URLs
  const resolveImagePath = (src: string): string => {
    if (!src) return ''

    // Already absolute? Return as-is
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return src
    }

    // Need contentFile to resolve relative paths
    if (!contentFile) return src

    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const basePath = apiBase.replace('/api/v1', '')
    const folderName = getFolderFromPath(contentFile.file_path)
    const section = contentFile.section

    // Handle different relative path formats
    if (src.startsWith('./images/')) {
      const filename = src.replace('./images/', '')
      return `${basePath}/media/markdown/${section}/${folderName}/images/${filename}`
    } else if (src.startsWith('images/')) {
      return `${basePath}/media/markdown/${section}/${folderName}/images/${src}`
    }

    return src
  }

  return (
    <div className={`prose prose-neutral dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '')
            const inline = !match
            return !inline && match ? (
              <SyntaxHighlighter
                style={isDark ? oneDark : oneLight}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code
                className={`px-1.5 py-0.5 rounded text-sm font-mono ${className || ''}`}
                style={{
                  backgroundColor: 'var(--sand-200)',
                  color: 'var(--energy-700)'
                }}
                {...props}
              >
                {children}
              </code>
            )
          },
          h1: ({ children }) => {
            const id = generateId(String(children))
            return (
              <h1 id={id} className="text-4xl font-bold mt-8 mb-4 scroll-mt-24" style={{ color: 'var(--text-primary)' }}>
                {children}
              </h1>
            )
          },
          h2: ({ children }) => {
            const id = generateId(String(children))
            return (
              <h2 id={id} className="text-3xl font-semibold mt-6 mb-3 scroll-mt-24" style={{ color: 'var(--text-primary)' }}>
                {children}
              </h2>
            )
          },
          h3: ({ children }) => {
            const id = generateId(String(children))
            return (
              <h3 id={id} className="text-2xl font-semibold mt-5 mb-2 scroll-mt-24" style={{ color: 'var(--text-primary)' }}>
                {children}
              </h3>
            )
          },
          h4: ({ children }) => (
            <h4 className="text-xl font-semibold mt-4 mb-2" style={{ color: 'var(--text-primary)' }}>
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-lg font-semibold mt-3 mb-2" style={{ color: 'var(--text-primary)' }}>
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-base font-semibold mt-3 mb-2" style={{ color: 'var(--text-primary)' }}>
              {children}
            </h6>
          ),
          p: ({ children }) => (
            <p className="my-4 leading-7" style={{ color: 'var(--text-secondary)' }}>
              {children}
            </p>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="font-medium hover:underline transition-colors"
              style={{ color: 'var(--energy-500)' }}
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="my-4 ml-6 list-disc" style={{ color: 'var(--text-secondary)' }}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 ml-6 list-decimal" style={{ color: 'var(--text-secondary)' }}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="my-1" style={{ color: 'var(--text-secondary)' }}>
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote
              className="border-l-4 pl-4 italic my-4"
              style={{
                borderColor: 'var(--energy-500)',
                color: 'var(--text-muted)'
              }}
            >
              {children}
            </blockquote>
          ),
          strong: ({ children }) => (
            <strong className="font-bold" style={{ color: 'var(--text-primary)' }}>
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em style={{ color: 'var(--text-secondary)' }}>
              {children}
            </em>
          ),
          hr: () => (
            <hr className="my-8" style={{ borderColor: 'var(--border)' }} />
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full divide-y" style={{ borderColor: 'var(--border)' }}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead style={{ backgroundColor: 'var(--sand-100)' }}>
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th
              className="px-4 py-2 text-left text-sm font-semibold"
              style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }}
            >
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td
              className="px-4 py-2 text-sm border-t"
              style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)' }}
            >
              {children}
            </td>
          ),
          img: ({ src, alt, ...props }: any) => (
            <img
              src={resolveImagePath(src || '')}
              alt={alt || ''}
              className="rounded-lg my-6 max-w-full h-auto"
              style={{
                border: '1px solid var(--border)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
