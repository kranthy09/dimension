'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authService, User } from '@/lib/auth'
import { api } from '@/lib/api'

type Section = 'blog' | 'project' | 'case-study'

interface UploadedContent {
  id: string
  metajson: Record<string, any>
}

interface UploadedImage {
  filename: string
  path: string
  relative_path: string
}

export default function UploadPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [section, setSection] = useState<Section>('blog')
  const [file, setFile] = useState<File | null>(null)
  const [images, setImages] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [message, setMessage] = useState('')
  const [uploadedContent, setUploadedContent] = useState<UploadedContent | null>(null)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])

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
      setUploadedContent(result)
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

  const handleImageUpload = async () => {
    if (!uploadedContent || images.length === 0) {
      setMessage('Please upload markdown file first and select images')
      return
    }

    const token = authService.getToken()
    if (!token) {
      router.push('/admin/login')
      return
    }

    setUploadingImages(true)
    setMessage('')

    try {
      const result = await api.content.uploadImages(
        uploadedContent.id,
        images,
        token
      )
      setUploadedImages(result)
      setMessage(`✅ Uploaded ${result.length} image(s)`)
      setImages([])

      const imageInput = document.getElementById('image-input') as HTMLInputElement
      if (imageInput) imageInput.value = ''
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Image upload failed'}`)
    } finally {
      setUploadingImages(false)
    }
  }

  const handleReset = () => {
    setUploadedContent(null)
    setUploadedImages([])
    setFile(null)
    setImages([])
    setMessage('')
    const fileInput = document.getElementById('file-input') as HTMLInputElement
    const imageInput = document.getElementById('image-input') as HTMLInputElement
    if (fileInput) fileInput.value = ''
    if (imageInput) imageInput.value = ''
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

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Form */}
          <div className="card p-8">
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              1. Upload Markdown
            </h2>
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
                  disabled={!!uploadedContent}
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
                  disabled={!!uploadedContent}
                />
                {file && (
                  <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                    Selected: {file.name}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={uploading || !file || !!uploadedContent}
                className="btn-primary w-full"
              >
                {uploading ? 'Uploading...' : 'Upload Markdown'}
              </button>
            </form>

            {/* Image Upload Section */}
            {uploadedContent && (
              <div className="mt-8 pt-8 border-t" style={{ borderColor: 'var(--border)' }}>
                <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                  2. Upload Images
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Image Files (Multiple)
                    </label>
                    <input
                      id="image-input"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => setImages(Array.from(e.target.files || []))}
                      className="w-full px-4 py-2 rounded-lg"
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                      }}
                    />
                    {images.length > 0 && (
                      <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                        Selected: {images.length} image(s)
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleImageUpload}
                    disabled={uploadingImages || images.length === 0}
                    className="btn-primary w-full"
                  >
                    {uploadingImages ? 'Uploading...' : 'Upload Images'}
                  </button>
                </div>
              </div>
            )}

            {/* Reset Button */}
            {uploadedContent && (
              <button
                onClick={handleReset}
                className="mt-6 w-full px-4 py-2 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                }}
              >
                Reset & Upload New Content
              </button>
            )}

            {message && (
              <div
                className="mt-6 p-4 rounded-lg text-sm"
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
          </div>

          {/* Preview Panel */}
          <div className="card p-8">
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Preview
            </h2>

            {!uploadedContent ? (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Upload a markdown file to see preview
              </p>
            ) : (
              <div className="space-y-6">
                {/* Metadata Preview */}
                <div>
                  <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    Metadata
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(uploadedContent.metajson).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="font-medium" style={{ color: 'var(--energy-500)' }}>
                          {key}:
                        </span>
                        <span className="ml-2" style={{ color: 'var(--text-muted)' }}>
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Uploaded Images Preview */}
                {uploadedImages.length > 0 && (
                  <div className="pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                    <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                      Uploaded Images ({uploadedImages.length})
                    </h3>
                    <div className="space-y-2">
                      {uploadedImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg"
                          style={{
                            backgroundColor: 'var(--bg-secondary)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                            {img.filename}
                          </div>
                          <div className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                            ./{img.relative_path}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 rounded-lg" style={{
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                    }}>
                      <p className="text-xs" style={{ color: '#22c55e' }}>
                        Use these paths in your markdown: <code>![alt](./images/filename.png)</code>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
