# 🚀 Getting Started - Portfolio Site

Welcome! This guide will get your portfolio site running in 5 minutes.

## ✅ Step 1: Prerequisites

Make sure you have:
- Docker & Docker Compose installed
- Ports 3000, 8000, and 5432 available

## ✅ Step 2: Start the Services

```bash
# Start all services (database, backend, frontend)
docker-compose up -d

# This will:
# - Start PostgreSQL on port 5432
# - Start FastAPI backend on port 8000
# - Start Next.js frontend on port 3000
# - Run database migrations automatically
```

## ✅ Step 3: Verify Everything is Running

```bash
# Check services status
docker-compose ps

# You should see 3 services running:
# - db (postgres)
# - backend (fastapi)
# - frontend (nextjs)
```

Check these URLs:
- Frontend: http://localhost:3000
- Backend API Docs: http://localhost:8000/docs
- Backend Health: http://localhost:8000/health

## ✅ Step 4: Create Your First Blog Post

### Option A: Using the Script

```bash
# 1. Generate a template
python scripts/generate_template.py blog my-first-post "My First Blog Post"

# 2. Edit the file that was created
# Add your content to my-first-post.md

# 3. Upload it
curl -X POST "http://localhost:8000/api/v1/content/upload?section=blog" \
  -F "file=@my-first-post.md"

# 4. The response will include a UUID. Copy it and publish:
curl -X PATCH "http://localhost:8000/api/v1/content/{PASTE-UUID-HERE}" \
  -H "Content-Type: application/json" \
  -d '{"is_published": true}'

# 5. View it at: http://localhost:3000/blog/my-first-post
```

### Option B: Using the Web UI

```bash
# 1. Generate a template
python scripts/generate_template.py blog my-first-post "My First Blog Post"

# 2. Edit the file

# 3. Go to: http://localhost:3000/admin/upload

# 4. Select "Blog" and upload your file

# 5. Use the API or update database to publish it
```

## 📁 What You Have Now

```
dimension/
├── backend/              # FastAPI + PostgreSQL
│   ├── app/             # Application code
│   ├── alembic/         # Database migrations
│   └── media/           # Uploaded markdown files
│
├── frontend/            # Next.js + React
│   └── src/
│       ├── app/         # Pages
│       ├── components/  # UI components
│       └── lib/         # API client
│
├── scripts/             # Helper scripts
│   ├── generate_template.py
│   ├── bulk_upload.py
│   └── validate_frontmatter.py
│
└── docker-compose.yml   # Docker setup
```

## 🎯 Quick Commands

### Manage Services

```bash
# Stop all services
docker-compose down

# Restart a service
docker-compose restart backend
docker-compose restart frontend

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Rebuild after code changes
docker-compose up --build
```

### Work with Content

```bash
# Validate before uploading
python scripts/validate_frontmatter.py my-post.md blog

# Upload multiple files
python scripts/bulk_upload.py ./my-content blog

# Generate templates
python scripts/generate_template.py blog slug "Title"
python scripts/generate_template.py project slug "Title"
python scripts/generate_template.py case-study slug "Title"
```

### Database

```bash
# Access database
docker-compose exec db psql -U portfolio -d portfolio

# Run migrations
docker-compose exec backend alembic upgrade head

# Create new migration
docker-compose exec backend alembic revision --autogenerate -m "description"
```

## 📝 Frontmatter Examples

### Blog Post
```yaml
---
slug: understanding-recursion
title: Understanding Recursion in Depth
summary: A comprehensive guide to recursive thinking
category: DSA
tags: [algorithms, recursion, problem-solving]
readTime: 12
featured: true
---
```

### Project
```yaml
---
slug: ai-notes-app
title: AI-Powered Notes Enhancement
summary: Intelligent note-taking with AI suggestions
techStack: [Next.js, FastAPI, OpenAI]
deployedUrl: https://notes.example.com
codebaseUrl: https://github.com/user/notes
featured: true
---
```

### Case Study
```yaml
---
slug: event-driven-architecture
title: Event-Driven Architecture for Scale
summary: How I designed a system handling 10k events/sec
category: System Design
tags: [architecture, kafka, microservices]
featured: true
---
```

## 🔧 Troubleshooting

### Services won't start

```bash
# Check if ports are in use
lsof -i :3000  # Frontend
lsof -i :8000  # Backend
lsof -i :5432  # Database

# Check logs
docker-compose logs
```

### Database connection failed

```bash
# Wait a few seconds for database to initialize
# Then restart backend
docker-compose restart backend
```

### Frontend can't connect to backend

```bash
# Check environment variables
cat frontend/.env.local
# Should have: NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Check CORS settings
cat backend/.env
# Should include: CORS_ORIGINS=["http://localhost:3000"]
```

### Upload fails

```bash
# Check media directory permissions
docker-compose exec backend ls -la /app/media/markdown

# Create directories if needed
docker-compose exec backend mkdir -p /app/media/markdown/{blog,project,case-study}
```

## 🎨 Customization

### Change Site Name

Edit `frontend/src/components/layout/Header.tsx`:
```typescript
<Link href="/" className="text-xl font-bold">
  Your Name  {/* Change this */}
</Link>
```

### Change Home Page Content

Edit `frontend/src/app/page.tsx`

### Add Your Info

Edit `frontend/src/components/layout/Footer.tsx`

## 📚 Next Steps

1. ✅ Customize the styling (Tailwind CSS in `frontend/src/styles/globals.css`)
2. ✅ Add your own content
3. ✅ Set up a custom domain
4. ✅ Deploy to production (see `deployment-guide.md`)
5. ✅ Add authentication (if needed)

## 🆘 Need Help?

- Read the full documentation: `portfolio-README.md`
- Check API docs: http://localhost:8000/docs
- View quick reference: `QUICK-REFERENCE.md`

## 🎉 You're All Set!

Your portfolio site is now running. Start writing and sharing your work!

---

**Important URLs:**
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/docs
- Admin Upload: http://localhost:3000/admin/upload
