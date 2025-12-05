# Portfolio Frontend - Next.js Complete Implementation

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home page
│   │   │
│   │   ├── blog/
│   │   │   ├── page.tsx         # Blog list
│   │   │   └── [slug]/
│   │   │       └── page.tsx     # Blog detail
│   │   │
│   │   ├── projects/
│   │   │   ├── page.tsx         # Projects list
│   │   │   └── [slug]/
│   │   │       └── page.tsx     # Project detail
│   │   │
│   │   ├── case-studies/
│   │   │   ├── page.tsx         # Case studies list
│   │   │   └── [slug]/
│   │   │       └── page.tsx     # Case study detail
│   │   │
│   │   └── admin/
│   │       └── upload/
│   │           └── page.tsx     # Upload interface
│   │
│   ├── components/
│   │   ├── content/
│   │   │   ├── MarkdownRenderer.tsx
│   │   │   ├── ContentCard.tsx
│   │   │   └── ContentHeader.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Container.tsx
│   │   │
│   │   └── ui/
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       └── Input.tsx
│   │
│   ├── lib/
│   │   ├── api.ts               # API client
│   │   └── utils.ts             # Utilities
│   │
│   └── styles/
│       └── globals.css          # Global styles
│
├── public/
│   └── images/
│
├── package.json
├── tsconfig.json
├── next.config.js
└── tailwind.config.ts
```

---

## 1. API Client (`src/lib/api.ts`)

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export interface ContentFile {
  id: string
  section: string
  filename: string
  file_path: string
  metadata: Record<string, any>
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface MarkdownContent {
  content: string
  metadata: Record<string, any>
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
```

---

## 2. Markdown Renderer (`src/components/content/MarkdownRenderer.tsx`)

```typescript
'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-neutral dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            return !inline && match ? (
              <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            )
          },
          h1: ({ children }) => (
            <h1 className="text-4xl font-bold mt-8 mb-4">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-3xl font-semibold mt-6 mb-3">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-2xl font-semibold mt-5 mb-2">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="my-4 leading-7">{children}</p>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-blue-600 dark:text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="my-4 ml-6 list-disc">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 ml-6 list-decimal">{children}</ol>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 italic my-4">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
```

---

## 3. UI Components

### Badge (`src/components/ui/Badge.tsx`)

```typescript
interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'outline' | 'subtle'
  className?: string
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-blue-600 text-white',
    outline: 'border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300',
    subtle: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
```

### Button (`src/components/ui/Button.tsx`)

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    outline: 'border border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      className={`
        rounded-md font-medium transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}
```

### Container (`src/components/layout/Container.tsx`)

```typescript
interface ContainerProps {
  children: React.ReactNode
  className?: string
}

export function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  )
}
```

---

## 4. Content Components

### Content Card (`src/components/content/ContentCard.tsx`)

```typescript
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { ContentFile } from '@/lib/api'

interface ContentCardProps {
  content: ContentFile
  basePath: string
}

