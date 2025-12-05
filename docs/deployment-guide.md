# Portfolio Site - Complete Deployment Guide

## Quick Start (5 Minutes)

### 1. Clone & Setup

```bash
# Create project structure
mkdir portfolio && cd portfolio
mkdir backend frontend

# Backend setup
cd backend
# Copy all backend files from backend-portfolio.md
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt

# Frontend setup
cd ../frontend
# Copy all frontend files from frontend-portfolio.md
npm install
```

### 2. Start with Docker (Recommended)

```bash
# From project root
docker-compose up -d

# Run migrations
docker-compose exec backend alembic upgrade head

# Access services
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
# Frontend: http://localhost:3000
```

### 3. Test Upload

Create a test blog post `test-post.md`:

```markdown
---
slug: my-first-post
title: My First Blog Post
summary: Testing the markdown upload system
category: Tech
tags: [test, markdown]
readTime: 5
featured: true
---

# Hello World

This is my first blog post!

## Features

- Markdown support
- Syntax highlighting
- Frontmatter metadata

```python
def hello():
    print("Hello from my blog!")
```
```

Upload it:

```bash
curl -X POST "http://localhost:8000/api/v1/content/upload?section=blog" \
  -F "file=@test-post.md"
```

Visit: `http://localhost:3000/blog/my-first-post`

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         USER                                │
│                  (Local Markdown Editor)                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ Upload .md file
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                       │
│  - Admin Upload UI (/admin/upload)                         │
│  - Blog/Project/Case Study Pages                           │
│  - Markdown Rendering                                       │
│  Port: 3000                                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP/REST API
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (FastAPI)                         │
│  - POST /api/v1/content/upload                             │
│  - GET /api/v1/content/{section}                           │
│  - GET /api/v1/content/{section}/{slug}                    │
│  - GET /api/v1/content/{section}/{slug}/markdown           │
│  Port: 8000                                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE (PostgreSQL)                      │
│  - content_files table                                      │
│  - JSONB metadata                                           │
│  Port: 5432                                                 │
└─────────────────────────────────────────────────────────────┘
                         ▲
                         │
┌────────────────────────┴────────────────────────────────────┐
│                  FILE STORAGE                               │
│  /media/markdown/blog/                                      │
│  /media/markdown/project/                                   │
│  /media/markdown/case-study/                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
portfolio/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   │   └── content_file.py
│   │   ├── schemas/
│   │   │   └── content_file.py
│   │   ├── services/
│   │   │   ├── file_storage.py
│   │   │   └── content_service.py
│   │   ├── utils/
│   │   │   └── markdown_parser.py
│   │   └── api/
│   │       └── routes/
│   │           └── content.py
│   ├── alembic/
│   │   └── versions/
│   │       └── 001_create_content_files.py
│   ├── media/
│   │   └── markdown/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── blog/
│   │   │   ├── projects/
│   │   │   ├── case-studies/
│   │   │   └── admin/
│   │   ├── components/
│   │   │   ├── content/
│   │   │   ├── layout/
│   │   │   └── ui/
│   │   ├── lib/
│   │   │   └── api.ts
│   │   └── styles/
│   │       └── globals.css
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── .env.local
│
└── docker-compose.yml
```

---

## Environment Setup

### Backend `.env`

```env
# Database
DATABASE_URL=postgresql://portfolio:portfolio_pass@db:5432/portfolio

# Storage
MEDIA_ROOT=/app/media
MARKDOWN_DIR=markdown
MAX_UPLOAD_SIZE=10485760

# API
API_V1_PREFIX=/api/v1
CORS_ORIGINS=["http://localhost:3000"]

# Security
SECRET_KEY=change-this-in-production-use-openssl-rand-hex-32
```

### Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## Development Workflow

### Your Daily Workflow

1. **Write locally** - Use VS Code, Obsidian, or any markdown editor
2. **Create content** with frontmatter:

```markdown
---
slug: unique-slug-here
title: Content Title
summary: Brief description
category: Category Name
tags: [tag1, tag2]
readTime: 8
featured: true
---

# Your Content Here
```

3. **Upload** via UI at `http://localhost:3000/admin/upload`
4. **Preview** automatically at the generated URL
5. **Publish** by updating `is_published` field

### Backend Development

```bash
# Start backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# Create migration
alembic revision --autogenerate -m "description"

# Run migrations
alembic upgrade head

# Test API
curl http://localhost:8000/docs
```

### Frontend Development

```bash
# Start frontend
cd frontend
npm run dev

# Build for production
npm run build
npm start

# Type check
npm run lint
```

---

## API Reference

### Upload Content

```bash
POST /api/v1/content/upload?section={blog|project|case-study}
Content-Type: multipart/form-data

file: <markdown-file.md>
```

**Response:**
```json
{
  "id": "uuid",
  "section": "blog",
  "filename": "my-post.md",
  "metadata": {
    "slug": "my-post",
    "title": "My Post",
    "summary": "..."
  },
  "is_published": false,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### List Content

```bash
GET /api/v1/content/{section}?published_only=true&limit=100&offset=0
```

**Response:**
```json
[
  {
    "id": "uuid",
    "section": "blog",
    "filename": "my-post.md",
    "metadata": {...},
    "is_published": true,
    "published_at": "2024-01-01T00:00:00Z"
  }
]
```

### Get Content

```bash
GET /api/v1/content/{section}/{slug}
```

### Get Markdown

```bash
GET /api/v1/content/{section}/{slug}/markdown
```

**Response:**
```json
{
  "content": "# Markdown content...",
  "metadata": {...}
}
```

### Update Content

```bash
PATCH /api/v1/content/{uuid}
Content-Type: application/json

