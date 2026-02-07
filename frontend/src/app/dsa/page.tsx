'use client'

export default function DSAPage() {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="text-center max-w-md">
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
        <h2
          className="text-xl font-semibold mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          DSA Problem Showcase
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Select a file from the sidebar to view its content.
        </p>
      </div>
    </div>
  )
}
