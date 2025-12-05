# Portfolio System - Quick Reference Card

**⚡ Essential Commands & Workflows**

---

## 🚀 Getting Started

```bash
# 1. Start everything
docker-compose up -d

# 2. Run migrations
docker-compose exec backend alembic upgrade head

# 3. Check status
docker-compose ps

# 4. View logs
docker-compose logs -f
```

---

## 📝 Content Creation Workflow

### Method 1: Generate Template → Edit → Upload

```bash
# Generate template
python scripts/generate_template.py blog my-post "My Post Title"

# Edit in your editor (VS Code, Obsidian, etc.)
code my-post.md

# Upload
curl -X POST "http://localhost:8000/api/v1/content/upload?section=blog" \
  -F "file=@my-post.md"

# Publish (get UUID from upload response)
curl -X PATCH "http://localhost:8000/api/v1/content/{uuid}" \
  -H "Content-Type: application/json" \
  -d '{"is_published": true}'
```

### Method 2: Web UI

```bash
# 1. Open admin interface
open http://localhost:3000/admin/upload

# 2. Select section (blog/project/case-study)
# 3. Choose file
# 4. Click upload
```

---

## 📋 Frontmatter Templates

### Blog Post

```yaml
---
slug: unique-slug-here
title: Post Title
summary: Brief description
category: Tech
tags: [tag1, tag2, tag3]
readTime: 8
thumbnail: /images/blog/slug.png
featured: false
---
```

### Project

```yaml
---
slug: project-slug
title: Project Name
summary: What it does
reason: Why you built it
techStack: [Tech1, Tech2, Tech3]
deployedUrl: https://example.com
codebaseUrl: https://github.com/user/repo
thumbnail: /images/projects/slug.png
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
thumbnail: /images/cases/slug.png
featured: false
---
```

---

## 🔧 API Endpoints

### Upload
```bash
POST /api/v1/content/upload?section={blog|project|case-study}
Content-Type: multipart/form-data
Body: file=@filename.md
```

### List
```bash
GET /api/v1/content/{section}
Query: ?published_only=true&limit=100&offset=0
```

### Get by Slug
```bash
GET /api/v1/content/{section}/{slug}
```

### Get Markdown
```bash
GET /api/v1/content/{section}/{slug}/markdown
```

### Update
```bash
PATCH /api/v1/content/{uuid}
Body: {"is_published": true, "metadata": {...}}
```

### Delete
```bash
DELETE /api/v1/content/{uuid}
```

---

## 🛠️ Utility Scripts

### Validate Before Upload
```bash
python scripts/validate_frontmatter.py ./my-content blog
```

### Bulk Upload
```bash
python scripts/bulk_upload.py ./my-content blog
```

### Generate Template
```bash
python scripts/generate_template.py {section} {slug} {title}
```

---

## 🐳 Docker Commands

### Start Services
```bash
docker-compose up -d                    # Start in background
docker-compose up                       # Start with logs
docker-compose up --build               # Rebuild and start
```

### Stop Services
```bash
docker-compose down                     # Stop services
docker-compose down -v                  # Stop and remove volumes
```

### View Logs
```bash
docker-compose logs -f                  # All services
docker-compose logs -f backend          # Backend only
docker-compose logs -f frontend         # Frontend only
docker-compose logs --tail=100 backend  # Last 100 lines
```

### Execute Commands
```bash
docker-compose exec backend bash        # Backend shell
docker-compose exec db psql -U portfolio # Database shell
docker-compose exec backend alembic upgrade head # Run migrations
```

### Restart Services
```bash
docker-compose restart                  # All services
docker-compose restart backend          # Backend only
```

---

## 🗄️ Database Operations

### Access Database
```bash
docker-compose exec db psql -U portfolio -d portfolio
```

### Common Queries
```sql
-- List all content
SELECT section, metadata->>'title', is_published FROM content_files;

-- Count by section
SELECT section, COUNT(*) FROM content_files GROUP BY section;

-- Published content
SELECT metadata->>'title', published_at 
FROM content_files 
WHERE is_published = true 
ORDER BY published_at DESC;

-- Find by slug
SELECT * FROM content_files 
WHERE metadata->>'slug' = 'your-slug';
```

### Backup & Restore
```bash
# Backup
docker-compose exec db pg_dump -U portfolio portfolio > backup.sql

# Restore
docker-compose exec -T db psql -U portfolio portfolio < backup.sql
```

---

## 🔍 Troubleshooting

### Backend not starting
```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. Database not ready → Wait 10 seconds, retry
# 2. Port in use → Change port in docker-compose.yml
# 3. Migration error → Check alembic logs
```

### Frontend not connecting to backend
```bash
# Check .env.local
echo $NEXT_PUBLIC_API_URL  # Should be http://localhost:8000/api/v1

# Check CORS in backend/.env
grep CORS_ORIGINS backend/.env  # Should include http://localhost:3000
```

