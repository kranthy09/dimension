# Fix Deployment Issues

## Issue 1: Database Connection Error ❌

**Error**: `could not translate host name "pogo123@db" to address`

**Cause**: DATABASE_URL is incorrectly formatted in `.env` file

**Fix**: On your VPS, edit the `.env` file:

```bash
nano .env
```

Make sure DATABASE_URL follows this EXACT format:
```env
DATABASE_URL=postgresql://frontuser:YOUR_PASSWORD@db:5432/portfolio_prod
```

**Important**:
- Replace `YOUR_PASSWORD` with your actual password
- If your password contains special characters like `@`, `#`, `/`, etc., you need to URL-encode them:
  - `@` becomes `%40`
  - `#` becomes `%23`
  - `/` becomes `%2F`
  - Example: `pass@word` → `pass%40word`

**Correct Examples**:
```env
# Password: mySecurePass123
DATABASE_URL=postgresql://frontuser:mySecurePass123@db:5432/portfolio_prod

# Password: my@pass#123
DATABASE_URL=postgresql://frontuser:my%40pass%23123@db:5432/portfolio_prod
```

## Issue 2: Database Not Initialized ❌

**Error**: `database "frontuser" does not exist`

**Cause**: Database migrations haven't been run yet

**Fix**: Run migrations:

```bash
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

## Issue 3: Nginx HTTP/2 Warning ⚠️

**Warning**: `the "listen ... http2" directive is deprecated`

**Fix**: Update nginx configuration:

```bash
nano nginx/nginx.conf
```

Find lines like:
```nginx
listen 443 ssl http2;
```

Change to:
```nginx
listen 443 ssl;
http2 on;
```

## Complete Fix Procedure

Run these commands on your VPS:

```bash
# 1. Fix .env file
nano .env
# Edit DATABASE_URL to correct format (see above)

# 2. Restart services
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d

# 3. Wait for database to be ready (10 seconds)
sleep 10

# 4. Run migrations
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head

# 5. Create admin user
docker compose -f docker-compose.prod.yml exec backend python3 scripts/create_admin.py \
  --email admin@evolune.dev \
  --password YOUR_ADMIN_PASSWORD \
  --name "Admin"

# 6. Check service status
docker compose -f docker-compose.prod.yml ps

# 7. Test the site
curl -I https://evolune.dev
```

## Verify Everything Works

1. **Check backend health**: `curl https://evolune.dev/health`
2. **Visit homepage**: Open https://evolune.dev in browser
3. **Test admin login**: Go to https://evolune.dev/admin/login
4. **Check logs**: `docker compose -f docker-compose.prod.yml logs -f`

## Common Issues

### If backend keeps restarting:
```bash
# Check backend logs
docker compose -f docker-compose.prod.yml logs backend

# Verify database is running
docker compose -f docker-compose.prod.yml ps db
```

### If "502 Bad Gateway":
- Backend isn't running or crashed
- Check backend logs
- Verify DATABASE_URL is correct

### If admin login fails:
- User not created yet
- Run create_admin.py script again
- Check backend logs for errors
