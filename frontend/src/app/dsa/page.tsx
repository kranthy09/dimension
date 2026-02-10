'use client'

import { useState, useEffect } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { fetchLatestFile, type FileDetail } from '@/lib/github'
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer'
import Link from 'next/link'

const LANGUAGE_MAP: Record<string, string> = {
  py: 'python',
  js: 'javascript',
  ts: 'typescript',
  cpp: 'cpp',
  java: 'java',
  go: 'go',
}

const DIFFICULTY_STYLES: Record<string, { bg: string; color: string }> = {
  Easy: { bg: '#dcfce7', color: '#166534' },
  Medium: { bg: '#fef9c3', color: '#854d0e' },
  Hard: { bg: '#fee2e2', color: '#991b1b' },
}

const MD_EXTENSIONS = new Set(['md', 'mdx'])

type LatestFile = FileDetail & { commit_date?: string; commit_message?: string }

export default function DSAPage() {
  const [file, setFile] = useState<LatestFile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await fetchLatestFile()
        setFile(data)
        setError(null)
      } catch {
        setError('Failed to load latest file.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleCopy = async () => {
    if (!file) return
    await navigator.clipboard.writeText(file.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div
          className="animate-spin rounded-full h-10 w-10 border-b-2"
          style={{ borderColor: 'var(--accent-primary)' }}
        />
        <p className="text-sm animate-pulse" style={{ color: 'var(--text-muted)' }}>
          Loading latest solution...
        </p>
      </div>
    )
  }

  if (error || !file) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <svg
            className="w-16 h-16 mx-auto mb-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{ color: 'var(--text-muted)' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            {error || 'No solutions found'}
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            Select a file from the sidebar to view its content.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm font-medium"
            style={{ color: 'var(--accent-primary)' }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const diffStyle = DIFFICULTY_STYLES[file.metadata.difficulty] || DIFFICULTY_STYLES.Medium
  const isMarkdown = MD_EXTENSIONS.has(file.language)
  const pathSegments = file.path.split('/')
  const parentFolder = pathSegments.length > 1 ? pathSegments.slice(0, -1).join(' / ') : null

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Latest commit banner */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-lg mb-4 border"
        style={{
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border)',
        }}
      >
        <span
          className="px-2 py-0.5 rounded text-xs font-semibold"
          style={{ background: 'var(--accent-primary)', color: '#fff' }}
        >
          Latest
        </span>
        <span className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
          {file.commit_message || 'Recent update'}
        </span>
        {file.commit_date && (
          <span className="text-xs ml-auto flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
            {new Date(file.commit_date).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* File Header */}
      <div
        className="rounded-lg p-6 mb-6 border"
        style={{
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {file.name}
          </h1>
          <Link
            href={`/dsa/${encodeURIComponent(file.path)}`}
            className="text-xs font-medium flex-shrink-0 ml-4"
            style={{ color: 'var(--accent-primary)' }}
          >
            View full page →
          </Link>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          {parentFolder && (
            <span
              className="px-2.5 py-1 rounded-lg text-xs font-medium"
              style={{
                background: 'var(--bg-primary)',
                color: 'var(--text-secondary)',
              }}
            >
              {parentFolder}
            </span>
          )}
          <span
            className="px-2.5 py-1 rounded-lg text-xs font-medium"
            style={{ background: diffStyle.bg, color: diffStyle.color }}
          >
            {file.metadata.difficulty}
          </span>
          <span
            className="px-2.5 py-1 rounded-lg text-xs font-medium"
            style={{
              background: 'var(--bg-primary)',
              color: 'var(--text-secondary)',
            }}
          >
            {(LANGUAGE_MAP[file.language] || file.language).toUpperCase()}
          </span>
        </div>

        {/* Complexity */}
        {(file.metadata.time_complexity || file.metadata.space_complexity) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            {file.metadata.time_complexity && (
              <div>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Time Complexity:
                </span>
                <span
                  className="ml-2 font-mono font-semibold text-sm"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {file.metadata.time_complexity}
                </span>
              </div>
            )}
            {file.metadata.space_complexity && (
              <div>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Space Complexity:
                </span>
                <span
                  className="ml-2 font-mono font-semibold text-sm"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {file.metadata.space_complexity}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {file.metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {file.metadata.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded text-xs font-medium"
                style={{
                  background: 'var(--bg-primary)',
                  color: 'var(--text-secondary)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* External Links */}
        <div className="flex gap-4">
          {file.metadata.leetcode_link && (
            <a
              href={file.metadata.leetcode_link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-xs"
              style={{ color: 'var(--accent-primary)' }}
            >
              View on LeetCode →
            </a>
          )}
          <a
            href={file.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-xs"
            style={{ color: 'var(--text-secondary)' }}
          >
            View on GitHub →
          </a>
        </div>
      </div>

      {/* Content Viewer */}
      {isMarkdown ? (
        <div
          className="rounded-lg border p-6"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--bg-secondary)',
          }}
        >
          <MarkdownRenderer content={file.code} />
        </div>
      ) : (
        <div
          className="rounded-lg overflow-hidden border"
          style={{ borderColor: 'var(--border)' }}
        >
          <div
            className="px-4 py-2.5 flex items-center justify-between border-b"
            style={{
              background: 'var(--bg-secondary)',
              borderColor: 'var(--border)',
            }}
          >
            <span className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
              {file.file_name}
            </span>
            <button
              onClick={handleCopy}
              className="text-xs transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)'
              }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <SyntaxHighlighter
            language={LANGUAGE_MAP[file.language] || 'text'}
            style={isDark ? oneDark : oneLight}
            showLineNumbers
            customStyle={{
              margin: 0,
              borderRadius: 0,
              fontSize: '13px',
            }}
          >
            {file.code}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  )
}
