'use client'

import { useState, useEffect, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { fetchTree, buildTree, type TreeNode } from '@/lib/github'
import Link from 'next/link'

function FolderIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
      />
    </svg>
  ) : (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
      />
    </svg>
  )
}

function FileIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
      />
    </svg>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

function TreeNodeRow({
  node,
  depth,
  expandedPaths,
  toggleExpand,
  activePath,
  onFileClick,
}: {
  node: TreeNode
  depth: number
  expandedPaths: Set<string>
  toggleExpand: (path: string) => void
  activePath: string | null
  onFileClick?: () => void
}) {
  const isFolder = node.type === 'tree'
  const isOpen = expandedPaths.has(node.path)
  const isActive = activePath === node.path

  if (isFolder) {
    return (
      <>
        <button
          onClick={() => toggleExpand(node.path)}
          className="w-full flex items-center gap-1.5 py-1.5 px-2 rounded transition-colors text-sm"
          style={{
            paddingLeft: `${depth * 1 + 0.5}rem`,
            color: 'var(--text-primary)',
            background: 'transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-secondary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <ChevronIcon open={isOpen} />
          <FolderIcon open={isOpen} />
          <span className="font-medium truncate">{node.name}</span>
        </button>
        {isOpen &&
          node.children.map((child) => (
            <TreeNodeRow
              key={child.path}
              node={child}
              depth={depth + 1}
              expandedPaths={expandedPaths}
              toggleExpand={toggleExpand}
              activePath={activePath}
              onFileClick={onFileClick}
            />
          ))}
      </>
    )
  }

  return (
    <Link
      href={`/dsa/${encodeURIComponent(node.path)}`}
      onClick={onFileClick}
      className="flex items-center gap-1.5 py-1.5 px-2 rounded transition-colors text-sm"
      style={{
        paddingLeft: `${depth * 1 + 0.5 + 0.75}rem`,
        color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
        background: isActive ? 'rgba(255, 107, 53, 0.1)' : 'transparent',
        fontWeight: isActive ? 600 : 400,
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = 'var(--bg-secondary)'
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = 'transparent'
      }}
    >
      <FileIcon />
      <span className="truncate">{node.name}</span>
    </Link>
  )
}

export default function DSALayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const [tree, setTree] = useState<TreeNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Derive active file path from URL
  const activePath = useMemo(() => {
    if (pathname === '/dsa' || pathname === '/dsa/') return null
    const segment = pathname.replace('/dsa/', '')
    return decodeURIComponent(segment)
  }, [pathname])

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await fetchTree()
        const nested = buildTree(data.tree)
        setTree(nested)
        setExpandedPaths(new Set(nested.filter((n) => n.type === 'tree').map((n) => n.path)))
        setError(null)
      } catch {
        setError('Failed to load repository tree.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const toggleExpand = (path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return tree
    const q = searchQuery.toLowerCase()

    function filterNode(node: TreeNode): TreeNode | null {
      if (node.type === 'blob') {
        return node.name.toLowerCase().includes(q) ? node : null
      }
      const filteredChildren = node.children
        .map(filterNode)
        .filter(Boolean) as TreeNode[]
      if (filteredChildren.length === 0) return null
      return { ...node, children: filteredChildren }
    }

    return tree.map(filterNode).filter(Boolean) as TreeNode[]
  }, [tree, searchQuery])

  const displayExpanded = useMemo(() => {
    if (!searchQuery.trim()) return expandedPaths
    const all = new Set<string>()
    function collectFolders(nodes: TreeNode[]) {
      for (const n of nodes) {
        if (n.type === 'tree') {
          all.add(n.path)
          collectFolders(n.children)
        }
      }
    }
    collectFolders(filteredTree)
    return all
  }, [filteredTree, searchQuery, expandedPaths])

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <input
          type="text"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-1"
          style={{
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            borderColor: 'var(--border)',
          }}
        />
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-2 px-1">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div
              className="animate-spin rounded-full h-6 w-6 border-b-2"
              style={{ borderColor: 'var(--accent-primary)' }}
            />
          </div>
        ) : error ? (
          <div className="text-center py-8 px-3">
            <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm font-medium"
              style={{ color: 'var(--accent-primary)' }}
            >
              Retry
            </button>
          </div>
        ) : filteredTree.length === 0 ? (
          <div className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>
            {searchQuery ? 'No files match your search.' : 'Repository is empty.'}
          </div>
        ) : (
          filteredTree.map((node) => (
            <TreeNodeRow
              key={node.path}
              node={node}
              depth={0}
              expandedPaths={displayExpanded}
              toggleExpand={toggleExpand}
              activePath={activePath}
              onFileClick={() => setSidebarOpen(false)}
            />
          ))
        )}
      </div>
    </div>
  )

  return (
    <div
      className="flex pt-16"
      style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}
    >
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col border-r flex-shrink-0"
        style={{
          width: '280px',
          borderColor: 'var(--border)',
          background: 'var(--bg-secondary)',
          height: 'calc(100vh - 4rem)',
          position: 'sticky',
          top: '4rem',
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className="fixed top-16 left-0 bottom-0 z-50 flex flex-col border-r lg:hidden"
            style={{
              width: '280px',
              borderColor: 'var(--border)',
              background: 'var(--bg-secondary)',
            }}
          >
            {sidebarContent}
          </aside>
        </>
      )}

      {/* Mobile toggle button */}
      <button
        className="fixed top-20 left-4 z-30 lg:hidden p-2 rounded-lg border shadow-sm"
        style={{
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border)',
          color: 'var(--text-secondary)',
        }}
        onClick={() => setSidebarOpen(true)}
        aria-label="Open file tree"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
      </button>

      {/* Content area */}
      <main className="flex-1 min-w-0 overflow-y-auto" style={{ height: 'calc(100vh - 4rem)' }}>
        {children}
      </main>
    </div>
  )
}
