# Frequently Asked Questions (FAQ)

## Database & Data Storage

### Q: Is PostgreSQL handled locally?
**A: Yes, 100% local on your VPS!**

- PostgreSQL runs in a Docker container on **your server**
- All data stored in Docker volumes on **your VPS disk**
- No external database services (like AWS RDS, Supabase, etc.)
- No third-party dependencies
- Complete data ownership and privacy

**Location:** `/var/lib/docker/volumes/dimension_postgres_data/`

**Benefits:**
- ✅ Your data never leaves your server
- ✅ No additional costs
- ✅ Better performance (local network)
- ✅ Full control and privacy
- ✅ Works offline (no internet dependency for DB)

### Q: Do I depend on third-party authentication?
**A: No, authentication is also 100% local!**

- JWT tokens generated on **your server**
- Passwords hashed with bcrypt and stored in **your PostgreSQL**
- No OAuth, Auth0, Firebase, or any external auth service
- Admin users managed entirely by you

**You control:**
- ✅ User creation
- ✅ Password policies
- ✅ JWT token expiration
- ✅ All authentication logic

---

## SSL Certificates

### Q: Hostinger provides SSL, do I need to generate certificates?
**A: Yes, you need to generate your own SSL certificates for VPS.**

**Why?**
- Hostinger's built-in SSL is **only for shared hosting**, not VPS
- On VPS, you manage your own web server (nginx)
- You're responsible for SSL certificate setup

**Solution: Use Let's Encrypt (Free & Easy)**

```bash
# One-time setup (takes 2 minutes)
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy certificates
mkdir -p nginx/ssl
cp /etc/letsencrypt/live/yourdomain.com/*.pem nginx/ssl/

# Set up auto-renewal (once, forget forever)
crontab -e
# Add: 0 0 1 * * certbot renew --quiet
```

**Benefits of Let's Encrypt:**
- ✅ Completely free forever
- ✅ Trusted by all browsers
- ✅ Auto-renewal supported
- ✅ Takes 2 minutes to set up
- ✅ Industry standard (used by millions)

**Cost:** $0

**Alternative:** Cloudflare SSL (also free, but requires proxy)

---

## File Cleanup & Space Management

### Q: Which files can I remove to save space?

**Safe to Remove (After Deployment):**

1. **Development Files:**
   ```bash
   rm docker-compose.yml           # If using prod version only
   rm frontend/.env.local          # After copying to .env
   rm backend/.env                 # After copying to .env
   ```

2. **Cache Files:**
   ```bash
   rm -rf frontend/node_modules    # Rebuilt in Docker
   rm -rf frontend/.next           # Rebuilt on deploy
   find backend -type d -name "__pycache__" -exec rm -rf {} +
   ```

3. **Example/Template Files:**
   ```bash
   rm .env.production.example      # After creating .env
   rm QUICKSTART.md                # After reading
   rm PRODUCTION_READY.md          # After deployment
   ```

**Space Saved:** ~250-350MB

**Files You MUST Keep:**
- ✅ `.env` (your production config)
- ✅ `docker-compose.prod.yml`
- ✅ All source code (backend/app, frontend/src)
- ✅ `nginx/nginx.conf`
- ✅ `nginx/ssl/` (certificates)
- ✅ Database migrations (backend/alembic)
- ✅ `DEPLOYMENT.md` (for reference)

**See `CLEANUP_GUIDE.md` for detailed cleanup instructions.**

---

## Disk Space

### Q: How much space does everything use?

**On your VPS:**
- Operating System: ~10GB
- Docker + Images: ~2GB
- Your application code: ~150-200MB
- Database (grows): Starts at ~50MB
- **Available (VPS 2 - 100GB):** ~85GB free

**Your project files:**
- With cache/modules: ~500MB
- After cleanup: ~150-200MB

**Realistic usage over 1 year:**
- 100 blog posts: ~10MB
- 200 images: ~100-200MB
- Database: ~500MB
- Logs: ~100MB (with rotation)
- **Total:** ~1GB of your data

**You have 85+ GB free - plenty of space!**

---

## Costs

### Q: What are the total costs?

**Hostinger VPS Hosting:**
| Plan | CPU | RAM | Storage | Cost |
|------|-----|-----|---------|------|
| VPS 1 | 2 | 4GB | 50GB | $5-6/mo |
| VPS 2 | 4 | 8GB | 100GB | $8-12/mo |

**Recommended:** VPS 2 for better performance

