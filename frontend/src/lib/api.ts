const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export interface ContentFile {
  id: string
  section: string
  filename: string
  file_path: string
  metajson: Record<string, any>
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface MarkdownContent {
  content: string
  metajson: Record<string, any>
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      next: { revalidate: 60 }, // Cache for 60 seconds
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }))
      throw new Error(error.detail || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Content Operations
  content = {
    list: async (
      section: 'blog' | 'project' | 'case-study',
      publishedOnly: boolean = true
    ): Promise<ContentFile[]> => {
      return this.request(`/content/${section}?published_only=${publishedOnly}`)
    },

    get: async (
      section: 'blog' | 'project' | 'case-study',
      slug: string
    ): Promise<ContentFile> => {
      return this.request(`/content/${section}/${slug}`)
    },

    getMarkdown: async (
      section: 'blog' | 'project' | 'case-study',
      slug: string
    ): Promise<string> => {
      const data = await this.request<MarkdownContent>(
        `/content/${section}/${slug}/markdown`
      )
      return data.content
    },

    upload: async (
      section: 'blog' | 'project' | 'case-study',
      file: File
    ): Promise<ContentFile> => {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(
        `${this.baseUrl}/content/upload?section=${section}`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Upload failed' }))
        throw new Error(error.detail)
      }

      return response.json()
    },

    update: async (
      contentId: string,
      data: Partial<ContentFile>
    ): Promise<ContentFile> => {
      return this.request(`/content/${contentId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
    },

    delete: async (contentId: string): Promise<void> => {
      return this.request(`/content/${contentId}`, {
        method: 'DELETE',
      })
    },
  }
}

export const api = new ApiClient()
