'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { authService } from '@/lib/auth'

interface UploadedImage {
  filename: string
  path: string
  relative_path: string
}

interface ImageUploadProps {
  contentId: string
  onUploadComplete?: (images: UploadedImage[]) => void
}

export function ImageUpload({ contentId, onUploadComplete }: ImageUploadProps) {
  const [images, setImages] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])

  const handleImageUpload = async () => {
    if (images.length === 0) {
      setMessage('Please select images to upload')
      return
    }

    const token = authService.getToken()
    if (!token) {
      setMessage('Authentication required')
      return
    }

    setUploading(true)
    setMessage('')

    try {
      const result = await api.content.uploadImages(contentId, images, token)
      setUploadedImages(prev => [...prev, ...result])
      setMessage(`✅ Uploaded ${result.length} image(s)`)
      setImages([])

      const imageInput = document.getElementById('image-input') as HTMLInputElement
      if (imageInput) imageInput.value = ''

      if (onUploadComplete) {
        onUploadComplete(result)
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Upload failed'}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
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
        disabled={uploading || images.length === 0}
        className="btn-primary w-full"
      >
        {uploading ? 'Uploading...' : 'Upload Images'}
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
  )
}
