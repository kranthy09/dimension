# Quick Reference

## Local Development

```bash
docker compose up -d          # Start
docker compose down           # Stop
docker compose logs -f        # View logs
docker compose exec backend bash  # Access container
```

## VPS Deployment

```bash
./deploy-vps.sh              # Deploy
./deploy-vps.sh --force-rebuild  # Force rebuild
```

## Common Tasks

**Create Admin:**

```bash
docker compose exec backend python3 scripts/create_admin.py \
  --email admin@local.dev --password admin123 --name "Admin"
```

**Database Backup:**

```bash
docker compose exec db pg_dump -U portfolio portfolio > backup.sql
```

**Restart Service:**

```bash
docker compose restart frontend
```
**Connect to db service**
```bash
docker compose exec db psql -U frontuser -d portfolio_prod
```

## URLs

- **Local Frontend:** http://localhost:3000
- **Local Backend:** http://localhost:8000/docs
- **Admin:** http://localhost:3000/admin/login
