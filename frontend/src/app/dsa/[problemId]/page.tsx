'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { fetchFileContent, type FileDetail } from '@/lib/github'
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer'

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

export default function ProblemDetailPage() {
  const params = useParams()
  const problemId = params?.problemId as string

  const [problem, setProblem] = useState<FileDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isDark, setIsDark] = useState(false)

  const filePath = problemId ? decodeURIComponent(problemId) : ''
  const pathSegments = filePath.split('/')
  const parentFolder = pathSegments.length > 1 ? pathSegments.slice(0, -1).join(' / ') : null

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
    if (!filePath) return

    async function loadProblem() {
      try {
        setLoading(true)
        const data = await fetchFileContent(filePath)
        setProblem(data)
        setError(null)
      } catch {
        setError('Failed to load file. It may not exist.')
      } finally {
        setLoading(false)
      }
    }

    loadProblem()
  }, [filePath])

  const handleCopy = async () => {
    if (!problem) return
    await navigator.clipboard.writeText(problem.code)
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
          Fetching file ...
        </p>
      </div>
    )
  }

  if (error || !problem) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2
            className="text-xl font-bold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            File Not Found
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {error}
          </p>
        </div>
      </div>
    )
  }

  const diffStyle =
    DIFFICULTY_STYLES[problem.metadata.difficulty] || DIFFICULTY_STYLES.Medium
  const isMarkdown = MD_EXTENSIONS.has(problem.language)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Problem Header */}
      <div
        className="rounded-lg p-6 mb-6 border"
        style={{
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border)',
        }}
      >
        <h1
          className="text-2xl font-bold mb-3"
          style={{ color: 'var(--text-primary)' }}
        >
          {problem.name}
        </h1>

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
            {problem.metadata.difficulty}
          </span>
          <span
            className="px-2.5 py-1 rounded-lg text-xs font-medium"
            style={{
              background: 'var(--bg-primary)',
              color: 'var(--text-secondary)',
            }}
          >
            {(LANGUAGE_MAP[problem.language] || problem.language).toUpperCase()}
          </span>
        </div>

        {/* Complexity */}
        {(problem.metadata.time_complexity ||
          problem.metadata.space_complexity) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              {problem.metadata.time_complexity && (
                <div>
                  <span
                    className="text-xs"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Time Complexity:
                  </span>
                  <span
                    className="ml-2 font-mono font-semibold text-sm"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {problem.metadata.time_complexity}
                  </span>
                </div>
              )}
              {problem.metadata.space_complexity && (
                <div>
                  <span
                    className="text-xs"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Space Complexity:
                  </span>
                  <span
                    className="ml-2 font-mono font-semibold text-sm"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {problem.metadata.space_complexity}
                  </span>
                </div>
              )}
            </div>
          )}

        {/* Tags */}
        {problem.metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {problem.metadata.tags.map((tag) => (
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
          {problem.metadata.leetcode_link && (
            <a
              href={problem.metadata.leetcode_link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-xs"
              style={{ color: 'var(--accent-primary)' }}
            >
              View on LeetCode →
            </a>
          )}
          <a
            href={problem.github_url}
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
          <MarkdownRenderer content={problem.code} />
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
            <span
              className="font-mono text-xs"
              style={{ color: 'var(--text-secondary)' }}
            >
              {problem.file_name}
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
            language={LANGUAGE_MAP[problem.language] || 'text'}
            style={isDark ? oneDark : oneLight}
            showLineNumbers
            customStyle={{
              margin: 0,
              borderRadius: 0,
              fontSize: '13px',
            }}
          >
            {problem.code}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  )
}
