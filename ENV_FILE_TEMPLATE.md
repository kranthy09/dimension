# .env File Configuration - EXACT FORMAT REQUIRED

## ⚠️ CRITICAL: Your .env file MUST look EXACTLY like this:

```env
# Domain
DOMAIN=evolune.dev

# Database Configuration
POSTGRES_DB=portfolio_prod
POSTGRES_USER=frontuser
POSTGRES_PASSWORD=your_actual_password_here

# Backend Configuration
DATABASE_URL=postgresql://frontuser:your_actual_password_here@db:5432/portfolio_prod
SECRET_KEY=your_secret_key_here

# Frontend Configuration (optional for production)
NEXT_PUBLIC_API_URL=https://evolune.dev
```

## 🔴 Common Mistakes to Avoid

### ❌ WRONG - Username mismatch:
```env
POSTGRES_USER=frontuser
DATABASE_URL=postgresql://portfolio:password@db:5432/portfolio_prod
                          ^^^^^^^^^ WRONG! Must be frontuser
```

### ❌ WRONG - Special characters not encoded:
```env
# If your password is: my@pass#123
DATABASE_URL=postgresql://frontuser:my@pass#123@db:5432/portfolio_prod
                                            ^^^ @ causes issues!
```

### ✅ CORRECT - Special characters encoded:
```env
# Password: my@pass#123
DATABASE_URL=postgresql://frontuser:my%40pass%23123@db:5432/portfolio_prod
                                            ^^^^^ @ becomes %40
                                                  ^^^^^ # becomes %23
```

## 📋 URL Encoding Reference

If your password contains special characters, encode them:

| Character | Encoded | Example Password | Encoded in URL |
|-----------|---------|------------------|----------------|
| `@` | `%40` | `pass@word` | `pass%40word` |
| `#` | `%23` | `pass#word` | `pass%23word` |
| `$` | `%24` | `pass$word` | `pass%24word` |
| `%` | `%25` | `pass%word` | `pass%25word` |
| `/` | `%2F` | `pass/word` | `pass%2Fword` |
| `?` | `%3F` | `pass?word` | `pass%3Fword` |
| `&` | `%26` | `pass&word` | `pass%26word` |
| `=` | `%3D` | `pass=word` | `pass%3Dword` |
| `+` | `%2B` | `pass+word` | `pass%2Bword` |
| ` ` (space) | `%20` | `pass word` | `pass%20word` |

## 🔧 Step-by-Step Fix

### Step 1: Check your current .env
```bash
cat .env
```

### Step 2: Edit .env
```bash
nano .env
```

### Step 3: Make sure ALL these match:

1. **POSTGRES_USER** = `frontuser`
2. **POSTGRES_DB** = `portfolio_prod`
3. **POSTGRES_PASSWORD** = Your actual password
4. **DATABASE_URL** format:
   ```
   postgresql://[POSTGRES_USER]:[POSTGRES_PASSWORD]@db:5432/[POSTGRES_DB]
   ```

### Step 4: Example with real values:

If your password is `SecurePass123!`, your .env should be:

```env
DOMAIN=evolune.dev
POSTGRES_DB=portfolio_prod
POSTGRES_USER=frontuser
POSTGRES_PASSWORD=SecurePass123!
DATABASE_URL=postgresql://frontuser:SecurePass123%21@db:5432/portfolio_prod
#                                                      ^^^^ ! becomes %21
SECRET_KEY=abc123def456...
NEXT_PUBLIC_API_URL=https://evolune.dev
ENVIRONMENT=production
```

### Step 5: Restart services
```bash
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

### Step 6: Check logs
```bash
# Wait 10 seconds for startup
sleep 10

# Check if backend connected successfully
docker compose -f docker-compose.prod.yml logs backend | grep -i "ready\|postgres\|error"
```

## 🎯 Quick Verification

Run this to check your configuration:
```bash
# Show your current DATABASE_URL (passwords will be visible!)
cat .env | grep DATABASE_URL

# Verify the format matches:
# postgresql://frontuser:PASSWORD@db:5432/portfolio_prod
```

## 💡 Generate a Safe Password

To avoid special character issues, generate a password with only alphanumeric characters:

```bash
# Generate safe password (alphanumeric only)
openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | head -c 32

# Or with Python
python3 -c "import secrets; print(''.join(secrets.choice('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') for _ in range(32)))"
```

This generates passwords like: `aB3xK9mN2pQ7wR4sT8vY1zC6dE5fG0hJ` (no special characters, no encoding needed!)

## 🔍 Debug Your Current Issue

Based on your error, run this on your VPS:

```bash
# Check what username is in DATABASE_URL
cat .env | grep DATABASE_URL

# The format should be:
# postgresql://frontuser:xxxxx@db:5432/portfolio_prod
#              ^^^^^^^^^^^^^^ This MUST match POSTGRES_USER

# Check POSTGRES_USER
cat .env | grep POSTGRES_USER

# These MUST match!
```

## 🚨 Current Error Analysis

Your error says: `password authentication failed for user "portfolio"`

This means your DATABASE_URL looks like:
```env
DATABASE_URL=postgresql://portfolio:password@db:5432/portfolio_prod
```

But it should be:
```env
DATABASE_URL=postgresql://frontuser:password@db:5432/portfolio_prod
                          ^^^^^^^^^^^^^^
```

Fix this and restart!
