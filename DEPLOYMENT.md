# Production Deployment Guide

This guide will walk you through deploying the Dimension Portfolio application to a Hostinger VPS with a custom domain.

## Prerequisites

- A Hostinger VPS account (VPS 1 or VPS 2 recommended)
- A registered domain name
- SSH access to your VPS
- Basic knowledge of Linux command line

## Quick Start Checklist

- [ ] VPS server set up with Docker installed
- [ ] Domain DNS configured to point to VPS
- [ ] `.env` file created with production values
- [ ] SSL certificate obtained
- [ ] Application deployed and running
- [ ] Admin user created
- [ ] Backups configured

---

## Part 1: Prepare Your Local Environment

### Step 1: Generate Production Secrets

```bash
# Generate SECRET_KEY for JWT
python3 -c "import secrets; print(secrets.token_hex(32))"

# Generate strong database password
openssl rand -base64 32
```

Save these values - you'll need them in Step 3.

### Step 2: Create Production Environment File

```bash
cd /path/to/dimension
cp .env.production.example .env
```

Edit `.env` and fill in your values:

```env
DOMAIN=yourdomain.com
POSTGRES_DB=portfolio_prod
POSTGRES_USER=frontuser
POSTGRES_PASSWORD=<YOUR_GENERATED_PASSWORD>
DATABASE_URL=postgresql://frontuser:<YOUR_GENERATED_PASSWORD>@db:5432/portfolio_prod
SECRET_KEY=<YOUR_GENERATED_SECRET_KEY>
```

---

## Part 2: Set Up Hostinger VPS

### Step 1: Choose and Purchase VPS Plan

**Recommended Plans:**

- **VPS 1**: 2 CPU, 4GB RAM, 50GB SSD (~$5-6/month) - Minimum
- **VPS 2**: 4 CPU, 8GB RAM, 100GB SSD (~$8-12/month) - Recommended

### Step 2: Initial Server Setup

SSH into your VPS:

```bash
ssh root@YOUR_VPS_IP
```

Update the system:

```bash
apt update && apt upgrade -y
```

Create a non-root user (recommended):

```bash
adduser portfolio
usermod -aG sudo portfolio
su - portfolio
```

### Step 3: Install Docker and Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker compose -y

# Verify installations
docker --version
docker compose --version
```

### Step 4: Install Additional Tools

```bash
# Install Git
sudo apt install git -y

# Install certbot for SSL
sudo apt install certbot -y

# Install UFW firewall
sudo apt install ufw -y
```

---

## Part 3: Configure Domain and DNS

### Step 1: Point Domain to VPS

In your Hostinger control panel:

1. Go to **Domains** → Select your domain → **DNS Zone**
2. Add/Update these A records:

```
Type: A
Name: @
Points to: YOUR_VPS_IP
TTL: 14400

Type: A
Name: www
Points to: YOUR_VPS_IP
TTL: 14400
```

3. Wait 5-30 minutes for DNS propagation

### Step 2: Verify DNS

```bash
# Check DNS propagation
dig yourdomain.com
nslookup yourdomain.com
```

---

## Part 4: Deploy Application

### Step 1: Clone Repository

```bash
cd /home/portfolio
git clone https://github.com/YOUR_USERNAME/dimension.git
cd dimension
```

Or upload via SFTP if not using Git.

### Step 2: Configure Environment

```bash
# Copy your local .env file or create new one
nano .env
```

Paste your production environment variables from Part 1, Step 2.

### Step 3: Obtain SSL Certificate

```bash
# Stop any running services on port 80/443
sudo docker compose down

# Generate SSL certificate with certbot
sudo certbot certonly --standalone \
  -d yourdomain.com \
  -d www.yourdomain.com \
  --email your@email.com \
  --agree-tos

# Create SSL directory
mkdir -p nginx/ssl

# Copy certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/

