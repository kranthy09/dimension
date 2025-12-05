# Database Migration Guide

## Quick Fix Applied

✅ **Fixed**: Added missing dependency injection in `get_content_service` function
- Added `Depends(get_db)` to the function parameter
- Imported `Depends` and `get_db` in content_service.py

---

## Migration Commands

### Option 1: Fresh Start (Recommended - Destroys Existing Data)

```bash
# Stop all services
docker-compose down -v

# Rebuild containers
docker-compose build

# Start services (migrations run automatically via entrypoint.sh)
docker-compose up -d

# Check if migrations succeeded
docker-compose logs backend | grep -i "alembic\|migration"
```

### Option 2: Run Migrations Manually (If Services Already Running)

```bash
# Run migrations
docker-compose exec backend alembic upgrade head

# Verify migration status
docker-compose exec backend alembic current

# Restart backend to ensure changes take effect
docker-compose restart backend
```

### Option 3: Check Migration History

```bash
# Show current migration version
docker-compose exec backend alembic current

# Show migration history
docker-compose exec backend alembic history

# Show pending migrations
docker-compose exec backend alembic heads
```

---

## Verify Everything Works

### 1. Check Backend is Running

```bash
# Check service status
docker-compose ps

# Check backend logs
docker-compose logs -f backend

# Should see:
# ✓ "Running database migrations..."
# ✓ "INFO [alembic.runtime.migration] Running upgrade -> 001"
# ✓ "Starting FastAPI server..."
# ✓ "Uvicorn running on http://0.0.0.0:8000"
```

### 2. Test API

```bash
# Health check
curl http://localhost:8000/health
# Expected: {"status":"healthy"}

# Check API docs
open http://localhost:8000/docs
```

### 3. Check Database Schema

```bash
# Connect to database
docker-compose exec db psql -U portfolio -d portfolio

# List tables
\dt

# Expected output:
#  public | alembic_version | table | portfolio
#  public | content_files   | table | portfolio

# Describe content_files table
\d content_files

# Should show 'metajson' column (not 'metadata')

# Exit psql
\q
```

---

## Database Schema Verification

After migration, the `content_files` table should have:

```sql
Column        | Type                     | Nullable
--------------+--------------------------+---------
id            | uuid                     | not null
section       | character varying(50)    | not null
filename      | character varying(255)   | not null
file_path     | character varying(500)   | not null
metajson      | jsonb                    | not null  ← Note: metajson, not metadata
is_published  | boolean                  |
published_at  | timestamp with time zone |
created_at    | timestamp with time zone |
updated_at    | timestamp with time zone |

Indexes:
    "content_files_pkey" PRIMARY KEY, btree (id)
    "idx_section_filename" UNIQUE, btree (section, filename)
    "idx_content_files_section" btree (section)
    "idx_metajson_gin" gin (metajson)
    "idx_published" btree (is_published, published_at)
```

---

## Troubleshooting

### Issue: Migration Fails

```bash
# Check error details
docker-compose logs backend

# Common issues:
# 1. Database not ready
#    Solution: Wait 10 seconds and restart backend
docker-compose restart backend

# 2. Old database schema exists
#    Solution: Clean start
docker-compose down -v && docker-compose build && docker-compose up -d

# 3. Permission issues
#    Solution: Recreate media directories
docker-compose exec backend mkdir -p /app/media/markdown/{blog,project,case-study}
docker-compose exec backend chmod -R 755 /app/media
```

### Issue: "Table already exists"

```bash
# This means you have old schema with 'metadata' column
# Option A: Clean start (destroys data)
docker-compose down -v
docker-compose build
docker-compose up -d

# Option B: Manually rename column (preserves data)
docker-compose exec db psql -U portfolio -d portfolio -c "
ALTER TABLE content_files RENAME COLUMN metadata TO metajson;
DROP INDEX IF EXISTS idx_metadata_gin;
CREATE INDEX idx_metajson_gin ON content_files USING gin(metajson);
UPDATE alembic_version SET version_num = '001';
"
docker-compose restart backend
```

### Issue: Backend Won't Start

```bash
# Check Python import errors
docker-compose logs backend | grep -i "error\|traceback"

# Rebuild backend
docker-compose build backend
docker-compose up -d backend
```

---

## Create a New Migration (Future Reference)

If you need to create additional migrations:

```bash
# Generate new migration
docker-compose exec backend alembic revision --autogenerate -m "description of changes"

# This creates a new file in backend/alembic/versions/

# Review the generated migration
# Edit if needed

# Apply migration
docker-compose exec backend alembic upgrade head
```

---

## Rollback Migration (If Needed)

```bash
# Downgrade one version
docker-compose exec backend alembic downgrade -1

# Downgrade to specific version
docker-compose exec backend alembic downgrade <revision_id>

# Downgrade to base (removes all migrations)
docker-compose exec backend alembic downgrade base
```

---

## Complete Fresh Start Script

Save this as `fresh-start.sh`:

```bash
#!/bin/bash
echo "🗑️  Stopping and removing all containers and volumes..."
docker-compose down -v

echo "🔨 Rebuilding containers..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 10

echo "📊 Checking service status..."
docker-compose ps

echo "🔍 Checking backend logs..."
docker-compose logs backend | tail -20

echo ""
echo "✅ Done! Check if services are running:"
echo "   Backend: http://localhost:8000/docs"
echo "   Frontend: http://localhost:3000"
echo "   Health: curl http://localhost:8000/health"
```

Make it executable and run:

```bash
chmod +x fresh-start.sh
./fresh-start.sh
```

---

## Summary

**Recommended approach**: Clean start (Option 1)

```bash
docker-compose down -v
docker-compose build
docker-compose up -d
```

This ensures:
- ✅ Fresh database with correct schema
- ✅ `metajson` column instead of `metadata`
- ✅ All migrations applied
- ✅ Backend starts correctly
- ✅ No dependency issues

---

**Next Steps After Migration**:
1. Test upload: `python scripts/generate_template.py blog test "Test"`
2. Upload via UI: http://localhost:3000/admin/upload
3. Check API: http://localhost:8000/docs
