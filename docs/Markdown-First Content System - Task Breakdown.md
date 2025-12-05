# Markdown-First Content System - Task Breakdown

**Philosophy:** Writer creates content locally → Uploads markdown → System renders automatically

---

## Revised Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    WRITER (You)                             │
│         Writes in VS Code / Any Markdown Editor             │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    Upload .md file via UI
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND (FastAPI)                      │
│  - Receives .md file                                        │
│  - Parses frontmatter (title, slug, category, etc.)         │
│  - Stores file in /media/markdown/                          │
│  - Creates record in content_files table                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE (PostgreSQL)                     │
│  content_files table:                                       │
│    - section (blog/project/case-study)                      │
│    - filename (uploaded_[file.md](http://file.md))                            │
│    - metadata (parsed from frontmatter)                     │
│    - created_at                                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                       │
│  - Fetches list of content files from API                  │
│  - Renders markdown on-demand                               │
│  - Displays in appropriate section                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Central Table: content_files

```sql
CREATE TABLE content_files (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Content classification
    section           VARCHAR(50) NOT NULL,  -- 'blog', 'project', 'case-study'
    
    -- File information
    filename          VARCHAR(255) NOT NULL, -- '[my-blog-post.md](http://my-blog-post.md)'
    file_path         VARCHAR(500) NOT NULL, -- '/media/markdown/blog/[my-blog-post.md](http://my-blog-post.md)'
    
    -- Metadata (parsed from frontmatter)
    metadata          JSONB NOT NULL,        -- Flexible structure per section
    
    -- Publishing
    is_published      BOOLEAN DEFAULT FALSE,
    published_at      TIMESTAMP WITH TIME ZONE,
    
    -- Audit
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(section, filename)
);

CREATE INDEX idx_content_files_section ON content_files(section);
CREATE INDEX idx_content_files_published ON content_files(is_published, published_at);
CREATE INDEX idx_content_files_metadata ON content_files USING GIN(metadata);
```

### Metadata Structure (JSONB)

```json
// For Blog
{
  "slug": "understanding-backtracking",
  "title": "Understanding Backtracking Patterns",
  "summary": "Deep dive into recursive problem-solving",
  "category": "DSA",
  "tags": ["algorithms", "recursion", "interviews"],
  "readTime": 8,
  "thumbnail": "/images/blog/backtracking.png",
  "featured": false
}

// For Project
{
  "slug": "ai-notes-app",
  "title": "AI Notes Enhancement App",
  "summary": "Intelligent note-taking with AI suggestions",
  "reason": "Explored real-time AI integration patterns",
  "techStack": ["Next.js", "FastAPI", "OpenAI"],
  "deployedUrl": "[https://notes.example.com](https://notes.example.com)",
  "codebaseUrl": "[https://github.com/user/notes](https://github.com/user/notes)",
  "thumbnail": "/images/projects/notes.png",
  "featured": true
}

// For Case Study
{
  "slug": "event-driven-architecture",
  "title": "Event-Driven Architecture for Scale",
  "summary": "How I designed a system handling 10k events/sec",
  "category": "Architecture",
  "tags": ["system-design", "kafka", "microservices"],
  "thumbnail": "/images/cases/eda.png",
  "featured": true
}
```

---

## Tasks Breakdown

---

## PART 1: Database Setup

### Task 1.1: Create Migration

```bash
# Location: backend/app/db/migrations/versions/
# File: xxxxx_create_content_files_[table.py](http://table.py)
```

**What to create:**

- Alembic migration file
- Create content_files table with schema above
- Add indexes

**Acceptance:**

```bash
docker compose exec backend alembic upgrade head
→ Table content_files exists in database
→ Indexes created
```

---

### Task 1.2: SQLAlchemy Model

```python
# Location: backend/app/models/content_[file.py](http://file.py)
```

**What to create:**

- ContentFile model class
- Map to content_files table
- Include all columns
- Add helper methods for metadata access

**Acceptance:**

- Model imports without errors
- Can query ContentFile.query.all()

---

## PART 2: Backend - File Upload & Parsing

### Task 2.1: Pydantic Schemas

```python
# Location: backend/app/schemas/content_[file.py](http://file.py)
```

**What to create:**

```python
class ContentFileMetadata(BaseModel):
    """Flexible metadata - varies by section"""
    slug: str
    title: str
    summary: str
    # Other fields optional and validated per section

class ContentFileCreate(BaseModel):
    section: Literal["blog", "project", "case-study"]
    # File will come via multipart/form-data

class ContentFileResponse(BaseModel):
    id: UUID
    section: str
    filename: str
    metadata: dict  # JSONB
    is_published: bool
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime

class ContentFileListItem(BaseModel):
    id: UUID
    section: str
    filename: str
    metadata: dict
    is_published: bool
    published_at: datetime | None
```

**Acceptance:**

- Schemas validate correctly
- Can serialize/deserialize

---

### Task 2.2: Markdown Parser Utility

```python
# Location: backend/app/utils/markdown_[parser.py](http://parser.py)
```

**What to create:**

```python
import frontmatter
from typing import Dict, Tuple

def parse_markdown_file(content: str) -> Tuple[Dict, str]:
    """
    Parse markdown content with frontmatter
    
    Returns:
        (metadata_dict, markdown_content)
    """
    post = frontmatter.loads(content)
    metadata = post.metadata
    content = post.content
    return metadata, content

def validate_metadata_for_section(section: str, metadata: Dict) -> Dict:
    """
    Validate required fields based on section type
    
    Raises ValueError if required fields missing
    """
    required_fields = {
        "blog": ["slug", "title", "summary", "category"],
        "project": ["slug", "title", "summary", "techStack"],
        "case-study": ["slug", "title", "summary", "category"]
    }
    
    for field in required_fields.get(section, []):
        if field not in metadata:
            raise ValueError(f"Missing required field: {field}")
    
    return metadata
```

**Acceptance:**

- Can parse markdown with frontmatter
- Validates required fields per section
- Raises clear errors for invalid metadata

---

### Task 2.3: File Storage Service

```python
# Location: backend/app/services/file_[storage.py](http://storage.py)
```

**What to create:**

```python
from pathlib import Path
from fastapi import UploadFile

UPLOAD_DIR = Path("/app/media/markdown")

async def save_uploaded_markdown(
    section: str, 
    file: UploadFile
) -> str:
    """
    Save markdown file to disk
    
    Returns:
        file_path (str)
    """
    section_dir = UPLOAD_DIR / section
    section_dir.mkdir(parents=True, exist_ok=True)
    
    file_path = section_dir / file.filename
    
    content = await [file.read](http://file.read)()
    file_path.write_bytes(content)
    
    return str(file_path)

def read_markdown_file(file_path: str) -> str:
    """Read markdown content from disk"""
    return Path(file_path).read_text(encoding="utf-8")

def delete_markdown_file(file_path: str):
    """Delete markdown file from disk"""
    Path(file_path).unlink(missing_ok=True)
```

**Acceptance:**

- Files save to correct directory structure
- Can read files back
- Can delete files

---

### Task 2.4: Content File Service

```python
# Location: backend/app/services/content_file_[service.py](http://service.py)
```

**What to create:**

```python
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.content_file import ContentFile
from app.utils.markdown_parser import parse_markdown_file, validate_metadata_for_section

async def create_content_file(
    db: AsyncSession,
    section: str,
    file_path: str,
    filename: str,
    content: str
) -> ContentFile:
    """
    Create content file record after parsing
    """
    metadata, markdown_content = parse_markdown_file(content)
    metadata = validate_metadata_for_section(section, metadata)
    
    content_file = ContentFile(
        section=section,
        filename=filename,
        file_path=file_path,
        metadata=metadata,
        is_published=False
    )
    
    db.add(content_file)
    await db.commit()
    await db.refresh(content_file)
    
    return content_file

async def get_content_files_by_section(
    db: AsyncSession,
    section: str,
    published_only: bool = True
) -> list[ContentFile]:
    """Get all content files for a section"""
    query = db.query(ContentFile).filter(ContentFile.section == section)
    
    if published_only:
        query = query.filter([ContentFile.is](http://ContentFile.is)_published == True)
    
    query = query.order_by(ContentFile.published_at.desc())
    
    result = await db.execute(query)
    return result.scalars().all()

async def get_content_file_by_slug(
    db: AsyncSession,
    section: str,
    slug: str
) -> ContentFile | None:
    """Get content file by section and slug"""
    query = db.query(ContentFile).filter(
        ContentFile.section == section,
        ContentFile.metadata["slug"].astext == slug
    )
    
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def publish_content_file(
    db: AsyncSession,
    content_file_id: UUID
) -> ContentFile:
    """Publish a content file"""
    content_file = await db.get(ContentFile, content_file_id)
    
    content_[file.is](http://file.is)_published = True
    content_file.published_at = [datetime.now](http://datetime.now)(timezone.utc)
    
    await db.commit()
    await db.refresh(content_file)
    
    return content_file
```

**Acceptance:**

- Can create content file records
- Can query by section
- Can filter published/unpublished
- Can publish files

---

### Task 2.5: Upload API Endpoint

```python
# Location: backend/app/api/v1/content_[upload.py](http://upload.py)
```

**What to create:**

```python
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_admin  # Auth dependency
from [app.services](http://app.services).file_storage import save_uploaded_markdown, read_markdown_file
from [app.services](http://app.services).content_file_service import create_content_file
from app.schemas.content_file import ContentFileResponse

router = APIRouter(prefix="/content", tags=["content-upload"])

@[router.post](http://router.post)("/upload", response_model=ContentFileResponse)
async def upload_markdown(
    section: str = Form(...),  # 'blog', 'project', 'case-study'
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_admin)  # Protected route
):
    """
    Upload markdown file for a specific section
    """
    # Validate file type
    if not file.filename.endswith('.md'):
        raise HTTPException(400, "Only .md files allowed")
    
    # Validate section
    if section not in ["blog", "project", "case-study"]:
        raise HTTPException(400, "Invalid section")
    
    try:
        # Save file to disk
        file_path = await save_uploaded_markdown(section, file)
        
        # Read content
        content = read_markdown_file(file_path)
        
        # Create database record
        content_file = await create_content_file(
            db=db,
            section=section,
            file_path=file_path,
            filename=file.filename,
            content=content
        )
        
        return content_file
        
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, f"Upload failed: {str(e)}")
```

**Acceptance:**

```bash
curl -X POST \
  -F "section=blog" \
  -F "file=@[my-post.md](http://my-post.md)" \
  -H "Authorization: Bearer <token>" \
  [http://localhost:8000/api/v1/content/upload](http://localhost:8000/api/v1/content/upload)

→ Returns ContentFileResponse
→ File saved to /media/markdown/blog/[my-post.md](http://my-post.md)
→ Record created in database
```

---

### Task 2.6: List & Retrieve API Endpoints

```python
# Location: backend/app/api/v1/content_[files.py](http://files.py)
```

**What to create:**

```python
@router.get("/{section}", response_model=list[ContentFileListItem])
async def list_content_files(
    section: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Public: Get all published content for a section
    """
    files = await get_content_files_by_section(db, section, published_only=True)
    return files

@router.get("/{section}/{slug}", response_model=ContentFileResponse)
async def get_content_file(
    section: str,
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Public: Get specific content by slug
    """
    content_file = await get_content_file_by_slug(db, section, slug)
    
    if not content_file or not content_[file.is](http://file.is)_published:
        raise HTTPException(404, "Content not found")
    
    return content_file

@router.get("/{section}/{slug}/content")
async def get_markdown_content(
    section: str,
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Public: Get raw markdown content
    """
    content_file = await get_content_file_by_slug(db, section, slug)
    
    if not content_file or not content_[file.is](http://file.is)_published:
        raise HTTPException(404, "Content not found")
    
    content = read_markdown_file(content_file.file_path)
    
    return {"content": content}

# Admin endpoints
@router.patch("/{id}/publish", response_model=ContentFileResponse)
async def publish_content(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_admin)
):
    """
    Admin: Publish a content file
    """
    content_file = await publish_content_file(db, id)
    return content_file
```

**Acceptance:**

```bash
GET /api/v1/content/blog
→ Returns list of published blogs

GET /api/v1/content/blog/my-slug
→ Returns full content file data

GET /api/v1/content/blog/my-slug/content
→ Returns { "content": "markdown here..." }
```

---

## PART 3: Frontend - Render Markdown

### Task 3.1: API Client Methods

```tsx
// Location: frontend/src/lib/api.ts
```

**What to create:**

```tsx
export interface ContentFile {
  id: string
  section: string
  filename: string
  metadata: {
    slug: string
    title: string
    summary: string
    [key: string]: any
  }
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export const api = {
  content: {
    list: async (section: string): Promise<ContentFile[]> => {
      const res = await fetch(`${API_URL}/content/${section}`)
      return res.json()
    },
    
    get: async (section: string, slug: string): Promise<ContentFile> => {
      const res = await fetch(`${API_URL}/content/${section}/${slug}`)
      return res.json()
    },
    
    getMarkdown: async (section: string, slug: string): Promise<string> => {
      const res = await fetch(`${API_URL}/content/${section}/${slug}/content`)
      const data = await res.json()
      return data.content
    },
    
    upload: async (section: string, file: File): Promise<ContentFile> => {
      const formData = new FormData()
      formData.append('section', section)
      formData.append('file', file)
      
      const res = await fetch(`${API_URL}/content/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        },
        body: formData
      })
      
      return res.json()
    }
  }
}
```

**Acceptance:**

- All methods typed correctly
- Fetch logic works
- Error handling included

---

### Task 3.2: Markdown Renderer Component

```tsx
// Location: frontend/src/components/content/MarkdownRenderer.tsx
```

**What to create:**

```tsx
'use client'