# Set permissions
sudo chmod 644 nginx/ssl/fullchain.pem
sudo chmod 600 nginx/ssl/privkey.pem
sudo chown -R $USER:$USER nginx/ssl
```

### Step 4: Build and Start Services

```bash
# Build and start in detached mode
docker compose -f docker compose.prod.yml up --build -d

# Check status
docker compose -f docker compose.prod.yml ps

# View logs
docker compose -f docker compose.prod.yml logs -f
```

### Step 5: Create Admin User

```bash
# Create admin user
docker compose -f docker compose.prod.yml exec backend python3 scripts/create_admin.py \
  --email admin@yourdomain.com \
  --password YOUR_SECURE_PASSWORD \
  --name "Your Name"
```

### Step 6: Test Deployment

1. Visit `https://yourdomain.com` - Homepage should load
2. Visit `https://yourdomain.com/admin/login` - Admin login should work
3. Test admin login with your credentials
4. Upload a test blog post
5. Verify it appears on the site

---

## Part 5: Configure Firewall

```bash
# Set up UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (IMPORTANT: Do this first!)
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw --force enable

# Check status
sudo ufw status
```

---

## Part 6: Set Up Automated Backups

### Step 1: Create Backup Script

```bash
sudo nano /root/backup.sh
```

Paste this content:

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/portfolio"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
docker compose -f /home/portfolio/dimension/docker compose.prod.yml exec -T db \
  pg_dump -U frontuser portfolio_prod > $BACKUP_DIR/db_$DATE.sql

# Backup media files
tar -czf $BACKUP_DIR/media_$DATE.tar.gz /home/portfolio/dimension/backend/media

# Backup configuration
cp /home/portfolio/dimension/.env $BACKUP_DIR/env_$DATE

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

### Step 2: Make Script Executable

```bash
sudo chmod +x /root/backup.sh
```

### Step 3: Schedule Daily Backups

```bash
sudo crontab -e
```

Add this line to run daily at 2 AM:

```
0 2 * * * /root/backup.sh >> /var/log/portfolio-backup.log 2>&1
```

### Step 4: Test Backup

```bash
sudo /root/backup.sh
ls -lh /var/backups/portfolio/
```

---

## Part 7: Set Up SSL Auto-Renewal

```bash
# Edit crontab
sudo crontab -e
```

Add this line to renew certificates monthly:

```
0 0 1 * * certbot renew --quiet && cp /etc/letsencrypt/live/yourdomain.com/*.pem /home/portfolio/dimension/nginx/ssl/ && cd /home/portfolio/dimension && docker compose -f docker compose.prod.yml restart nginx
```

Test renewal (dry run):

```bash
sudo certbot renew --dry-run
```

---

## Part 8: Monitoring and Maintenance

### View Logs

```bash
cd /home/portfolio/dimension

# All services
docker compose -f docker compose.prod.yml logs -f

# Specific service
docker compose -f docker compose.prod.yml logs -f backend
docker compose -f docker compose.prod.yml logs -f frontend
docker compose -f docker compose.prod.yml logs -f nginx
```

### Check Service Status

```bash
docker compose -f docker compose.prod.yml ps
docker compose -f docker compose.prod.yml top
```

### Restart Services

```bash
# Restart all
docker compose -f docker compose.prod.yml restart

# Restart specific service
docker compose -f docker compose.prod.yml restart backend
```

### Update Application

```bash
cd /home/portfolio/dimension

# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose -f docker compose.prod.yml up --build -d

# Check for errors
docker compose -f docker compose.prod.yml logs -f
```

---

## Part 9: Performance Optimization

### Enable Docker Log Rotation

Edit `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Restart Docker:

```bash
sudo systemctl restart docker
```

### Monitor Resource Usage

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check Docker resource usage
docker stats

# Check system logs
journalctl -xe
```

---

## Part 10: Troubleshooting

### Application Won't Start

