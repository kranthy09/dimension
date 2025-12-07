'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useEffect, useState } from 'react'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
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
          h1: ({ children }) => (
            <h1 className="text-4xl font-bold mt-8 mb-4" style={{ color: 'var(--text-primary)' }}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-3xl font-semibold mt-6 mb-3" style={{ color: 'var(--text-primary)' }}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-2xl font-semibold mt-5 mb-2" style={{ color: 'var(--text-primary)' }}>
              {children}
            </h3>
          ),
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
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