import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'

interface Props {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: Props) {
  return (
    <ReactMarkdown
      className={cn('prose prose-neutral dark:prose-invert max-w-none', className)}
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
        }
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
```

**Dependencies to add:**

```bash
npm install react-markdown react-syntax-highlighter
npm install -D @types/react-syntax-highlighter
```

**Acceptance:**

- Markdown renders with syntax highlighting
- Code blocks styled properly
- Responsive on mobile

---

### Task 3.3: Dynamic Blog Detail Page

```tsx
// Location: frontend/src/app/blog/[slug]/page.tsx
```

**What to create:**

```tsx
import { api } from '@/lib/api'
import { MarkdownRenderer } from '@/components/content/MarkdownRenderer'
import { Container } from '@/components/layout'
import { Badge } from '@/components/ui'

interface Props {
  params: { slug: string }
}

export default async function BlogPost({ params }: Props) {
  const { slug } = params
  
  // Fetch content file metadata
  const contentFile = await api.content.get('blog', slug)
  
  // Fetch raw markdown
  const markdown = await api.content.getMarkdown('blog', slug)
  
  const { title, summary, category, tags, readTime } = contentFile.metadata
  
  return (
    <Container className="container-narrow py-16">
      {/* Header */}
      <header className="mb-12">
        <Badge variant="outline">{category}</Badge>
        <h1 className="text-4xl font-bold mt-4 mb-3">{title}</h1>
        <p className="text-lg text-fg-secondary">{summary}</p>
        
        <div className="flex gap-4 mt-6 text-sm text-fg-muted">
          <span>{readTime} min read</span>
          <span>•</span>
          <time>{new Date(contentFile.published_at!).toLocaleDateString()}</time>
        </div>
        
        <div className="flex gap-2 mt-4">
          {tags?.map((tag: string) => (
            <Badge key={tag} variant="subtle">{tag}</Badge>
          ))}
        </div>
      </header>
      
      {/* Content */}
      <MarkdownRenderer content={markdown} />
    </Container>
  )
}
```

**Acceptance:**

- /blog/[slug] renders markdown content
- Metadata displays correctly
- Syntax highlighting works
- Page is responsive

---

### Task 3.4: Blog List Page

```tsx
// Location: frontend/src/app/blog/page.tsx
```

**What to create:**

```tsx
import { api } from '@/lib/api'
import { Container } from '@/components/layout'
import Link from 'next/link'

export default async function BlogPage() {
  const contentFiles = await api.content.list('blog')
  
  return (
    <Container className="py-16">
      <h1 className="text-4xl font-bold mb-12">Blog</h1>
      
      <div className="grid gap-8">
        {[contentFiles.map](http://contentFiles.map)((file) => {
          const { slug, title, summary, category, readTime } = file.metadata
          
          return (
            <Link 
              key={[file.id](http://file.id)}
              href={`/blog/${slug}`}
              className="group"
            >
              <article className="card card-interactive p-6">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="outline">{category}</Badge>
                  <span className="text-sm text-fg-muted">{readTime} min</span>
                </div>
                
                <h2 className="text-2xl font-semibold mb-2 group-hover:text-accent-primary transition-colors">
                  {title}
                </h2>
                
                <p className="text-fg-secondary">{summary}</p>
                
                <time className="block mt-4 text-sm text-fg-muted">
                  {new Date(file.published_at!).toLocaleDateString()}
                </time>
              </article>
            </Link>
          )
        })}
      </div>
    </Container>
  )
}
```

**Acceptance:**

- /blog lists all published blogs
- Cards link to detail pages
- Sorted by date (newest first)

---

### Task 3.5: Admin Upload UI

```tsx
// Location: frontend/src/app/admin/content/upload/page.tsx
```

**What to create:**

```tsx
'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { Button, Input } from '@/components/ui'

export default function UploadPage() {
  const [section, setSection] = useState<'blog' | 'project' | 'case-study'>('blog')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      setMessage('Please select a file')
      return
    }
    
    setUploading(true)
    setMessage('')
    
    try {
      const result = await api.content.upload(section, file)
      setMessage(`✓ Uploaded: ${result.metadata.title}`)
      setFile(null)
    } catch (error) {
      setMessage(`✗ Error: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }
  
  return (
    <div className="max-w-2xl mx-auto py-16">
      <h1 className="text-3xl font-bold mb-8">Upload Content</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section Select */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Content Section
          </label>
          <select 
            value={section}
            onChange={(e) => setSection([e.target](http://e.target).value as any)}
            className="input"
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
            type="file"
            accept=".md"
            onChange={(e) => setFile([e.target](http://e.target).files?.[0] || null)}
            className="input"
          />
          {file && (
            <p className="text-sm text-fg-muted mt-2">
              Selected: {[file.name](http://file.name)}
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
          <div className={cn(
            'p-4 rounded-md text-sm',
            message.startsWith('✓') ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
          )}>
            {message}
          </div>
        )}
      </form>
    </div>
  )
}
```

**Acceptance:**

- Admin can select section
- Upload .md file
- See success/error message
- File appears in content list

---

## Summary of Tasks

### Backend (7 tasks)

1. ✅ Database migration - content_files table
2. ✅ SQLAlchemy model - ContentFile
3. ✅ Pydantic schemas - validation
4. ✅ Markdown parser utility
5. ✅ File storage service
6. ✅ Content file service (CRUD)
7. ✅ API endpoints (upload, list, retrieve)

### Frontend (5 tasks)

1. ✅ API client methods
2. ✅ Markdown renderer component
3. ✅ Blog detail page (dynamic)
4. ✅ Blog list page
5. ✅ Admin upload UI

### Total: 12 focused tasks

---

## Build Order

```
Part 1: Database (Tasks 1.1, 1.2)
  ↓
Part 2: Backend Core (Tasks 2.1, 2.2, 2.3)
  ↓
Part 3: Backend API (Tasks 2.4, 2.5, 2.6)
  ↓
Part 4: Frontend Display (Tasks 3.1, 3.2, 3.3, 3.4)
  ↓
Part 5: Admin Upload (Task 3.5)
```

---

## Example Markdown File Format

```markdown
---
slug: understanding-recursion
title: Understanding Recursion in Depth
summary: A comprehensive guide to mastering recursive thinking
category: DSA
tags: [algorithms, recursion, problem-solving]
readTime: 12
thumbnail: /images/blog/recursion.png
featured: true
---

# Understanding Recursion

Recursion is a powerful programming technique...

## Base Case

Every recursive function needs a base case...

```

def factorial(n):

if n <= 1:

return 1

return n * factorial(n - 1)

```

## Real World Examples

...
```