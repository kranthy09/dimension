# Project Status

**Status:** ✅ Production Ready  
**Domain:** evolune.dev

## Services
- PostgreSQL 15
- FastAPI Backend
- Next.js Frontend (Client-side rendering)
- Nginx (SSL, reverse proxy)

## Quick Start

**Local:**
```bash
docker compose up -d
docker compose exec backend python3 scripts/create_admin.py \
  --email admin@local.dev --password admin123 --name "Admin"
```

**VPS:**
```bash
ssh your-user@your-vps-ip
cd /path/to/dimension
./deploy-vps.sh
```

## Key Features
- Markdown content management
- JWT authentication
- Client-side rendering
- Responsive design
- Admin panel

## Next Steps
1. Create admin user
2. Upload first content
3. Customize homepage
