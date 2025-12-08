# Features

Comprehensive content management system with admin dashboard, markdown support, and modern web stack.

---

## Content Management

### Three Content Types

**Blog Posts**
- Technical articles and tutorials
- Category classification
- Tag system
- Read time estimation
- Featured post support
- Thumbnail images

**Projects**
- Portfolio showcases
- Tech stack badges
- Live demo links
- Codebase repository links
- Project reasoning/motivation
- Deployment status

**Case Studies**
- Real-world problem solving
- Category organization
- Tag classification
- In-depth technical analysis
- Featured studies

### Markdown-First Workflow

**Frontmatter Structure**:
```yaml
---
slug: unique-identifier
title: Content Title
summary: Brief description
category: Category Name
tags: [tag1, tag2, tag3]
featured: false
---
Markdown content here...
```

**Supported Markdown**:
- Headers (H1-H6)
- Bold, italic, strikethrough
- Code blocks with syntax highlighting
- Inline code
- Lists (ordered, unordered)
- Links (internal, external)
- Images
- Blockquotes
- Tables (GitHub Flavored Markdown)
- Task lists
- Horizontal rules

**Syntax Highlighting**:
- 150+ programming languages
- OneDark theme
- Copy-to-clipboard
- Line numbers
- Line highlighting

---

## Admin System

### Authentication

**Secure Login**:
- JWT token-based authentication
- bcrypt password hashing
- 7-day token expiration
- Role-based access control
- Active user verification

**Admin Creation**:
```bash
docker compose exec backend python3 scripts/create_admin.py \
  --email admin@example.com \
  --password SecurePass123 \
  --name "Admin Name"
```

### Dashboard Features

**Content Management**:
- Upload markdown files
- View all content (published/draft)
- Toggle publish/unpublish status
- Delete content with confirmation
- Filter by section (blog/projects/case studies)
- Real-time upload feedback

**User Interface**:
- Clean, professional design
- Energy & Evolution theme
- Loading states
- Success/error messages
- Responsive layout
- Keyboard shortcuts

---

## API

### Public Endpoints

**List Content**:
```http
GET /api/v1/content/{section}
  ?published_only=true
  &limit=100
  &offset=0

Returns: ContentFile[]
```

**Get Content by Slug**:
```http
GET /api/v1/content/{section}/{slug}

Returns: ContentFile
```

**Get Markdown Content**:
```http
GET /api/v1/content/{section}/{slug}/markdown

Returns: { content: string, metadata: object }
```

### Protected Endpoints (Admin Only)

**Upload Content**:
```http
POST /api/v1/content/upload?section={section}
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body: file (markdown)
Returns: ContentFile
```

**Update Content**:
```http
PATCH /api/v1/content/{id}
Authorization: Bearer {token}
Content-Type: application/json

Body: { is_published: boolean, metajson: object }
Returns: ContentFile
```

**Delete Content**:
```http
DELETE /api/v1/content/{id}
Authorization: Bearer {token}

Returns: 204 No Content
```

### Authentication Endpoints

**Login**:
```http
POST /api/v1/auth/login
Content-Type: application/json

Body: { email: string, password: string }
Returns: { access_token: string, token_type: "bearer" }
```

**Get Current User**:
```http
GET /api/v1/auth/me
Authorization: Bearer {token}

Returns: User object
```

---

## Frontend Features

### Public Pages

**Home Page** (`/`)
- Hero section
- Call-to-action buttons
- Responsive design

**Blog List** (`/blog`)
- Grid layout
- Content cards with metadata
- Category badges
- Read time display
- Published date
- Empty state message

**Blog Detail** (`/blog/{slug}`)
- Full markdown rendering
- Content header with metadata
- Tag badges
- Syntax highlighted code
- Responsive typography

**Projects List** (`/projects`)
- Grid layout (2 columns on desktop)
- Project cards
- Tech stack preview

**Project Detail** (`/projects/{slug}`)
- Project header
- Tech stack badges
- Live demo link
- Codebase link
- Full project description

**Case Studies** (`/case-studies`)
- Similar to blog structure
- Category organization

### Admin Pages

**Login** (`/admin/login`)
- Email/password form
- Remember me option
- Error handling
- Redirect after login

**Dashboard** (`/admin/dashboard`)
- Upload interface
- Content list (all sections)
- Publish/unpublish toggle
- Delete confirmation
- Logout button
- View site link

### UI Components

**MarkdownRenderer**
- Custom heading styles
- Link styling (external indicator)
- Code block themes
- Quote formatting
- Table styling
- Image responsive sizing

