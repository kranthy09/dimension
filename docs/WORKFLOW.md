# Development Workflow

Pipeline: Local Dev → Git → VPS → Live Site

## Local Development

**Start:**
```bash
docker compose up -d
docker compose exec backend python3 scripts/create_admin.py \
  --email admin@local.dev --password admin123 --name "Admin"
```

**URLs:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8000/docs
- Admin: http://localhost:3000/admin/login

## Git Workflow

**Feature branch:**
```bash
git checkout -b feature/name
# make changes
git add .
git commit -m "Description"
git push origin feature/name
git checkout main
git merge feature/name
git push origin main
```

**Quick fix:**
```bash
git add .
git commit -m "Fix: description"
git push origin main
```

## VPS Deployment

```bash
ssh user@vps-ip
cd /path/to/dimension
./deploy-vps.sh
```

**First-time setup:**
```bash
docker compose -f docker-compose.prod.yml exec backend python3 scripts/create_admin.py \
  --email admin@domain.com --password SecurePass --name "Admin"
```

## Common Commands

**View logs:**
```bash
docker compose logs -f [service]
```

**Restart:**
```bash
docker compose restart [service]
```

**Database backup:**
```bash
docker compose exec db pg_dump -U portfolio portfolio > backup.sql
```

## Troubleshooting

**Frontend not updating:**
```bash
docker compose build --no-cache frontend
docker compose up -d
```

**Database issues:**
```bash
docker compose logs db
docker compose restart db
```