{
  "is_published": true,
  "metadata": {...}
}
```

### Delete Content

```bash
DELETE /api/v1/content/{uuid}
```

---

## Production Deployment

### Option 1: Docker Compose (Simple)

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    restart: always
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
      SECRET_KEY: ${SECRET_KEY}
    volumes:
      - media_data:/app/media
    depends_on:
      - db

  frontend:
    build: ./frontend
    restart: always
    environment:
      NEXT_PUBLIC_API_URL: ${API_URL}
    ports:
      - "3000:3000"
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - frontend
      - backend

volumes:
  postgres_data:
  media_data:
```

Deploy:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Option 2: Separate Services

#### Backend (Railway/Render/Fly.io)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
cd backend
railway login
railway init
railway up
```

#### Frontend (Vercel/Netlify)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

#### Database (Supabase/Neon/Railway)

Use managed PostgreSQL service and update `DATABASE_URL`

---

## Monitoring & Maintenance

### Health Checks

```bash
# Backend
curl http://localhost:8000/health

# Database
docker-compose exec db psql -U portfolio -d portfolio -c "SELECT COUNT(*) FROM content_files;"
```

### Backups

```bash
# Database backup
docker-compose exec db pg_dump -U portfolio portfolio > backup.sql

# Restore
docker-compose exec -T db psql -U portfolio portfolio < backup.sql

# Media files backup
tar -czf media-backup.tar.gz backend/media/
```

### Logs

```bash
# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Backend logs
docker-compose exec backend tail -f /var/log/app.log
```

---

## Troubleshooting

### Common Issues

**Issue: Database connection failed**
```bash
# Check if database is running
docker-compose ps

# Check connection string
docker-compose exec backend env | grep DATABASE_URL

# Test connection
docker-compose exec db psql -U portfolio -d portfolio
```

**Issue: File upload fails**
```bash
# Check permissions
docker-compose exec backend ls -la /app/media/markdown

# Create directories
docker-compose exec backend mkdir -p /app/media/markdown/{blog,project,case-study}
```

**Issue: Frontend can't reach backend**
```bash
# Check CORS settings
# Verify NEXT_PUBLIC_API_URL in .env.local
# Check backend CORS_ORIGINS in .env
```

**Issue: Migration fails**
```bash
# Reset migrations (DANGER: drops all data)
docker-compose exec backend alembic downgrade base
docker-compose exec backend alembic upgrade head

# Or create new migration
docker-compose exec backend alembic revision --autogenerate -m "fix"
```

---

## Performance Optimization

### Backend

1. **Database Indexing** - Already included in migration
2. **Connection Pooling** - Configured in `database.py`
3. **Caching** - Add Redis for content caching:

```python
from redis import Redis
from functools import lru_cache

redis_client = Redis(host='redis', port=6379, decode_responses=True)

@lru_cache(maxsize=100)
def get_cached_content(section: str, slug: str):
    cache_key = f"content:{section}:{slug}"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    
    content = service.get_by_slug(section, slug)
    redis_client.setex(cache_key, 3600, json.dumps(content))
    return content
```

### Frontend

1. **ISR (Incremental Static Regeneration)** - Already configured
2. **Image Optimization** - Use Next.js Image component
3. **Code Splitting** - Automatic with Next.js
4. **CDN** - Deploy static assets to CDN

---

## Security Checklist

- [ ] Change `SECRET_KEY` in production
- [ ] Use strong database password
- [ ] Enable HTTPS with SSL certificates
- [ ] Set proper CORS origins
- [ ] Add rate limiting to API
- [ ] Implement authentication for admin routes
- [ ] Validate file uploads (size, type)
- [ ] Sanitize user inputs
- [ ] Regular security updates
- [ ] Enable database backups

---

## Next Steps

### Phase 1: MVP ✅
- [x] Backend API
- [x] Frontend rendering
- [x] Upload system
- [x] Blog section

### Phase 2: Enhancement
- [ ] Add authentication (Auth0/NextAuth)
- [ ] Image upload support
- [ ] Search functionality
- [ ] RSS feed generation
- [ ] SEO optimization
- [ ] Analytics integration

### Phase 3: Advanced
- [ ] Multi-user support
- [ ] Content scheduling
- [ ] Version history
- [ ] Content analytics
- [ ] Email notifications
- [ ] API rate limiting

---

## Resources

### Documentation
- FastAPI: https://fastapi.tiangolo.com
- Next.js: https://nextjs.org/docs
- SQLAlchemy: https://docs.sqlalchemy.org
- Alembic: https://alembic.sqlalchemy.org

### Tools
- VS Code with extensions:
  - Python
  - Markdown All in One
  - ESLint
  - Tailwind CSS IntelliSense

### Testing
```bash
# Backend tests
pytest

# Frontend tests
npm test

# E2E tests
npx playwright test
```

---

## Support

For issues or questions:
1. Check logs: `docker-compose logs`
2. Review API docs: `http://localhost:8000/docs`
3. Check this guide's troubleshooting section
4. Open an issue on GitHub

---

**Built with ❤️ using FastAPI + Next.js + PostgreSQL**
