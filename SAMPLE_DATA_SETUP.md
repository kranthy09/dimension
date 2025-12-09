# Sample Data Population Guide

Complete guide for populating sample data in local development and production environments.

---

## Overview

The `scripts/populate_sample_data.py` script creates sample content for:
- 1 Blog post
- 1 Project
- 1 Case study

This data helps test and demonstrate the portfolio functionality.

---

## Local Development Setup

### Prerequisites
- Docker containers running (`docker-compose up -d`)
- Backend service healthy and accessible
- Database initialized with migrations

### Method 1: Using Docker Exec (Recommended)

```bash
# 1. Ensure containers are running
docker-compose ps

# 2. Run the populate script inside the backend container
docker-compose exec backend python /app/scripts/populate_sample_data.py

# 3. Verify data was created
docker-compose exec backend python -c "
from app.database import SessionLocal
from app.models.content_file import ContentFile

db = SessionLocal()
count = db.query(ContentFile).count()
print(f'Total content items: {count}')
db.close()
"
```

### Method 2: Direct Python Execution

```bash
# 1. Navigate to project root
cd /home/kranthi/Projects/dimension

# 2. Set environment variables
export DATABASE_URL="postgresql://frontuser:frontpass@localhost:5432/portfolio"

# 3. Run the script
python3 scripts/populate_sample_data.py
```

### Method 3: Using Docker Run (One-off Command)

```bash
docker-compose run --rm backend python /app/scripts/populate_sample_data.py
```

### Expected Output (Local)

```
============================================================
SAMPLE DATA POPULATION SCRIPT
============================================================
Clearing existing sample data...

Adding blog posts...
  ✓ Added: Mastering Python Async/Await: A Deep Dive

Adding projects...
  ✓ Added: Real-Time Chat Application

Adding case studies...
  ✓ Added: E-Commerce Platform Performance Optimization

✅ Sample data populated successfully!

Total items created:
  - Blog posts: 1
  - Projects: 1
  - Case studies: 1

============================================================
DONE!
============================================================
```

### Verify in Browser (Local)

```bash
# Visit these URLs:
http://localhost:3000/blog          # Should show 1 blog post
http://localhost:3000/projects      # Should show 1 project
http://localhost:3000/case-studies  # Should show 1 case study
```

---

## Production VPS Setup

### Prerequisites
- SSH access to VPS server
- Docker containers running on VPS
- Backend service healthy
- Database initialized

### Step 1: Connect to VPS

```bash
# SSH into your VPS
ssh user@your-vps-ip

# Navigate to project directory
cd /path/to/dimension
```

### Step 2: Check Container Status

```bash
# Verify all containers are running
docker-compose ps

# Check backend logs
docker-compose logs backend --tail=50
```

### Step 3: Run Population Script

**Method A: Using Docker Exec (Recommended)**

```bash
# Run the script inside the running backend container
docker-compose exec backend python /app/scripts/populate_sample_data.py
```

**Method B: Using Docker Run (If backend is stopped)**

```bash
# Run as a one-off command
docker-compose run --rm backend python /app/scripts/populate_sample_data.py
```

### Step 4: Verify Data Creation

```bash
# Check database directly
docker-compose exec backend python -c "
from app.database import SessionLocal
from app.models.content_file import ContentFile

db = SessionLocal()
items = db.query(ContentFile).all()
print(f'\nTotal items: {len(items)}')
for item in items:
    print(f'  - {item.section}: {item.metajson[\"title\"]}')
db.close()
"
```

### Step 5: Verify in Browser (Production)

```bash
# Visit these URLs on your production domain:
https://your-domain.com/blog
https://your-domain.com/projects
https://your-domain.com/case-studies
```

---

## Environment Variables

### Required Variables

The script uses these environment variables:

```bash
DATABASE_URL=postgresql://frontuser:frontpass@db:5432/portfolio
```

### Local Development (.env or .env.local)

```env
DATABASE_URL=postgresql://frontuser:frontpass@localhost:5432/portfolio
```

### Production (.env.production)

```env
DATABASE_URL=postgresql://frontuser:frontpass@db:5432/portfolio
```

**Note:** When running inside Docker, use `db` as the hostname. When running on host, use `localhost`.

---

## File Structure Created

The script creates markdown files in the backend media directory:

```
backend/media/markdown/
├── blog/
│   └── mastering-python-async.md
├── project/
│   └── realtime-chat-app.md
└── case-study/
    └── e-commerce-performance-optimization.md
```

Each file contains:
- Frontmatter with metadata (title, slug, tags, etc.)
- Markdown content

Database entries are created in the `content_files` table with:
- UUID
- Section (blog/project/case-study)
- Filename
- File path
- Metadata JSON
- Published status and timestamp

---

## Troubleshooting

### Error: "No module named 'app'"

**Cause:** Python path not set correctly

**Solution:**
```bash
# When running locally, set PYTHONPATH
export PYTHONPATH=/home/kranthi/Projects/dimension/backend:$PYTHONPATH
python3 scripts/populate_sample_data.py

# Or use Docker (recommended)
docker-compose exec backend python /app/scripts/populate_sample_data.py
```

### Error: "Could not connect to database"

**Cause:** Database not accessible or wrong connection string

