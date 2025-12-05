# Cleanup Guide - Remove Unnecessary Files

This guide helps you remove files that aren't needed for production deployment to save space.

## Safe to Delete (Development Only)

### 1. Development Docker Compose (if using production)
```bash
# If you're deploying to production and won't run locally anymore
rm docker-compose.yml  # Keep only docker-compose.prod.yml
```

**Space saved:** ~1KB

### 2. Development Environment Files
```bash
# Remove local development env files (after copying to .env)
rm frontend/.env.local
rm backend/.env
```

⚠️ **Important:** Only delete after you've created your production `.env` file!

**Space saved:** <1KB

### 3. Git History (Optional - Be Careful!)
```bash
# If you want to start fresh without git history
rm -rf .git
# Then re-initialize: git init
```

**Space saved:** Variable (could be 10MB-100MB+ depending on history)

⚠️ **Warning:** You'll lose all commit history. Only do this if you're sure!

### 4. Node Modules (After Production Build)
```bash
# These are copied into Docker image, not needed in repo
rm -rf frontend/node_modules
```

**Space saved:** ~200-300MB

⚠️ **Note:** You'll need to run `npm install` again if developing locally.

### 5. Python Cache Files
```bash
# Remove Python cache
find backend -type d -name "__pycache__" -exec rm -rf {} +
find backend -type f -name "*.pyc" -delete
rm -rf backend/.pytest_cache
```

**Space saved:** 5-10MB

### 6. Next.js Build Cache (If Exists)
```bash
rm -rf frontend/.next
rm -rf frontend/out
```

**Space saved:** 50-100MB

⚠️ **Note:** Will be rebuilt when you deploy.

### 7. Documentation You Don't Need

**If you've already deployed successfully:**
```bash
# Remove example/template files (keep one copy of docs you need)
rm .env.production.example  # After you've created your .env
rm QUICKSTART.md            # If you don't need quick reference
```

**Space saved:** ~50KB

**Keep these essential docs:**
- ✅ `DEPLOYMENT.md` (for future reference)
- ✅ `PRODUCTION_READY.md` (for checklist)
- ✅ `.env` (your actual config - NEVER DELETE)

---

## Files You MUST Keep

### Essential for Production
```bash
# Never delete these:
.env                          # Your production configuration
docker-compose.prod.yml       # Production deployment config
deploy.sh                     # Deployment script
frontend/Dockerfile.prod      # Production frontend build
backend/Dockerfile            # Backend container
nginx/nginx.conf              # Web server config
nginx/ssl/                    # SSL certificates
```

### Application Code (Never Delete)
```bash
backend/
├── app/                      # Backend application
├── alembic/                  # Database migrations
├── scripts/                  # Admin scripts
├── requirements.txt          # Python dependencies
└── entrypoint.sh            # Startup script

frontend/
├── src/                      # Frontend application
├── public/                   # Static assets
├── package.json             # Node dependencies
└── next.config.js           # Next.js config
```

---

## Recommended Cleanup for Production VPS

If you're deploying to production and won't develop locally:

```bash
# 1. Remove development files
rm docker-compose.yml
rm frontend/.env.local
rm backend/.env

# 2. Remove Python cache
find backend -type d -name "__pycache__" -exec rm -rf {} +
find backend -type f -name "*.pyc" -delete

# 3. Remove Node modules (will be in Docker image)
rm -rf frontend/node_modules

# 4. Remove Next.js cache
rm -rf frontend/.next

# 5. Remove example files (after creating .env)
rm .env.production.example

# 6. Remove extra documentation (optional)
rm QUICKSTART.md
rm PRODUCTION_READY.md
# Keep DEPLOYMENT.md for reference

# Total space saved: ~250-350MB
```

---

## Disk Space After Cleanup

**Before cleanup:**
- Project files: ~400-500MB
- Docker images: ~1-2GB (when built)
- **Total:** ~1.5-2.5GB

**After cleanup:**
- Project files: ~150-200MB
- Docker images: ~1-2GB (unchanged)
- **Total:** ~1.2-2.2GB