export function ContentCard({ content, basePath }: ContentCardProps) {
  const { slug, title, summary, category, tags, readTime } = content.metadata

  return (
    <Link
      href={`${basePath}/${slug}`}
      className="group block"
    >
      <article className="
        border border-gray-200 dark:border-gray-800 rounded-lg p-6
        hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700
        transition-all duration-200
      ">
        <div className="flex items-start justify-between mb-3">
          {category && <Badge variant="outline">{category}</Badge>}
          {readTime && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {readTime} min read
            </span>
          )}
        </div>

        <h2 className="text-2xl font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {title}
        </h2>

        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {summary}
        </p>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag: string) => (
              <Badge key={tag} variant="subtle">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {content.published_at && (
          <time className="block mt-4 text-sm text-gray-500 dark:text-gray-400">
            {new Date(content.published_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        )}
      </article>
    </Link>
  )
}
```

### Content Header (`src/components/content/ContentHeader.tsx`)

```typescript
import { Badge } from '@/components/ui/Badge'

interface ContentHeaderProps {
  title: string
  summary: string
  category?: string
  tags?: string[]
  readTime?: number
  publishedAt?: string
}

export function ContentHeader({
  title,
  summary,
  category,
  tags,
  readTime,
  publishedAt,
}: ContentHeaderProps) {
  return (
    <header className="mb-12">
      {category && <Badge variant="outline">{category}</Badge>}
      
      <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-3">
        {title}
      </h1>
      
      <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">
        {summary}
      </p>

      <div className="flex flex-wrap gap-4 mt-6 text-sm text-gray-500 dark:text-gray-400">
        {readTime && <span>{readTime} min read</span>}
        {readTime && publishedAt && <span>•</span>}
        {publishedAt && (
          <time>
            {new Date(publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        )}
      </div>

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {tags.map((tag) => (
            <Badge key={tag} variant="subtle">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </header>
  )
}
```

---

## 5. Layout Components

### Header (`src/components/layout/Header.tsx`)

```typescript
import Link from 'next/link'
import { Container } from './Container'

export function Header() {
  return (
    <header className="border-b border-gray-200 dark:border-gray-800">
      <Container>
        <nav className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold">
            Portfolio
          </Link>

          <div className="flex gap-6">
            <Link
              href="/blog"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/projects"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            >
              Projects
            </Link>
            <Link
              href="/case-studies"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            >
              Case Studies
            </Link>
          </div>
        </nav>
      </Container>
    </header>
  )
}
```

### Footer (`src/components/layout/Footer.tsx`)

```typescript
import { Container } from './Container'

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 mt-20">
      <Container>
        <div className="py-8 text-center text-gray-600 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} Portfolio. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  )
}
```

---

## 6. Pages

### Root Layout (`src/app/layout.tsx`)

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Personal portfolio and blog',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

### Home Page (`src/app/page.tsx`)

```typescript
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function Home() {
  return (
    <Container className="py-20">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Welcome to My Portfolio
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Exploring ideas through writing, building projects, and sharing insights
          from real-world problem solving.
        </p>

        <div className="flex gap-4 justify-center">
          <Link href="/blog">
            <Button size="lg">Read Blog</Button>
          </Link>
          <Link href="/projects">
            <Button size="lg" variant="outline">View Projects</Button>
          </Link>
        </div>
      </div>
    </Container>
  )
}
```

### Blog List (`src/app/blog/page.tsx`)

```typescript
import { api } from '@/lib/api'
import { Container } from '@/components/layout/Container'
import { ContentCard } from '@/components/content/ContentCard'

export const revalidate = 60 // Revalidate every 60 seconds

export default async function BlogPage() {
  const posts = await api.content.list('blog')

  return (
    <Container className="py-16">
      <h1 className="text-4xl font-bold mb-12">Blog</h1>

      <div className="grid gap-8">
        {posts.map((post) => (
          <ContentCard key={post.id} content={post} basePath="/blog" />
        ))}
      </div>

      {posts.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 py-12">
          No blog posts yet. Check back soon!
        </p>
      )}
    </Container>
  )
}
```

### Blog Detail (`src/app/blog/[slug]/page.tsx`)

```typescript
import { api } from '@/lib/api'
import { Container } from '@/components/layout/Container'
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer'
import { ContentHeader } from '@/components/content/ContentHeader'
import { notFound } from 'next/navigation'

interface Props {
  params: { slug: string }
}

export const revalidate = 60

export default async function BlogPost({ params }: Props) {
  try {
    const content = await api.content.get('blog', params.slug)
    const markdown = await api.content.getMarkdown('blog', params.slug)

    const { title, summary, category, tags, readTime } = content.metadata

    return (
      <Container className="max-w-4xl py-16">
        <ContentHeader
          title={title}
          summary={summary}
          category={category}
          tags={tags}
          readTime={readTime}
          publishedAt={content.published_at || undefined}
        />

        <MarkdownRenderer content={markdown} />
      </Container>
    )
  } catch (error) {
    notFound()
  }
}
```

### Projects List (`src/app/projects/page.tsx`)

```typescript
import { api } from '@/lib/api'
import { Container } from '@/components/layout/Container'
import { ContentCard } from '@/components/content/ContentCard'

export const revalidate = 60

export default async function ProjectsPage() {
  const projects = await api.content.list('project')

  return (
    <Container className="py-16">
      <h1 className="text-4xl font-bold mb-12">Projects</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {projects.map((project) => (
          <ContentCard key={project.id} content={project} basePath="/projects" />
        ))}
      </div>

      {projects.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 py-12">
          No projects yet. Check back soon!
        </p>
      )}
    </Container>
  )
}
```

### Project Detail (`src/app/projects/[slug]/page.tsx`)

```typescript
import { api } from '@/lib/api'
import { Container } from '@/components/layout/Container'
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer'
import { ContentHeader } from '@/components/content/ContentHeader'
import { Badge } from '@/components/ui/Badge'
import { notFound } from 'next/navigation'

interface Props {
  params: { slug: string }
}

export const revalidate = 60

export default async function ProjectPage({ params }: Props) {
  try {
    const content = await api.content.get('project', params.slug)
    const markdown = await api.content.getMarkdown('project', params.slug)

    const {
      title,
      summary,
      techStack,
      deployedUrl,
      codebaseUrl,
    } = content.metadata

    return (
      <Container className="max-w-4xl py-16">
        <ContentHeader
          title={title}
          summary={summary}
          publishedAt={content.published_at || undefined}
        />

        {/* Tech Stack */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold mb-2">Tech Stack</h3>
          <div className="flex flex-wrap gap-2">
            {techStack?.map((tech: string) => (
              <Badge key={tech} variant="subtle">
                {tech}
              </Badge>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="flex gap-4 mb-12">
          {deployedUrl && (
            <a
              href={deployedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Live Demo →
            </a>
          )}
          {codebaseUrl && (
            <a
              href={codebaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              View Code →
            </a>
          )}
        </div>

        <MarkdownRenderer content={markdown} />
      </Container>
    )
  } catch (error) {
    notFound()
  }
}
```

### Admin Upload (`src/app/admin/upload/page.tsx`)

```typescript
'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { Container } from '@/components/layout/Container'
import { Button } from '@/components/ui/Button'

type Section = 'blog' | 'project' | 'case-study'

export default function UploadPage() {
  const [section, setSection] = useState<Section>('blog')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setMessage('❌ Please select a file')
      return
    }

    setUploading(true)
    setMessage('')

    try {
      const result = await api.content.upload(section, file)
      setMessage(`✅ Uploaded: ${result.metadata.title}`)
      setFile(null)
      
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Upload failed'}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <Container className="max-w-2xl py-16">
      <h1 className="text-3xl font-bold mb-8">Upload Content</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section Select */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Content Section
          </label>
          <select
            value={section}
            onChange={(e) => setSection(e.target.value as Section)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
          >
            <option value="blog">Blog</option>
            <option value="project">Project</option>
            <option value="case-study">Case Study</option>
          </select>
        </div>

        {/* File Input */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Markdown File (.md)
          </label>
          <input
            id="file-input"
            type="file"
            accept=".md"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md"
          />
          {file && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Selected: {file.name}
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={uploading || !file}
          className="w-full"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>

        {/* Message */}
        {message && (
          <div
            className={`
              p-4 rounded-md text-sm
              ${message.startsWith('✅') ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}
            `}
          >
            {message}
          </div>
        )}
      </form>
    </Container>
  )
}
```

---

## 7. Configuration Files

### `package.json`

```json
{
  "name": "portfolio-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.1.0",
    "react": "^18",
    "react-dom": "^18",
    "react-markdown": "^9.0.1",
    "remark-gfm": "^4.0.0",
    "react-syntax-highlighter": "^15.5.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@types/react-syntax-highlighter": "^15.5.11",
    "autoprefixer": "^10.0.1",
    "postcss": "^8",
    "tailwindcss": "^3.3.0",
    "typescript": "^5"
  }
}
```

### `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig
```

### `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

export default config
```

### `src/styles/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 255, 255, 255;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}
```

### `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## 8. Usage

### Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

### Build

```bash
npm run build
npm start
```

---

## Key Features

✅ **Server Components** - Fast, SEO-friendly rendering  
✅ **Type Safety** - Full TypeScript implementation  
✅ **Markdown Rendering** - Syntax highlighting + GFM support  
✅ **Responsive Design** - Mobile-first with Tailwind  
✅ **Dark Mode** - Automatic dark theme support  
✅ **API Integration** - Clean, reusable API client  
✅ **Admin Interface** - Simple upload UI  
✅ **ISR** - Incremental Static Regeneration (60s revalidate)  
✅ **Error Handling** - Graceful 404 pages  
✅ **Modular Components** - Reusable, composable UI

