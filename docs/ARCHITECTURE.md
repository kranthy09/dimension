# Architecture

FastAPI + PostgreSQL backend, Next.js 14 frontend.

## Backend

**Stack:** Python 3.11, FastAPI, PostgreSQL 15, SQLAlchemy, Alembic

**Structure:**
```
backend/app/
├── models/       # ContentFile, User
├── schemas/      # API contracts
├── services/     # Business logic
├── api/routes/   # Endpoints
└── core/         # Security, deps
```

**Database:**
```sql
content_files: id, section, filename, file_path, metajson (JSONB), is_published
users: id, email, hashed_password, is_admin
```

## Frontend

**Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS

**Structure:**
```
frontend/src/
├── app/          # Pages (client-side rendering)
├── components/   # UI components
└── lib/          # API client, auth
```

## Data Flow

**Upload:** Admin UI → POST /api/v1/content/upload → Parse frontmatter → Save file → DB record  
**Display:** Client → GET /api/v1/content/{section}/{slug} → Read file → Render markdown

## Deployment

**Docker Compose:** db → backend → frontend → nginx  
**Volumes:** postgres_data, ./backend/media  
**Ports:** 80, 443 (nginx)
