# Architecture

Portfolio system built with FastAPI + PostgreSQL backend and Next.js 14 frontend.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                        │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS
                  ┌────▼─────┐
                  │  Nginx   │ SSL Termination, Reverse Proxy
                  └────┬─────┘
                       │
          ┌────────────┴────────────┐
          │                         │
     ┌────▼─────┐            ┌─────▼──────┐
     │ Next.js  │            │  FastAPI   │
     │ Frontend │            │  Backend   │
     │  (SSR +  │ ◄────────► │  (REST)    │
     │  Client) │   API      │            │
     └──────────┘            └─────┬──────┘
                                   │
                            ┌──────▼──────┐
                            │ PostgreSQL  │
                            │  Database   │
                            └─────────────┘
```

---

## Backend Architecture (FastAPI)

### Stack
- **Runtime**: Python 3.11
- **Framework**: FastAPI 0.109+
- **Database**: PostgreSQL 15
- **ORM**: SQLAlchemy 2.0
- **Migrations**: Alembic
- **Validation**: Pydantic 2.5

### Directory Structure

```
backend/
├── app/
│   ├── main.py                    # FastAPI app entry
│   ├── config.py                  # Settings (Pydantic)
│   ├── database.py                # SQLAlchemy engine
│   ├── models/
│   │   ├── content_file.py        # Content model (JSONB metadata)
│   │   └── user.py                # User model (admin auth)
│   ├── schemas/
│   │   ├── content_file.py        # API contracts
│   │   └── user.py                # Auth schemas
│   ├── services/
│   │   ├── file_storage.py        # File ops
│   │   └── content_service.py     # Business logic
│   ├── core/
│   │   ├── security.py            # JWT + bcrypt
│   │   └── dependencies.py        # Auth middleware
│   ├── utils/
│   │   └── markdown_parser.py     # Frontmatter parser
│   └── api/routes/
│       ├── content.py             # Content endpoints
│       └── auth.py                # Auth endpoints
├── alembic/
│   ├── versions/
│   │   ├── 001_create_content.py  # Initial migration
│   │   └── 002_create_users.py    # Users table
│   └── env.py                     # Migration config
├── scripts/
│   └── create_admin.py            # Admin user creation
├── media/markdown/                # Uploaded files
│   ├── blog/
│   ├── project/
│   └── case-study/
├── Dockerfile
├── requirements.txt
└── .env
```

### Core Components

**Models** (`app/models/`)
- `ContentFile`: UUID primary key, section classification, JSONB metadata, file path, publish status
- `User`: UUID, email, hashed password, admin flag

**Services** (`app/services/`)
- `FileStorageService`: Read/write markdown files to disk
- `ContentService`: CRUD operations, frontmatter parsing, slug validation

**Security** (`app/core/`)
- Password hashing: bcrypt
- JWT tokens: HS256, 7-day expiry
- Role-based access: admin-only routes

**API Layer** (`app/api/routes/`)
- RESTful endpoints
- Auto-generated OpenAPI docs
- CORS middleware

### Database Schema

**content_files**
```sql
id              UUID PRIMARY KEY
section         VARCHAR(50)    -- blog | project | case-study
filename        VARCHAR(255)
file_path       VARCHAR(500)
metajson        JSONB          -- Flexible frontmatter storage
is_published    BOOLEAN
published_at    TIMESTAMP
created_at      TIMESTAMP
updated_at      TIMESTAMP

INDEXES:
- idx_section (section)
- idx_section_filename (section, filename) UNIQUE
- idx_published (is_published, published_at)
- idx_metajson_gin (metajson) GIN
```

**users**
```sql
id              UUID PRIMARY KEY
email           VARCHAR UNIQUE
full_name       VARCHAR
hashed_password VARCHAR
is_admin        BOOLEAN
is_active       BOOLEAN
created_at      TIMESTAMP
last_login      TIMESTAMP

