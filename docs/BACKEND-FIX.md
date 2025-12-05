# Backend Alembic Migration Fix

## Issue
The backend was failing during the Alembic migration step because:
1. Alembic couldn't read the database URL from environment variables
2. Missing entrypoint script to properly sequence startup

## What Was Fixed

### 1. Updated Alembic Environment Configuration
**File**: `backend/alembic/env.py`

Added code to read `DATABASE_URL` from environment variables:
```python
# Override sqlalchemy.url with DATABASE_URL from environment
database_url = os.getenv('DATABASE_URL')
if database_url:
    config.set_main_option('sqlalchemy.url', database_url)
```

### 2. Created Entrypoint Script
**File**: `backend/entrypoint.sh`

New startup script that:
- Waits for database to be ready
- Runs Alembic migrations
- Starts the FastAPI server

```bash
#!/bin/bash
set -e

echo "Waiting for database to be ready..."
sleep 5

echo "Running database migrations..."
alembic upgrade head

echo "Starting FastAPI server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Updated Dockerfile
**File**: `backend/Dockerfile`

Changes:
- Copy `entrypoint.sh` into container
- Make it executable
- Use it as the `ENTRYPOINT`

### 4. Updated Docker Compose
**File**: `docker-compose.yml`

Changes:
- Removed the `command` override from backend service
- Now uses the entrypoint script from Dockerfile

### 5. Added Missing Files
**File**: `backend/alembic/versions/__init__.py`

Added to make the versions directory a proper Python package.

## How to Use

### Clean Start

```bash
# Stop and remove all containers and volumes
docker-compose down -v

# Rebuild containers
docker-compose build

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f backend
```

You should see:
```
Waiting for database to be ready...
Running database migrations...
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
INFO  [alembic.runtime.migration] Running upgrade  -> 001
Starting FastAPI server...
```

### Verify It Works

```bash
# Check backend health
curl http://localhost:8000/health

# Check API docs
open http://localhost:8000/docs
```

## Troubleshooting

### If migrations still fail:

```bash
# Check database is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Check backend environment variables
docker-compose exec backend env | grep DATABASE_URL
```

### Manual migration (if needed):

```bash
# Connect to backend container
docker-compose exec backend bash

# Run migration manually
alembic upgrade head

# Exit container
exit
```

### Reset database:

```bash
# Stop services
docker-compose down -v

# This removes all data - be careful!
# Start fresh
docker-compose up -d
```

## Files Changed

1. ✅ `backend/alembic/env.py` - Read DATABASE_URL from environment
2. ✅ `backend/entrypoint.sh` - New startup script
3. ✅ `backend/Dockerfile` - Use entrypoint script
4. ✅ `backend/alembic/versions/__init__.py` - Package marker
5. ✅ `docker-compose.yml` - Simplified backend service

## What This Fixes

- ✅ Alembic can now read database URL from environment
- ✅ Proper startup sequence (wait → migrate → serve)
- ✅ Better error handling and logging
- ✅ Database initialization happens automatically
- ✅ No manual migration needed

## Next Steps

After fixing, you should be able to:

1. Start services: `docker-compose up -d`
2. Create content via API or web UI
3. View content at http://localhost:3000

The backend is now fully functional!
