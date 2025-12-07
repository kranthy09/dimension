# Quick Start Guide - Production Deployment

Get your portfolio deployed to Hostinger in under 30 minutes.

## Prerequisites

- Hostinger VPS (VPS 2 recommended: $8-12/month)
- Domain name
- Basic terminal knowledge

---

## 5-Step Deployment

### Step 1: Generate Secrets (2 minutes)

```bash
# Generate SECRET_KEY
python3 -c "import secrets; print(secrets.token_hex(32))"
# Copy this value

# Generate database password
openssl rand -base64 32
# Copy this value
```

### Step 2: Create Environment File (2 minutes)

```bash
cp .env.production.example .env
nano .env
```

Fill in these values:
```env
DOMAIN=yourdomain.com
POSTGRES_PASSWORD=<paste_generated_password>
SECRET_KEY=<paste_generated_key>
```

Save and exit (Ctrl+X, Y, Enter).

### Step 3: Set Up VPS (10 minutes)

```bash
# SSH into VPS
ssh root@YOUR_VPS_IP

# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose and certbot
apt install docker compose certbot -y

# Clone your repository
git clone https://github.com/YOUR_USER/dimension.git
cd dimension
```

### Step 4: Configure DNS (5 minutes)

In Hostinger control panel:
1. Go to Domains → Your Domain → DNS Zone
2. Add A record: `@` → `YOUR_VPS_IP`
3. Add A record: `www` → `YOUR_VPS_IP`
4. Wait 5-10 minutes for propagation

### Step 5: Deploy (10 minutes)

```bash
# Generate SSL certificate
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
mkdir -p nginx/ssl
cp /etc/letsencrypt/live/yourdomain.com/*.pem nginx/ssl/

# Upload your .env file or create it on server
nano .env
# Paste your values from Step 2

# Deploy
chmod +x deploy.sh
./deploy.sh

# Create admin user
docker compose -f docker compose.prod.yml exec backend \
  python3 scripts/create_admin.py \
  --email admin@yourdomain.com \
  --password your_password \
  --name "Your Name"
```

---

## Done! 🎉

Visit: `https://yourdomain.com`

Admin: `https://yourdomain.com/admin/login`

---

## Common Issues

**SSL certificate fails:**
```bash
# Make sure port 80 is free
docker compose down
# Then retry certbot command
```

**Services won't start:**
```bash
# Check logs
docker compose -f docker compose.prod.yml logs

# Verify .env file exists and has correct values
cat .env
```

**Can't connect to database:**
```bash
# Check database is running
docker compose -f docker compose.prod.yml ps

# Verify credentials in .env match
```

---

## Useful Commands

```bash
# View logs
docker compose -f docker compose.prod.yml logs -f

# Restart services
docker compose -f docker compose.prod.yml restart

# Stop all
docker compose -f docker compose.prod.yml down

# Update application
git pull && docker compose -f docker compose.prod.yml up --build -d
```

---

## Need More Help?

See `DEPLOYMENT.md` for detailed instructions.