**Docker images (can't really reduce):**
- PostgreSQL image: ~200MB
- Backend image: ~400-600MB
- Frontend image: ~200-300MB
- Nginx image: ~50MB

---

## Additional Space Saving Tips

### 1. Clean Docker System (Careful!)
```bash
# Remove unused Docker images/containers
docker system prune -a --volumes

# This removes:
# - Stopped containers
# - Unused networks
# - Dangling images
# - Build cache
```

⚠️ **Warning:** This will remove ALL unused Docker data. Make sure no other projects need them!

### 2. Rotate Logs
```bash
# Set up log rotation (included in DEPLOYMENT.md)
# Prevents logs from growing indefinitely
```

### 3. Media File Management
```bash
# Periodically clean old/unused media files
# But keep what you need!
```

---

## What Takes Up Space on VPS?

**Breakdown of space usage:**

| Item | Size | Can Remove? |
|------|------|-------------|
| Operating System | 5-10GB | ❌ No |
| Docker Engine | 1-2GB | ❌ No |
| Project Files | 150-200MB | ⚠️ Partial |
| Docker Images | 1-2GB | ⚠️ Need for running |
| Database Data | Grows over time | ❌ No (your data!) |
| Media Uploads | Grows over time | ⚠️ Only old files |
| Logs | Grows if not rotated | ✅ Yes (with rotation) |

**VPS 2 (100GB SSD) breakdown:**
- System + Docker: ~15GB
- Application: ~2GB
- Available for data: ~83GB

**This is plenty of space for:**
- Thousands of blog posts
- Hundreds of images
- Years of logs

---

## Files That Are Actually Large

**In your project:**
1. `frontend/node_modules/` - ~250MB (can delete, rebuilt in Docker)
2. `frontend/.next/` - ~100MB (can delete, rebuilt on deploy)
3. Git history - ~10-50MB (optional to remove)
4. Python cache - ~5-10MB (safe to delete)

**Everything else is small (< 1MB each):**
- All your source code: ~20MB
- Configuration files: <1MB
- Documentation: <1MB

---

## Minimal Production Setup

**Absolute minimum files needed to run:**

```
dimension/
├── .env                          # Config
├── docker-compose.prod.yml       # Deployment
├── deploy.sh                     # Helper script
├── backend/
│   ├── app/                      # Code
│   ├── alembic/                  # Migrations
│   ├── scripts/                  # Admin tools
│   ├── Dockerfile
│   ├── entrypoint.sh
│   └── requirements.txt
├── frontend/
│   ├── src/                      # Code
│   ├── public/                   # Static files
│   ├── Dockerfile.prod
│   ├── package.json
│   └── next.config.js
└── nginx/
    ├── nginx.conf
    └── ssl/                      # Certificates
```

**Total size:** ~150MB (without node_modules and caches)

---

## Recommendation

**For VPS deployment:**

```bash
# Run this cleanup script
cd /path/to/dimension

# Clean development files
rm -rf frontend/node_modules frontend/.next
find backend -type d -name "__pycache__" -exec rm -rf {} +

# Keep one documentation file
# Keep: DEPLOYMENT.md
# Remove others after reading if you want

# Upload to VPS with:
# - All source code
# - .env file (create on server)
# - docker-compose.prod.yml
# - All Dockerfiles and configs
```

**Space saved:** ~250-300MB (significant!)

---

## Important Notes

1. **Never delete:**
   - `.env` (your config)
   - Docker files (Dockerfile, docker-compose.prod.yml)
   - Application source code (backend/app, frontend/src)
   - Database migrations (backend/alembic)

2. **Safe to delete:**
   - Cache files (`__pycache__`, `.next`)
   - `node_modules` (if not developing locally)
   - Development env files (after copying values)
   - Extra documentation (after reading)

3. **Consider keeping:**
   - Git history (for version control)
   - One copy of deployment docs
   - Backup of .env elsewhere

---

## Summary

**Cleanup saves you:**
- ~250-350MB of disk space
- Faster git operations
- Cleaner project structure

**But realistically:**
- VPS has 50-100GB space
- Your project uses ~2GB total
- **You have plenty of space!**

**Don't stress about space unless:**
- You're uploading 100+ GB of images
- You have thousands of blog posts
- You're running out of disk on VPS

---

## Questions?

**Need more space on VPS?**
- Upgrade to larger VPS plan
- Use object storage (S3, Cloudflare R2) for media
- Set up log rotation
- Clean old Docker images

**Confused about what to delete?**
- When in doubt, don't delete!
- Everything here is already small
- Focus on functionality, not space optimization
