# Quick Reference

Essential commands for daily operations.

---

## Local Development

```bash
# Start
docker compose up -d

# Stop
docker compose down

# Restart service
docker compose restart frontend

# View logs
docker compose logs -f [service]

# Access container
docker compose exec backend bash
```

---

## VPS Deployment

```bash
# Deploy latest changes
./deploy-vps.sh

# Force complete rebuild
./deploy-vps.sh --force-rebuild

# Manual deployment
git pull origin main
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

---

## Common Tasks

### Create Admin User
```bash
# Local
docker compose exec backend python3 scripts/create_admin.py \
  --email admin@local.dev --password admin123 --name "Admin"

# Production
docker compose -f docker-compose.prod.yml exec backend python3 scripts/create_admin.py \
  --email admin@yourdomain.com --password SecurePass123 --name "Admin"
```

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f frontend
docker compose logs -f backend
docker compose logs -f db
docker compose logs -f nginx
```

### Database Backup
```bash
# Create backup
docker compose exec db pg_dump -U ${POSTGRES_USER} ${POSTGRES_DB} > backup.sql

# Restore backup
docker compose exec -T db psql -U ${POSTGRES_USER} ${POSTGRES_DB} < backup.sql
```

### Restart Services
```bash
# Single service
docker compose restart frontend

# All services
docker compose restart
```

---

## Git Workflow

```bash
# Quick commit and push
git add .
git commit -m "Your message"
git push origin main

# Feature branch
git checkout -b feature/name
# ... make changes ...
git add .
git commit -m "Description"
git push origin feature/name
git checkout main
git merge feature/name
git push origin main
```

---

## Troubleshooting

### Frontend not updating
```bash
docker compose build --no-cache frontend
docker compose up -d frontend
```

### Database issues
```bash
docker compose logs db
docker compose restart db
```

### Check container status
```bash
docker compose ps
docker compose top
```

---

## URLs

- **Local Frontend:** http://localhost:3000
- **Local Backend API:** http://localhost:8000/docs
- **Local Admin:** http://localhost:3000/admin/login
- **Production:** https://yourdomain.com

---

For detailed workflow, see [WORKFLOW.md](WORKFLOW.md)
