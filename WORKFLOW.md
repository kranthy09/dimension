# Development to Deployment Workflow

This document outlines the complete pipeline from feature development to production deployment.

---

## Development Pipeline

```
Local Development → Git Commit → Git Push → VPS Deployment → Live Site
```

---

## 1. Local Development

### Initial Setup
```bash
# Clone repository
git clone <your-repo-url>
cd dimension

# Setup environment
cp .env.local.example .env

# Start development environment
docker compose up -d

# Create admin user (first time only)
docker compose exec backend python3 scripts/create_admin.py \
  --email admin@local.dev \
  --password admin123 \
  --name "Admin"
```

### Daily Development
```bash
# Start containers
docker compose up -d

# View logs
docker compose logs -f

# Stop containers
docker compose down
```

### Testing Changes
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/docs
- Admin Panel: http://localhost:3000/admin/login

---

## 2. Git Workflow

### Feature Development
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes, then commit
git add .
git commit -m "Description of changes"

# Push to remote
git push origin feature/your-feature-name
```

### Merging to Main
```bash
# Switch to main
git checkout main

# Merge feature
git merge feature/your-feature-name

# Push to remote
git push origin main
```

### Quick Fixes (Direct to Main)
```bash
# Make changes
git add .
git commit -m "Fix: description"
git push origin main
```

---

## 3. VPS Deployment

### Prerequisites
- VPS with Docker and Docker Compose installed
- `.env` file configured on VPS (see `.env.production.example`)
- SSH access to VPS

### Deployment Process

**Option 1: Automated Script (Recommended)**
```bash
# SSH into VPS
ssh your-user@your-vps-ip

# Navigate to project
cd /path/to/dimension

# Run deployment script
./deploy-vps.sh

# For complete rebuild (if needed)
./deploy-vps.sh --force-rebuild
```

**Option 2: Manual Deployment**
```bash
# SSH into VPS
ssh your-user@your-vps-ip
cd /path/to/dimension

# Pull latest code
git pull origin main

# Rebuild and restart
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Check status
docker compose -f docker-compose.prod.yml ps
```

### First-Time VPS Setup
```bash
# After initial deployment, create admin user
docker compose -f docker-compose.prod.yml exec backend python3 scripts/create_admin.py \
  --email admin@yourdomain.com \
  --password SecurePassword123 \
  --name "Admin Name"
```

---

## 4. Common Operations

### View Logs
```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f db
docker compose -f docker-compose.prod.yml logs -f nginx
```

### Restart Services
```bash
# Restart specific service
docker compose -f docker-compose.prod.yml restart frontend

# Restart all services
docker compose -f docker-compose.prod.yml restart
```

### Database Backup
```bash
# Create backup
docker compose -f docker-compose.prod.yml exec db pg_dump \
  -U ${POSTGRES_USER} ${POSTGRES_DB} > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker compose -f docker-compose.prod.yml exec -T db psql \
  -U ${POSTGRES_USER} ${POSTGRES_DB} < backup_file.sql
```

### Clean Up Docker
```bash
# Remove stopped containers
docker compose -f docker-compose.prod.yml down

# Remove with volumes (⚠️ deletes database)
docker compose -f docker-compose.prod.yml down -v

# Clean up unused images
docker system prune -a
```

---

## 5. Complete Workflow Example

### Scenario: Add a new blog post feature

**Local Development:**
```bash
# 1. Create feature branch
git checkout -b feature/blog-tags

# 2. Make code changes
# ... edit files ...

# 3. Test locally
docker compose restart frontend
# Visit http://localhost:3000 to verify

# 4. Commit changes
git add .
git commit -m "Add: blog post tag filtering feature"

# 5. Push to remote
git push origin feature/blog-tags
```

**Merge to Main:**
```bash
git checkout main
git merge feature/blog-tags
git push origin main
```

**Deploy to VPS:**
```bash
# SSH to VPS
ssh your-user@your-vps-ip
cd /path/to/dimension

# Deploy
./deploy-vps.sh

# Verify at https://yourdomain.com
```

---

## 6. Troubleshooting

### Frontend not updating
```bash
# Force rebuild frontend
docker compose -f docker-compose.prod.yml build --no-cache frontend
docker compose -f docker-compose.prod.yml up -d frontend
```

### Database connection issues
```bash
# Check database logs
docker compose -f docker-compose.prod.yml logs db

# Verify environment variables
docker compose -f docker-compose.prod.yml exec backend env | grep POSTGRES
```

### SSL certificate issues
```bash
# Check nginx logs
docker compose -f docker-compose.prod.yml logs nginx

# Verify SSL files exist
ls -la nginx/ssl/
```

---

## 7. Best Practices

### Git Commits
- Use descriptive commit messages
- Format: `Type: Brief description`
- Types: `Add`, `Fix`, `Update`, `Remove`, `Refactor`

### Deployment
- Always test locally before deploying
- Check logs after deployment
- Keep backups of database before major changes

### Security
- Never commit `.env` files
- Use strong passwords for production
- Regularly update dependencies

---

## Quick Reference

| Task | Command |
|------|---------|
| Start local dev | `docker compose up -d` |
| Deploy to VPS | `./deploy-vps.sh` |
| View logs | `docker compose logs -f [service]` |
| Restart service | `docker compose restart [service]` |
| Create admin | `docker compose exec backend python3 scripts/create_admin.py ...` |
| Database backup | `docker compose exec db pg_dump ...` |

---

For more details, see:
- Local development: `README.md`
- Environment setup: `.env.production.example`
- Docker logs: `DOCKER_LOGS_COMMANDS.md`