INDEXES:
- idx_email (email) UNIQUE
```

---

## Frontend Architecture (Next.js)

### Stack
- **Runtime**: Node.js 18
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3
- **Markdown**: react-markdown + remark-gfm
- **Syntax**: react-syntax-highlighter

### Directory Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Home
│   │   ├── blog/
│   │   │   ├── page.tsx           # List (SSR)
│   │   │   └── [slug]/page.tsx    # Detail (SSR)
│   │   ├── projects/              # Same structure
│   │   ├── case-studies/          # Same structure
│   │   └── admin/
│   │       ├── login/page.tsx     # Auth
│   │       └── dashboard/page.tsx # CMS (Client)
│   ├── components/
│   │   ├── content/
│   │   │   ├── MarkdownRenderer.tsx
│   │   │   ├── ContentCard.tsx
│   │   │   └── ContentHeader.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Container.tsx
│   │   └── ui/
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       └── Input.tsx
│   ├── lib/
│   │   ├── api.ts                 # Type-safe API client
│   │   └── auth.ts                # Auth utilities
│   └── styles/
│       └── globals.css
├── public/
├── Dockerfile.prod
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

### Rendering Strategy

**Client-Side Pages** (browser fetch):
- `/blog` - Blog list
- `/projects` - Projects list
- `/case-studies` - Case studies list
- `/blog/[slug]` - Blog detail
- `/projects/[slug]` - Project detail
- `/case-studies/[slug]` - Case study detail
- `/admin/*` - Admin dashboard

**Static Pages**:
- `/` - Home

### API Client Pattern

```typescript
// Type-safe API client with fetch + caching
class ApiClient {
  content = {
    list: (section, publishedOnly) => Promise<ContentFile[]>
    get: (section, slug) => Promise<ContentFile>
    getMarkdown: (section, slug) => Promise<string>
    upload: (section, file) => Promise<ContentFile>
    update: (id, data) => Promise<ContentFile>
    delete: (id) => Promise<void>
  }
}
```

---

## Infrastructure (Docker)

### Multi-Container Setup

```yaml
services:
  db:
    postgres:15-alpine
    volumes: postgres_data
    healthcheck: pg_isready

  backend:
    FastAPI + Uvicorn
    depends_on: db (healthcheck)
    env: DATABASE_URL, SECRET_KEY, CORS_ORIGINS

  frontend:
    Next.js standalone
    env: NEXT_PUBLIC_API_URL

  nginx:
    reverse proxy + SSL
    ports: 80, 443
    routes:
      / → frontend:3000
      /api → backend:8000
      /media → backend media volume
```

### Volume Mounts

- `postgres_data`: Database persistence
- `./backend/media`: Markdown file storage
- `./nginx/ssl`: SSL certificates
- `./nginx/nginx.conf`: Nginx config

---

## Data Flow

### Content Upload

```
User → Admin UI (upload form)
  ↓ FormData
Frontend → POST /api/v1/content/upload?section=blog
  ↓ JWT token validation
Backend → Validate frontmatter
  ↓ Parse metadata
Backend → Save to /media/markdown/{section}/{filename}
  ↓ Create DB record
PostgreSQL → Store (section, file_path, metajson, timestamps)
  ↓ Return content object
Frontend ← Display success
```

### Content Display

```
User → Visit /blog/{slug}
  ↓
Frontend (Client) → Fetch on mount
  ↓ useEffect
API Client → GET /api/v1/content/blog/{slug}
  ↓
Backend → Query: section='blog' AND metajson->>'slug' = {slug}
  ↓
PostgreSQL → Return content record
  ↓
Backend → Read file from disk (file_path)
  ↓ Return markdown content
Frontend → Render with MarkdownRenderer
  ↓
Browser → Display formatted content
```

### Authentication Flow

```
User → Login form (email + password)
  ↓
Frontend → POST /api/v1/auth/login
  ↓
Backend → Verify password (bcrypt)
  ↓ Generate JWT token
Backend → Return { access_token, token_type }
  ↓
Frontend → Store token in localStorage
  ↓ Include in all requests
Protected Routes → Verify JWT → Check admin role
```

---

## Configuration

### Environment Variables

**Backend** (`.env`):
```bash
DATABASE_URL=postgresql://user:pass@db:5432/db
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
CORS_ORIGINS=["http://localhost:3000"]
MEDIA_ROOT=/app/media
API_V1_PREFIX=/api/v1
```

**Frontend** (`.env.production`):
```bash
NEXT_PUBLIC_API_URL=https://domain.com/api/v1
```

---

## Deployment Architecture

### Production Stack

```
┌───────────────────────────────────────────────┐
│         Domain (HTTPS/SSL)                    │
│         ↓                                     │
│    ┌─────────────┐                           │
│    │   Nginx     │ Port 80/443               │
│    └──────┬──────┘                            │
│           │                                   │
│   ┌───────┴────────┐                         │
│   │                │                         │
│ ┌─▼──┐         ┌──▼───┐                     │
│ │Next│         │FastAPI│                     │
│ │.js │ ◄──────►│       │                     │
│ └────┘         └───┬───┘                     │
│                    │                         │
│               ┌────▼─────┐                   │
│               │PostgreSQL│                   │
│               └──────────┘                   │
│                                              │
│         VPS (Single Server)                  │
└───────────────────────────────────────────────┘
```

### Build Process

**Frontend**:
1. Multi-stage build: deps → builder → runner
2. Install all deps (including dev for build)
3. `npm run build` → Standalone output
4. Production image: Node + standalone only

**Backend**:
1. Python slim image
2. Install deps from requirements.txt
3. Run Alembic migrations on startup
4. Uvicorn server

---

## Security

### Measures Implemented
✓ Password hashing (bcrypt)
✓ JWT tokens (7-day expiry)
✓ Role-based access control
✓ CORS configuration
✓ SQL injection protection (SQLAlchemy)
✓ Input validation (Pydantic)
✓ HTTPS/SSL in production

### Admin Protection
- All write operations require JWT token
- Admin role verification on protected routes
- Token stored securely in localStorage
- Auto-logout on token expiry

---

## Performance

### Optimizations
- Client-side rendering for dynamic content
- PostgreSQL GIN index on JSONB
- Connection pooling (10-20 connections)
- Nginx reverse proxy caching
- Static asset compression
- Multi-stage Docker builds

### Caching Strategy
- No caching (dynamic content, admin-only)
- Browser caches static assets
- Nginx caches API responses (optional)

---

## Evolution Timeline

Development progressed through these key phases:

1. **Foundation**: FastAPI + PostgreSQL + SQLAlchemy
2. **Content System**: Markdown parsing, file storage, JSONB metadata
3. **Frontend**: Next.js 14 App Router, TypeScript
4. **Design**: Energy & Evolution theme, Tailwind CSS
5. **Auth**: JWT authentication, admin system
6. **Client-Side**: SSR → Client rendering transition
7. **Production**: Docker multi-container, Nginx, SSL

---

This architecture supports a clean separation of concerns, type safety across the stack, and straightforward deployment.
