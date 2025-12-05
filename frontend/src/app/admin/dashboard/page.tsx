'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService, User } from '@/lib/auth'
import { api, ContentFile } from '@/lib/api'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [section, setSection] = useState<'blog' | 'project' | 'case-study'>('blog')
  const [content, setContent] = useState<ContentFile[]>([])
  const [selectedItem, setSelectedItem] = useState<ContentFile | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user) {
      loadContent()
    }
  }, [section, user])

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
    } catch (error) {
      authService.removeToken()
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  const loadContent = async () => {
    try {
      const data = await api.content.list(section, false) // Load all, not just published
      setContent(data)
    } catch (error) {
      console.error('Failed to load content:', error)
    }
  }

  const handleLogout = () => {
    authService.logout()
    router.push('/admin/login')
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const token = authService.getToken()

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(
        `${API_BASE}/content/upload?section=${section}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      )

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      await loadContent()
      e.target.value = '' // Reset input
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return

    const token = authService.getToken()
    try {
      const response = await fetch(`${API_BASE}/content/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Delete failed')
      }

      await loadContent()
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete content')
    }
  }

  const handleTogglePublish = async (item: ContentFile) => {
    const token = authService.getToken()
    try {
      const response = await fetch(`${API_BASE}/content/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_published: !item.is_published,
          published_at: !item.is_published ? new Date().toISOString() : null,
        }),
      })

      if (!response.ok) {
        throw new Error('Update failed')
      }

      await loadContent()
    } catch (error) {
      console.error('Update error:', error)
      alert('Failed to update content')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Admin Dashboard
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Welcome, {user?.full_name}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/"
                className="text-sm font-medium transition-colors duration-200 hover:text-[var(--energy-600)]"
                style={{ color: 'var(--energy-500)' }}
              >
                View Site
              </a>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90 hover:shadow-md"
                style={{
                  backgroundColor: 'var(--sand-700)',
                  color: 'var(--sand-50)',
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Section Tabs */}
        <div className="flex gap-3 mb-6">
          {(['blog', 'project', 'case-study'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                section === s
                  ? 'shadow-lg transform scale-105'
                  : 'hover:transform hover:scale-102 hover:shadow-md'
              }`}
              style={
                section === s
                  ? {
                      background: 'linear-gradient(135deg, var(--energy-500), var(--energy-600))',
                      color: '#ffffff',
                      border: 'none',
                    }
                  : {
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-secondary)',
                      border: '2px solid var(--border)',
                    }
              }
            >
              {s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Upload Section */}
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Upload New {section.charAt(0).toUpperCase() + section.slice(1).replace('-', ' ')}
          </h2>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".md"
              onChange={handleUpload}
              disabled={uploading}
              className="flex-1"
              style={{ color: 'var(--text-primary)' }}
            />
            {uploading && <span style={{ color: 'var(--text-muted)' }}>Uploading...</span>}
          </div>
        </div>

        {/* Content List */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Manage Content ({content.length} items)
          </h2>

          {content.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No content found. Upload your first file above.</p>
          ) : (
            <div className="space-y-4">
              {content.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-lg border-2 transition-all duration-300 hover:shadow-lg hover:border-[var(--energy-500)] hover:transform hover:scale-[1.01]"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                        {item.metajson.title || item.filename}
                      </h3>
                      <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                        {item.metajson.summary || 'No summary'}
                      </p>
                      <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                        <span>Slug: {item.metajson.slug}</span>
                        <span>•</span>
                        <span>{item.is_published ? '✅ Published' : '⏸️ Draft'}</span>
                        {item.published_at && (
                          <>
                            <span>•</span>
                            <span>{new Date(item.published_at).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleTogglePublish(item)}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md hover:scale-105"
                        style={{
                          backgroundColor: item.is_published ? 'rgba(34, 197, 94, 0.15)' : 'rgba(249, 115, 22, 0.15)',
                          color: item.is_published ? '#22c55e' : '#f97316',
                          border: `2px solid ${item.is_published ? '#22c55e' : '#f97316'}`,
                        }}
                      >
                        {item.is_published ? '⏸️ Unpublish' : '✅ Publish'}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md hover:scale-105 hover:bg-red-600 hover:text-white"
                        style={{
                          backgroundColor: 'rgba(239, 68, 68, 0.15)',
                          color: '#ef4444',
                          border: '2px solid #ef4444',
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
