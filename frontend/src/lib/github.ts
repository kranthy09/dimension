const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

// A single node in the flat tree from the API
export interface TreeItem {
  path: string
  type: 'blob' | 'tree'
  sha: string
  size: number | null
}

// A nested node built client-side for the explorer
export interface TreeNode {
  name: string
  path: string
  type: 'blob' | 'tree'
  size: number | null
  children: TreeNode[]
}

export interface FileDetail {
  path: string
  name: string
  file_name: string
  code: string
  language: string
  size: number
  sha: string
  github_url: string
  metadata: {
    difficulty: string
    tags: string[]
    time_complexity: string | null
    space_complexity: string | null
    leetcode_link: string | null
  }
}

export interface TreeResponse {
  tree: TreeItem[]
}

// Dashboard stats
export interface DsaStats {
  total_problems: number
  difficulty: { easy: number; medium: number; hard: number }
  today: number
  this_week: number
  current_streak: number
  topics: { name: string; count: number; last_file: string; last_updated: string }[]
  activity: { date: string; count: number }[]
  weekly_performance: { week_start: string; label: string; total: number }[]
  recent: {
    filename: string
    path: string
    difficulty: string
    tags: string[]
    committed_at: string
    message: string
    folder: string
  }[]
}

// Fetch aggregated DSA dashboard stats
export async function fetchStats(): Promise<DsaStats> {
  const response = await fetch(`${API_BASE}/github/dsa/stats`)
  console.log("response: ", response)
  if (!response.ok) throw new Error('Failed to fetch DSA stats')
  return response.json()
}

// Fetch the flat tree from the API
export async function fetchTree(): Promise<TreeResponse> {
  const response = await fetch(`${API_BASE}/github/dsa/tree`)
  if (!response.ok) throw new Error('Failed to fetch repository tree')
  return response.json()
}

// Fetch a single file's content by path
export async function fetchFileContent(filePath: string): Promise<FileDetail> {
  const response = await fetch(`${API_BASE}/github/dsa/file/${filePath}`)
  if (!response.ok) throw new Error('Failed to fetch file content')
  return response.json()
}

// Fetch the latest committed file under solutions/
export async function fetchLatestFile(): Promise<
  FileDetail & { commit_date?: string; commit_message?: string }
> {
  const response = await fetch(`${API_BASE}/github/dsa/latest`)
  if (!response.ok) throw new Error('Failed to fetch latest file')
  return response.json()
}

// Check GitHub API health
export async function checkGitHubHealth() {
  const response = await fetch(`${API_BASE}/github/health`)
  if (!response.ok) throw new Error('GitHub connection check failed')
  return response.json()
}

// ── Client-side tree builder ──
// Converts the flat list from the API into a nested tree structure.
export function buildTree(items: TreeItem[]): TreeNode[] {
  const root: TreeNode[] = []
  const map = new Map<string, TreeNode>()

  const sorted = [...items].sort((a, b) => a.path.localeCompare(b.path))

  for (const item of sorted) {
    const segments = item.path.split('/')
    const name = segments[segments.length - 1]
    const node: TreeNode = {
      name,
      path: item.path,
      type: item.type,
      size: item.size,
      children: [],
    }
    map.set(item.path, node)

    if (segments.length === 1) {
      root.push(node)
    } else {
      const parentPath = segments.slice(0, -1).join('/')
      const parent = map.get(parentPath)
      if (parent) {
        parent.children.push(node)
      } else {
        root.push(node)
      }
    }
  }

  // Sort each level: folders first, then alphabetical
  const sortChildren = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'tree' ? -1 : 1
      return a.name.localeCompare(b.name)
    })
    nodes.forEach((n) => sortChildren(n.children))
  }
  sortChildren(root)

  return root
}
