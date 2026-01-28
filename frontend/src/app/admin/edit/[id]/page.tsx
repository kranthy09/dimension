'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { authService, User } from '@/lib/auth'
import { api, ContentFile } from '@/lib/api'
import { ImageUpload } from '@/components/admin/ImageUpload'

export default function EditContentPage() {
  const params = useParams()
  const router = useRouter()
  const contentId = params.id as string

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState<ContentFile | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = authService.getToken()
    if (!token) {
      router.push('/admin/login')
      return
    }

    try {
      const userData = await authService.getCurrentUser(token)
      if (!userData.is_admin) {
        router.push('/admin/login')
        return
      }
      setUser(userData)
      await loadContent()
    } catch (error) {
      authService.removeToken()
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  const loadContent = async () => {
    try {
      // Extract section and slug from the content to fetch it
      // For now, we'll fetch by iterating through sections
      // A better approach would be to have a direct endpoint by ID
      const sections = ['blog', 'project', 'case-study'] as const

      for (const section of sections) {
        try {
          const token = authService.getToken()
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/content/${section}?published_only=false`,
            {
              headers: token ? { Authorization: `Bearer ${token}` } : {}
            }
          )
          if (response.ok) {
            const items = await response.json()
            const found = items.find((item: ContentFile) => item.id === contentId)
            if (found) {
              setContent(found)
              return
            }
          }
        } catch (err) {
          // Continue to next section
        }
      }
      throw new Error('Content not found')
    } catch (error) {
      console.error('Failed to load content:', error)
      router.push('/admin/dashboard')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    )
  }

  if (!content) {
    return null
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Edit Content
            </h1>
            <a
              href="/admin/dashboard"
              className="text-sm font-medium transition-colors duration-200 hover:text-[var(--energy-600)]"
              style={{ color: 'var(--energy-500)' }}
            >
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Metadata Panel */}
          <div className="card p-8">
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Content Info
            </h2>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-semibold" style={{ color: 'var(--energy-500)' }}>
                  Section:
                </span>
                <span className="ml-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  {content.section}
                </span>
              </div>
              {Object.entries(content.metajson).map(([key, value]) => (
                <div key={key}>
                  <span className="text-sm font-semibold" style={{ color: 'var(--energy-500)' }}>
                    {key}:
                  </span>
                  <span className="ml-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                    {Array.isArray(value) ? value.join(', ') : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Image Upload Panel */}
          <div className="card p-8">
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Upload Images
            </h2>
            <ImageUpload contentId={contentId} />
          </div>
        </div>
      </div>
    </div>
  )
}