**ContentCard**
- Hover effects
- Category badge
- Tag list
- Metadata display
- Published date
- Clickable area

**ContentHeader**
- Title typography
- Summary text
- Metadata row (date, read time)
- Tag list
- Responsive spacing

**Badge**
- Three variants: default, outline, subtle
- Color-coded categories
- Rounded pill shape

**Button**
- Three variants: primary, secondary, outline
- Three sizes: sm, md, lg
- Loading states
- Disabled states

---

## Developer Experience

### Type Safety

**Backend**:
- Pydantic models for validation
- SQLAlchemy type hints
- FastAPI auto-completion
- OpenAPI schema generation

**Frontend**:
- TypeScript strict mode
- Interface definitions for all data
- Type-safe API client
- Component prop typing

### Code Organization

**Clean Architecture**:
- Separation of concerns
- Service layer pattern
- Repository pattern (SQLAlchemy)
- Dependency injection

**Reusable Components**:
- UI component library
- Layout components
- Content components
- Utility functions

### Documentation

**Auto-Generated API Docs**:
- OpenAPI/Swagger UI at `/docs`
- ReDoc at `/redoc`
- Request/response schemas
- Try-it-out interface

---

## Data Management

### Database Features

**PostgreSQL Advantages**:
- JSONB for flexible metadata
- GIN indexes for fast JSON queries
- Full-text search capable
- Transaction support
- Referential integrity

**Migration System**:
- Alembic for version control
- Up/down migration support
- Auto-migration generation
- Migration history tracking

**Indexes**:
- Section index (performance)
- Section + filename unique constraint
- Published status index
- JSONB GIN index (metadata queries)
- Email unique index (users)

### File Storage

**Organized Structure**:
```
media/markdown/
├── blog/
│   ├── post-1.md
│   └── post-2.md
├── project/
│   ├── project-1.md
│   └── project-2.md
└── case-study/
    ├── study-1.md
    └── study-2.md
```

**File Operations**:
- Save uploaded files to disk
- Read markdown content
- Delete files on content removal
- File existence validation
- Extension validation (.md only)

---

## Validation & Error Handling

### Frontend Validation

- File type checking (.md only)
- Form field validation
- Login credential verification
- Token expiration handling
- Network error catching

### Backend Validation

**Frontmatter Validation**:
- Required fields per section
- Slug format validation
- Slug uniqueness check
- Data type validation
- Field length limits

**Request Validation**:
- Pydantic schema validation
- File size limits (10MB)
- Content type verification
- Authentication verification
- Admin role verification

**Error Responses**:
```json
{
  "detail": "Human-readable error message"
}
```

---

## Publishing Workflow

### Content States

1. **Draft** (`is_published=false`)
   - Not visible on public site
   - Visible in admin dashboard
   - Can be edited/deleted

2. **Published** (`is_published=true`)
   - Visible on public site
   - Has published_at timestamp
   - Can be unpublished

### Publishing Process

```
Upload → Parse → Validate → Save (Draft)
   ↓
Admin Review
   ↓
Click "Publish" → Set is_published=true
                → Set published_at=now()
   ↓
Appears on Public Site
```

---

## Performance Features

### Backend Optimization

- Connection pooling (10-20 connections)
- Query optimization with indexes
- Async request handling
- Response compression

### Frontend Optimization

- Client-side rendering
- Component code splitting
- Lazy loading
- Optimized images
- Minimal JavaScript bundle

### Caching

- Browser caching for static assets
- API response caching (optional)
- Database query result caching (planned)

---

## Security Features

### Password Security
- bcrypt hashing (12 rounds)
- No plain-text storage
- Secure password requirements
- Token-based sessions

### API Security
- JWT token authentication
- Role-based access control
- CORS configuration
- Request rate limiting (planned)
- SQL injection protection (SQLAlchemy)

### Input Sanitization
- Pydantic validation
- File type verification
- Extension checking
- Path traversal prevention
- XSS protection in markdown rendering

---

## Extensibility

### Easy Additions

**New Content Types**:
1. Add section to content type literal
2. Create metadata schema
3. Update frontmatter validation
4. Add frontend pages

**Custom Metadata Fields**:
- JSONB allows flexible schema
- No migration needed for new fields
- Backward compatible

**Additional Features** (Future):
- Search functionality
- Content versioning
- Draft auto-save
- Scheduled publishing
- Content analytics
- RSS feed generation
- Newsletter integration
- Comment system
- Social sharing

---

This feature set provides a complete, production-ready content management system with room for growth.