```bash
# Check logs
docker compose -f docker compose.prod.yml logs

# Check if ports are available
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Rebuild from scratch
docker compose -f docker compose.prod.yml down -v
docker compose -f docker compose.prod.yml up --build -d
```

### Database Issues

```bash
# Check database status
docker compose -f docker compose.prod.yml exec db pg_isready -U frontuser

# Access database
docker compose -f docker compose.prod.yml exec db psql -U frontuser portfolio_prod

# Run migrations manually
docker compose -f docker compose.prod.yml exec backend alembic upgrade head
```

### SSL Certificate Issues

```bash
# Check certificate expiry
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal

# Copy new certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/*.pem nginx/ssl/
docker compose -f docker compose.prod.yml restart nginx
```

### Frontend Build Fails

```bash
# Clear Next.js cache
docker compose -f docker compose.prod.yml exec frontend rm -rf .next

# Rebuild frontend only
docker compose -f docker compose.prod.yml up --build -d frontend
```

---

## Security Best Practices

✅ **Implemented:**

- HTTPS/TLS encryption
- Strong passwords and secret keys
- JWT authentication
- Rate limiting on API endpoints
- Security headers (HSTS, X-Frame-Options, etc.)
- Firewall configured
- Non-root user for deployment
- Password hashing with bcrypt
- CORS configuration

🔒 **Additional Recommendations:**

1. Regularly update system packages: `sudo apt update && sudo apt upgrade`
2. Monitor failed login attempts
3. Use SSH keys instead of passwords
4. Consider fail2ban for brute force protection
5. Regular security audits
6. Keep dependencies updated

---

## Quick Reference Commands

### Start Services

```bash
docker compose -f docker compose.prod.yml up -d
```

### Stop Services

```bash
docker compose -f docker compose.prod.yml down
```

### View Logs

```bash
docker compose -f docker compose.prod.yml logs -f
```

### Restart All

```bash
docker compose -f docker compose.prod.yml restart
```

### Check Status

```bash
docker compose -f docker compose.prod.yml ps
```

### Backup Now

```bash
sudo /root/backup.sh
```

### Update Application

```bash
git pull && docker compose -f docker compose.prod.yml up --build -d
```

---

## Cost Breakdown (Hostinger)

| Item              | Cost        | Notes          |
| ----------------- | ----------- | -------------- |
| VPS 2 Hosting     | $8-12/month | 4 CPU, 8GB RAM |
| Domain Name       | $10-15/year | .com domain    |
| SSL Certificate   | Free        | Let's Encrypt  |
| **Monthly Total** | **$8-12**   |                |
| **Yearly Total**  | **$96-144** | + domain fee   |

---

## Support and Help

### Useful Resources

- [Docker Documentation](https://docs.docker.com/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Let's Encrypt Certbot](https://certbot.eff.org/)

### Logs Locations

- Application logs: `docker compose logs`
- Nginx logs: Inside container `/var/log/nginx/`
- Backup logs: `/var/log/portfolio-backup.log`
- System logs: `/var/log/syslog`

### Health Checks

- Backend: `https://yourdomain.com/health`
- Frontend: `https://yourdomain.com`
- API Docs: `https://yourdomain.com/docs`

---

## Success Criteria

Before considering deployment complete, verify:

- [ ] Homepage loads without errors at `https://yourdomain.com`
- [ ] SSL certificate is valid (green lock icon)
- [ ] Admin login works at `/admin/login`
- [ ] Can upload and publish content
- [ ] Media files display correctly
- [ ] Dark/light theme works
- [ ] Mobile responsive
- [ ] All API endpoints respond correctly
- [ ] Backups running automatically
- [ ] Firewall active and configured
- [ ] Monitoring in place

---

## Emergency Contacts

- **Hostinger Support**: https://www.hostinger.com/support
- **Let's Encrypt Community**: https://community.letsencrypt.org/
- **Docker Community**: https://forums.docker.com/

---

**Deployment completed!** 🎉

Your portfolio is now live and accessible at `https://yourdomain.com`
