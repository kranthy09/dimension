# Portfolio - Markdown-First Content System

A production-ready portfolio site with FastAPI backend and Next.js frontend for managing blog posts, projects, and case studies through markdown files.

## Features

- **Markdown-First**: Write in your favorite editor, upload, and publish
- **Three Content Types**: Blog posts, Projects, and Case Studies
- **Type-Safe**: Full TypeScript + Pydantic validation
- **Modern Stack**: FastAPI, PostgreSQL, Next.js 14, Tailwind CSS
- **Docker Ready**: One-command deployment
- **Admin Interface**: Simple web upload UI
- **Syntax Highlighting**: Beautiful code rendering
- **SEO Friendly**: Server-side rendering with Next.js

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### 1. Start Services

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- FastAPI backend on port 8000
- Next.js frontend on port 3000

### 2. Verify Services

```bash
# Check all services are running
docker-compose ps

# View logs
docker-compose logs -f
```

You should see:
- Backend API: http://localhost:8000/docs
- Frontend: http://localhost:3000
- Database: localhost:5432

### 3. Create Your First Post

#### Using the Script

```bash
# Generate template
python scripts/generate_template.py blog my-first-post "My First Post"

# Edit the file
vim my-first-post.md

# Upload via API
curl -X POST "http://localhost:8000/api/v1/content/upload?section=blog" \
  -F "file=@my-first-post.md"

# Get the UUID from response and publish
curl -X PATCH "http://localhost:8000/api/v1/content/{uuid}" \
  -H "Content-Type: application/json" \
  -d '{"is_published": true}'
```

#### Using the Web UI

1. Visit http://localhost:3000/admin/upload
2. Select "Blog" section
3. Choose your markdown file
4. Click "Upload"

### 4. View Your Content

Visit http://localhost:3000/blog to see your published posts!

## Project Structure

```
portfolio/
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── api/routes/      # API endpoints
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utilities
│   ├── alembic/             # Database migrations
│   └── media/markdown/      # Uploaded files
│
├── frontend/                # Next.js application
│   └── src/
│       ├── app/             # Pages (App Router)
│       ├── components/      # React components
│       ├── lib/             # API client & utils
│       └── styles/          # CSS files
│
├── scripts/                 # Utility scripts
│   ├── generate_template.py
│   ├── bulk_upload.py
│   └── validate_frontmatter.py
│
└── docker-compose.yml
```

## Frontmatter Templates

### Blog Post

```yaml
---
slug: unique-slug-here
title: Post Title
summary: Brief description
category: Tech
tags: [python, fastapi, nextjs]
readTime: 8
featured: false
---
```

### Project

```yaml
---
slug: project-slug
title: Project Name
summary: What it does
techStack: [Next.js, FastAPI, PostgreSQL]
deployedUrl: https://example.com
codebaseUrl: https://github.com/user/repo
featured: false
---
```

### Case Study

```yaml
---
slug: case-study-slug
title: Case Study Title
summary: What you accomplished
category: System Design
tags: [architecture, scalability]
featured: false
---
```

## API Endpoints

### Upload Content
```
POST /api/v1/content/upload?section={blog|project|case-study}
```

### List Content
```
GET /api/v1/content/{section}?published_only=true
```

### Get by Slug
```
GET /api/v1/content/{section}/{slug}
```

### Get Markdown
```
GET /api/v1/content/{section}/{slug}/markdown
```

### Update (Publish)
```
PATCH /api/v1/content/{uuid}
Body: {"is_published": true}
```

### Delete
```
DELETE /api/v1/content/{uuid}
```

## Utility Scripts

### Generate Template
```bash
python scripts/generate_template.py blog my-slug "My Title"
```

### Validate Before Upload
```bash
python scripts/validate_frontmatter.py ./content blog
```

### Bulk Upload
```bash
python scripts/bulk_upload.py ./content/blog blog
```

## Development

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Rebuild
docker-compose up --build

# Execute commands in backend
docker-compose exec backend bash
docker-compose exec backend alembic upgrade head

# Database shell
docker-compose exec db psql -U portfolio -d portfolio
```

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://portfolio:portfolio_pass@db:5432/portfolio
MEDIA_ROOT=/app/media
CORS_ORIGINS=["http://localhost:3000"]
SECRET_KEY=change-in-production
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Production Deployment

### Option 1: Single Server (Docker Compose)

```bash
# Update environment variables in .env files
# Build and start
docker-compose -f docker-compose.yml up -d
```

### Option 2: Separate Services

- **Backend**: Deploy to Railway, Render, or Fly.io
- **Frontend**: Deploy to Vercel or Netlify
- **Database**: Use managed PostgreSQL (Supabase, Neon, etc.)

### Production Checklist

- [ ] Change `SECRET_KEY` in backend/.env
- [ ] Use strong database password
- [ ] Enable HTTPS
- [ ] Set proper CORS origins
- [ ] Add authentication for admin routes
- [ ] Implement rate limiting
- [ ] Set up backups
- [ ] Configure monitoring

## Troubleshooting

### Backend not starting
```bash
docker-compose logs backend
# Common: Database not ready - wait and retry
```

### Frontend can't connect
```bash
# Check NEXT_PUBLIC_API_URL in frontend/.env.local
# Check CORS_ORIGINS in backend/.env
```

### Upload fails
```bash
# Check file permissions
docker-compose exec backend ls -la /app/media/markdown
```

## Tech Stack

### Backend
- FastAPI - Modern Python web framework
- SQLAlchemy - ORM with PostgreSQL
- Alembic - Database migrations
- Pydantic - Data validation

### Frontend
- Next.js 14 - React framework with App Router
- TypeScript - Type safety
- Tailwind CSS - Utility-first styling
- react-markdown - Markdown rendering
- react-syntax-highlighter - Code highlighting

### Infrastructure
- Docker & Docker Compose
- PostgreSQL 15
- Nginx (production)

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ for writers who code.
