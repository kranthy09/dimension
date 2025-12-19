'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService, User } from '@/lib/auth'
import { api } from '@/lib/api'

type Section = 'blog' | 'project' | 'case-study'

export default function UploadPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [section, setSection] = useState<Section>('blog')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

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
    } catch (error) {
      authService.removeToken()
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setMessage('Please select a file')
      return
    }

    const token = authService.getToken()
    if (!token) {
      router.push('/admin/login')
      return
    }

    setUploading(true)
    setMessage('')

    try {
      // Use the centralized API client
      const result = await api.content.upload(section, file, token)
      setMessage(`✅ Uploaded: ${result.metajson.title}`)
      setFile(null)

      const fileInput = document.getElementById('file-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Upload failed'}`)
    } finally {
      setUploading(false)
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
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Upload Content
            </h1>
            <div className="flex items-center gap-4">
              <a
                href="/admin/dashboard"
                className="text-sm font-medium transition-colors duration-200 hover:text-[var(--energy-600)]"
                style={{ color: 'var(--energy-500)' }}
              >
                ← Dashboard
              </a>
              <a
                href="/"
                className="text-sm font-medium transition-colors duration-200 hover:text-[var(--energy-600)]"
                style={{ color: 'var(--energy-500)' }}
              >
                View Site
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Content Section
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value as Section)}
                className="w-full px-4 py-2 rounded-lg"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="blog">Blog</option>
                <option value="project">Project</option>
                <option value="case-study">Case Study</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Markdown File (.md)
              </label>
              <input
                id="file-input"
                type="file"
                accept=".md"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 rounded-lg"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
              {file && (
                <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                  Selected: {file.name}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={uploading || !file}
              className="btn-primary w-full"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>

            {message && (
              <div
                className="p-4 rounded-lg text-sm"
                style={{
                  backgroundColor: message.startsWith('✅')
                    ? 'rgba(34, 197, 94, 0.1)'
                    : 'rgba(239, 68, 68, 0.1)',
                  color: message.startsWith('✅') ? '#22c55e' : '#ef4444',
                  border: message.startsWith('✅')
                    ? '1px solid rgba(34, 197, 94, 0.3)'
                    : '1px solid rgba(239, 68, 68, 0.3)',
                }}
              >
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