**Solution:**
```bash
# Check if database container is running
docker-compose ps db

# Check database logs
docker-compose logs db --tail=50

# Test database connection
docker-compose exec db psql -U frontuser -d portfolio -c "SELECT 1;"
```

### Error: "Permission denied" creating markdown files

**Cause:** Insufficient permissions on media directory

**Solution:**
```bash
# Fix permissions (adjust user as needed)
sudo chown -R $USER:$USER backend/media/markdown
chmod -R 755 backend/media/markdown

# Or create directories manually
mkdir -p backend/media/markdown/{blog,project,case-study}
```

### Script runs but no data appears in frontend

**Possible causes:**

1. **Frontend not fetching from correct API endpoint**
   ```bash
   # Check API is accessible
   curl http://localhost:8000/api/v1/content/blog
   ```

2. **CORS issues** - Check backend logs for CORS errors
   ```bash
   docker-compose logs backend | grep -i cors
   ```

3. **Frontend cache** - Clear browser cache and reload

4. **Items not published**
   ```bash
   # Check if items are marked as published
   docker-compose exec backend python -c "
   from app.database import SessionLocal
   from app.models.content_file import ContentFile

   db = SessionLocal()
   items = db.query(ContentFile).all()
   for item in items:
       print(f'{item.filename}: published={item.is_published}')
   db.close()
   "
   ```

---

## Clear Sample Data

If you need to remove sample data and start fresh:

```bash
# Method 1: Using Python
docker-compose exec backend python -c "
from app.database import SessionLocal
from app.models.content_file import ContentFile

db = SessionLocal()
db.query(ContentFile).delete()
db.commit()
print('All content deleted')
db.close()
"

# Method 2: SQL directly
docker-compose exec db psql -U frontuser -d portfolio -c "DELETE FROM content_files;"

# Then re-run the population script
docker-compose exec backend python /app/scripts/populate_sample_data.py
```

---

## Customizing Sample Data

To modify the sample content, edit `/home/kranthi/Projects/dimension/scripts/populate_sample_data.py`:

```python
# Lines 35-90: BLOG_POSTS list
BLOG_POSTS = [
    {
        "slug": "your-custom-slug",
        "title": "Your Custom Title",
        "summary": "Your summary here",
        # ... more fields
    }
]

# Lines 92-160: PROJECTS list
# Lines 162-280: CASE_STUDIES list
```

**Remember:** Follow PEP 8 guidelines (max 79 characters per line).

---

## Production Best Practices

### 1. Backup Before Populating

```bash
# Backup production database first
docker-compose exec db pg_dump -U frontuser portfolio > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Run in Maintenance Window

If replacing existing data, schedule during low-traffic periods.

### 3. Test on Staging First

```bash
# Use a staging environment to test the script
docker-compose -f docker-compose.staging.yml exec backend python /app/scripts/populate_sample_data.py
```

### 4. Monitor Logs

```bash
# Watch backend logs during population
docker-compose logs -f backend
```

---

## Automation Scripts

### Local Development Helper

Create `scripts/populate_local.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Populating local development database..."

# Check if containers are running
if ! docker-compose ps | grep -q "Up"; then
    echo "❌ Docker containers not running. Starting..."
    docker-compose up -d
    sleep 5
fi

# Run population script
docker-compose exec backend python /app/scripts/populate_sample_data.py

echo "✅ Done! Visit http://localhost:3000 to see the data"
```

### Production Helper

Create `scripts/populate_production.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Populating production database..."

# Confirm with user
read -p "⚠️  This will modify production data. Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted"
    exit 1
fi

# Backup first
echo "📦 Creating backup..."
docker-compose exec db pg_dump -U frontuser portfolio > "backup_$(date +%Y%m%d_%H%M%S).sql"

# Run population script
echo "📝 Populating data..."
docker-compose exec backend python /app/scripts/populate_sample_data.py

echo "✅ Done! Check your production site"
```

**Make scripts executable:**

```bash
chmod +x scripts/populate_local.sh
chmod +x scripts/populate_production.sh
```

---

## Summary

### Local Development
```bash
# Quick command
docker-compose exec backend python /app/scripts/populate_sample_data.py
```

### Production VPS
```bash
# SSH to VPS first
ssh user@vps-ip

# Navigate to project
cd /path/to/dimension

# Run script
docker-compose exec backend python /app/scripts/populate_sample_data.py
```

### Verify
- Check backend logs for success messages
- Visit frontend URLs to see content
- Query database to confirm records created

---

## Next Steps

After populating sample data:

1. **Test Content Display**
   - Browse to `/blog`, `/projects`, `/case-studies`
   - Verify cards display correctly
   - Test mobile responsiveness

2. **Test Detail Pages**
   - Click on sample content
   - Verify markdown rendering
   - Check metadata display

3. **Upload Your Own Content**
   - Use `/admin/upload` page
   - Replace sample data with real content
   - Follow markdown formatting in sample files

---

## Support

If you encounter issues:

1. Check Docker logs: `docker-compose logs backend`
2. Verify database connection: `docker-compose exec db psql -U frontuser -d portfolio`
3. Review script output for error messages
4. Check file permissions on `backend/media/markdown/`

For PEP 8 compliance issues in the script, ensure all lines are ≤79 characters.