**Additional Costs:**
- Domain (.com): $10-15/year
- SSL Certificate: $0 (Let's Encrypt)
- Database: $0 (local PostgreSQL)
- Backups: $0 (local backups)

**Total Annual Cost:**
- Monthly: $8-12
- Yearly: $96-144 + domain ($10-15)
- **Total: ~$106-159/year**

**Compare to alternatives:**
- Vercel + Database: $20-50/month ($240-600/year)
- Netlify + Database: $19-45/month ($228-540/year)
- AWS/DigitalOcean: $15-30/month ($180-360/year)

**Hostinger VPS = Best value!**

---

## Performance

### Q: Will it be fast enough?

**Expected Performance (VPS 2):**
- Homepage load: <1 second
- API response: <100ms
- Admin dashboard: <500ms
- Concurrent users: 50-100 users
- Database queries: <50ms

**Optimizations included:**
- ✅ Nginx caching
- ✅ Gzip compression
- ✅ Static file caching (30 days)
- ✅ 4 backend workers
- ✅ Database connection pooling

**For 99% of portfolios, this is more than enough!**

---

## Security

### Q: Is it secure for production?

**Yes! Security features included:**

✅ **HTTPS/TLS encryption** (with Let's Encrypt)
✅ **Rate limiting** (10 req/s API, 5 req/min auth)
✅ **Security headers** (HSTS, X-Frame-Options, CSP)
✅ **CORS configured** (only your domain)
✅ **JWT authentication** with bcrypt password hashing
✅ **SQL injection protection** (Pydantic validation)
✅ **XSS protection** (React sanitization)
✅ **Firewall configured** (UFW)
✅ **Non-root containers**

**Additional recommendations:**
- Use strong passwords (admin and database)
- Generate strong SECRET_KEY (32+ chars)
- Keep system updated: `apt update && apt upgrade`
- Monitor logs regularly
- Set up backups (script provided)

---

## Backups

### Q: How do I backup my data?

**Automatic backups included!**

1. **Set up backup script** (in DEPLOYMENT.md):
   ```bash
   sudo nano /root/backup.sh
   # Paste backup script
   sudo chmod +x /root/backup.sh
   ```

2. **Schedule daily backups**:
   ```bash
   sudo crontab -e
   # Add: 0 2 * * * /root/backup.sh
   ```

**What gets backed up:**
- Database (full SQL dump)
- Media files (images, uploads)
- Configuration (.env file)

**Backup location:** `/var/backups/portfolio/`

**Retention:** Last 7 days automatically

**Manual backup:**
```bash
sudo /root/backup.sh
```

---

## Updates

### Q: How do I update the application?

**Easy update process:**

```bash
# 1. SSH into VPS
ssh root@your-vps-ip

# 2. Go to project directory
cd /home/portfolio/dimension

# 3. Pull latest changes
git pull origin main

# 4. Rebuild and restart
docker-compose -f docker-compose.prod.yml up --build -d

# 5. Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

**Takes:** 5-10 minutes

---

## Monitoring

### Q: How do I monitor the application?

**Built-in monitoring:**

1. **Health check endpoint:**
   ```bash
   curl https://yourdomain.com/health
   ```

2. **View logs:**
   ```bash
   docker-compose -f docker-compose.prod.yml logs -f
   ```

3. **Check resource usage:**
   ```bash
   docker stats
   htop
   df -h  # Disk space
   ```

4. **Service status:**
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   ```

**Optional external monitoring:**
- [UptimeRobot](https://uptimerobot.com/) (free tier)
- [Sentry](https://sentry.io/) for error tracking
- [Google Analytics](https://analytics.google.com/) for traffic

---

## Scaling

### Q: What if I need more performance?

**Vertical Scaling (Easier):**
1. Upgrade to VPS 3 or VPS 4 in Hostinger
2. More CPU/RAM = better performance
3. No code changes needed

**Horizontal Scaling (Advanced):**
1. Add more backend workers (in entrypoint.sh)
2. Use Redis for caching
3. Add CDN (Cloudflare)
4. Use managed database (if needed)

**For most portfolios, VPS 2 is sufficient for years!**

---

## Domain Setup

### Q: How do I point my domain to VPS?

**In Hostinger control panel:**

1. Go to **Domains** → Your Domain → **DNS Zone**
2. Add these A records:

```
Type: A
Name: @
Value: YOUR_VPS_IP
TTL: 14400

Type: A
Name: www
Value: YOUR_VPS_IP
TTL: 14400
```

3. Wait 5-30 minutes for DNS propagation

**Verify:**
```bash
dig yourdomain.com
nslookup yourdomain.com
```

---

## Troubleshooting

### Q: Application won't start?

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check if ports are free
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Rebuild from scratch
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up --build -d
```

### Q: SSL certificate not working?

```bash
# Check certificate
sudo certbot certificates

# Renew if needed
sudo certbot renew --force-renewal

# Copy to nginx
sudo cp /etc/letsencrypt/live/yourdomain.com/*.pem nginx/ssl/

# Restart nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

### Q: Database connection failed?

```bash
# Check database is running
docker-compose -f docker-compose.prod.yml ps

# Check database health
docker-compose -f docker-compose.prod.yml exec db pg_isready -U portfolio_user

# Verify .env credentials
cat .env | grep POSTGRES

# Access database console
docker-compose -f docker-compose.prod.yml exec db psql -U portfolio_user portfolio_prod
```

---

## Quick Reference

**Essential Commands:**

```bash
# Start
docker-compose -f docker-compose.prod.yml up -d

# Stop
docker-compose -f docker-compose.prod.yml down

# Logs
docker-compose -f docker-compose.prod.yml logs -f

# Status
docker-compose -f docker-compose.prod.yml ps

# Restart
docker-compose -f docker-compose.prod.yml restart

# Update
git pull && docker-compose -f docker-compose.prod.yml up --build -d
```

**Files to keep safe:**
- `.env` (backup this!)
- Database backups
- SSL certificates

---

## Summary

✅ **Database:** Fully local on your VPS
✅ **Authentication:** No third-party dependencies
✅ **SSL:** Generate with Let's Encrypt (free)
✅ **Space:** Plenty available, cleanup optional
✅ **Cost:** $8-12/month + $10-15/year domain
✅ **Security:** Production-grade included
✅ **Performance:** Fast enough for 99% of portfolios

**You're ready to deploy!** 🚀