### Upload fails
```bash
# Check file permissions
docker-compose exec backend ls -la /app/media/markdown

# Create directories if missing
docker-compose exec backend mkdir -p /app/media/markdown/{blog,project,case-study}
docker-compose exec backend chmod -R 755 /app/media
```

### Database connection fails
```bash
# Check database is running
docker-compose ps db

# Test connection
docker-compose exec backend python -c "from app.database import engine; print(engine.connect())"
```

---

## 📊 Health Checks

```bash
# Backend health
curl http://localhost:8000/health

# API docs
open http://localhost:8000/docs

# Frontend
open http://localhost:3000

# Database
docker-compose exec db pg_isready -U portfolio
```

---

## 🎯 Development Workflow

### Local Development

```bash
# Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# Frontend
cd frontend
npm run dev
```

### Make Changes

```bash
# After code changes
docker-compose restart backend    # Backend changes
docker-compose restart frontend   # Frontend changes

# After adding dependencies
docker-compose up --build         # Rebuild containers
```

### Create Migration

```bash
docker-compose exec backend alembic revision --autogenerate -m "description"
docker-compose exec backend alembic upgrade head
```

---

## 🚢 Production Deployment

### Pre-flight Checklist
```bash
# 1. Update environment variables
- Change SECRET_KEY
- Update DATABASE_URL
- Set production CORS_ORIGINS
- Update NEXT_PUBLIC_API_URL

# 2. Build production images
docker-compose -f docker-compose.prod.yml build

# 3. Run migrations
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

# 4. Start services
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔐 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
MEDIA_ROOT=/app/media
MARKDOWN_DIR=markdown
API_V1_PREFIX=/api/v1
CORS_ORIGINS=["http://localhost:3000"]
SECRET_KEY=change-in-production
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## 📱 URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **Admin Upload:** http://localhost:3000/admin/upload
- **Database:** localhost:5432

---

## 🎨 Content URLs

After uploading content, access at:
- Blog: `/blog/{slug}`
- Project: `/projects/{slug}`
- Case Study: `/case-studies/{slug}`

Example: `http://localhost:3000/blog/my-first-post`

---

## 📦 Dependencies

### Backend
```bash
pip install -r requirements.txt
```

### Frontend
```bash
npm install
```

---

## 🧪 Testing

### Test Upload
```bash
# Create test file
cat > test.md << 'EOF'
---
slug: test-post
title: Test Post
summary: Testing the system
category: Tech
---
# Test
This is a test.
EOF

# Upload
curl -X POST "http://localhost:8000/api/v1/content/upload?section=blog" \
  -F "file=@test.md"
```

### Test API
```bash
# List content
curl http://localhost:8000/api/v1/content/blog

# Get by slug
curl http://localhost:8000/api/v1/content/blog/test-post

# Get markdown
curl http://localhost:8000/api/v1/content/blog/test-post/markdown
```

---

## 💡 Pro Tips

### Faster Uploads
```bash
# Add to .bashrc or .zshrc
alias upload-blog='curl -X POST "http://localhost:8000/api/v1/content/upload?section=blog" -F "file=@$1"'

# Usage
upload-blog my-post.md
```

### Auto-publish on Upload
```python
# Modify backend/app/services/content_service.py
content_file = ContentFile(
    section=section,
    filename=file.filename,
    file_path=file_path,
    metadata=metadata,
    is_published=True,  # Auto-publish
    published_at=datetime.now()
)
```

### Watch for Changes
```bash
# Auto-upload on file change (requires fswatch)
fswatch -o *.md | xargs -n1 -I{} curl -X POST \
  "http://localhost:8000/api/v1/content/upload?section=blog" \
  -F "file=@changed-file.md"
```

---

## 🔄 Common Workflows

### Daily Writing Flow
```
1. Write → VS Code/Obsidian
2. Validate → python scripts/validate_frontmatter.py
3. Upload → Web UI or curl
4. Review → http://localhost:3000/blog/{slug}
5. Publish → PATCH request or manual
```

### Bulk Migration
```
1. Create markdown files
2. Validate all → validate_frontmatter.py
3. Bulk upload → bulk_upload.py
4. Publish selected → API calls
```

---

## 🎯 Key Files to Customize

```
backend/
├── app/config.py                  # Configuration
├── app/models/content_file.py     # Data model
└── app/schemas/content_file.py    # Validation

frontend/
├── src/components/layout/Header.tsx  # Navigation
├── src/styles/globals.css            # Styling
└── src/app/page.tsx                  # Home page
```

---

**Print this card and keep it handy! 🎯**

*All commands tested on macOS/Linux. For Windows, use WSL or adjust commands accordingly.*
