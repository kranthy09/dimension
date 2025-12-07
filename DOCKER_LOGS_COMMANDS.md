# Docker Logs Commands Reference

## Quick Commands for This Project

### View All Services Logs
```bash
# All services together (live tail)
docker compose -f docker-compose.prod.yml logs -f

# All services (last 100 lines)
docker compose -f docker-compose.prod.yml logs --tail=100

# All services since specific time
docker compose -f docker-compose.prod.yml logs --since 10m
```

### Individual Service Logs

#### Backend Logs
```bash
# Live tail
docker compose -f docker-compose.prod.yml logs -f backend

# Last 50 lines
docker compose -f docker-compose.prod.yml logs --tail=50 backend

# With timestamps
docker compose -f docker-compose.prod.yml logs -f -t backend

# Since specific time (10 minutes ago)
docker compose -f docker-compose.prod.yml logs --since 10m backend
```

#### Frontend Logs
```bash
# Live tail
docker compose -f docker-compose.prod.yml logs -f frontend

# Last 50 lines
docker compose -f docker-compose.prod.yml logs --tail=50 frontend

# With timestamps
docker compose -f docker-compose.prod.yml logs -f -t frontend
```

#### Database Logs
```bash
# Live tail
docker compose -f docker-compose.prod.yml logs -f db

# Last 50 lines
docker compose -f docker-compose.prod.yml logs --tail=50 db

# With timestamps
docker compose -f docker-compose.prod.yml logs -f -t db
```

#### Nginx Logs
```bash
# Live tail
docker compose -f docker-compose.prod.yml logs -f nginx

# Last 50 lines
docker compose -f docker-compose.prod.yml logs --tail=50 nginx

# With timestamps
docker compose -f docker-compose.prod.yml logs -f -t nginx
```

### Multiple Services at Once
```bash
# Backend and database
docker compose -f docker-compose.prod.yml logs -f backend db

# Frontend and nginx
docker compose -f docker-compose.prod.yml logs -f frontend nginx
```

## Advanced Filtering

### Filter by Time
```bash
# Logs from last 5 minutes
docker compose -f docker-compose.prod.yml logs --since 5m

# Logs from last hour
docker compose -f docker-compose.prod.yml logs --since 1h

# Logs from specific timestamp
docker compose -f docker-compose.prod.yml logs --since 2025-12-07T19:00:00

# Logs until specific time
docker compose -f docker-compose.prod.yml logs --until 2025-12-07T20:00:00
```

### Search Within Logs
```bash
# Search for errors in backend
docker compose -f docker-compose.prod.yml logs backend | grep -i error

# Search for specific patterns
docker compose -f docker-compose.prod.yml logs backend | grep -i "database\|connection"

# Count error occurrences
docker compose -f docker-compose.prod.yml logs backend | grep -c ERROR
```

### Save Logs to File
```bash
# Save all logs
docker compose -f docker-compose.prod.yml logs > all-logs.txt

# Save backend logs
docker compose -f docker-compose.prod.yml logs backend > backend-logs.txt

# Save last 500 lines
docker compose -f docker-compose.prod.yml logs --tail=500 > recent-logs.txt
```

## Using Raw Docker Commands (Without Compose)

### List All Containers
```bash
# Show running containers
docker ps

# Show all containers (including stopped)
docker ps -a

# Show only container IDs and names
docker ps --format "{{.ID}}: {{.Names}}"
```

### View Logs by Container Name
```bash
# Find container name first
docker ps

# View logs (replace CONTAINER_NAME)
docker logs -f dimension-backend-1
docker logs -f dimension-frontend-1
docker logs -f dimension-db-1
docker logs -f dimension-nginx-1

# Last 100 lines
docker logs --tail=100 dimension-backend-1

# With timestamps
docker logs -f -t dimension-backend-1

# Since 30 minutes ago
docker logs --since 30m dimension-backend-1
```

### View Logs by Container ID
```bash
# Get container ID
docker ps

# View logs (replace CONTAINER_ID)
docker logs -f abc123def456

# Last 50 lines
docker logs --tail=50 abc123def456
```

## Monitoring & Debugging Commands

### Check Container Status
```bash
# Status of all services
docker compose -f docker-compose.prod.yml ps

# Detailed info about container
docker inspect dimension-backend-1

# Resource usage stats
docker stats

# Stats for specific container
docker stats dimension-backend-1
```

### Execute Commands Inside Containers
```bash
# Access backend shell
docker compose -f docker-compose.prod.yml exec backend bash

# Access database
docker compose -f docker-compose.prod.yml exec db psql -U portfolio_user -d portfolio_prod

# Run one-off command
docker compose -f docker-compose.prod.yml exec backend python3 -c "print('Hello')"
```

### Check Application-Specific Logs

#### Backend Application Logs
```bash
# Inside container
docker compose -f docker-compose.prod.yml exec backend ls -la /app

# View Python errors
docker compose -f docker-compose.prod.yml logs backend | grep -A 5 "Traceback"

# Check database connection
docker compose -f docker-compose.prod.yml logs backend | grep -i "database\|postgres"
```

#### Nginx Access & Error Logs
```bash
# Access nginx container
docker compose -f docker-compose.prod.yml exec nginx sh

# Inside nginx container:
# tail -f /var/log/nginx/access.log
# tail -f /var/log/nginx/error.log

# From host (using docker exec)
docker compose -f docker-compose.prod.yml exec nginx cat /var/log/nginx/error.log
docker compose -f docker-compose.prod.yml exec nginx cat /var/log/nginx/access.log
```

## Troubleshooting Specific Issues

### Backend Not Starting
```bash
# Check backend logs for errors
docker compose -f docker-compose.prod.yml logs backend | grep -i error

# Check database connection
docker compose -f docker-compose.prod.yml logs backend | grep -i "database\|connection"

# Check migrations
docker compose -f docker-compose.prod.yml logs backend | grep -i "alembic\|migration"
```

### Database Issues
```bash
# Check if database is ready
docker compose -f docker-compose.prod.yml exec db pg_isready -U portfolio_user

# Check database logs
docker compose -f docker-compose.prod.yml logs db | grep -i "error\|fatal"

# List databases
docker compose -f docker-compose.prod.yml exec db psql -U portfolio_user -l
```

### Frontend Issues
```bash
# Check frontend build/start logs
docker compose -f docker-compose.prod.yml logs frontend | grep -i "error\|failed"

# Check if frontend is listening
docker compose -f docker-compose.prod.yml exec frontend netstat -tuln | grep 3000
```

### Nginx Issues
```bash
# Check nginx config
docker compose -f docker-compose.prod.yml exec nginx nginx -t

# Check nginx errors
docker compose -f docker-compose.prod.yml logs nginx | grep -i error

# Check upstream connections
docker compose -f docker-compose.prod.yml logs nginx | grep -i "upstream"
```

## Quick Diagnostic Script

Save this as `check-logs.sh`:

```bash
#!/bin/bash
echo "=== SERVICE STATUS ==="
docker compose -f docker-compose.prod.yml ps
echo ""

echo "=== BACKEND LOGS (last 20 lines) ==="
docker compose -f docker-compose.prod.yml logs --tail=20 backend
echo ""

echo "=== FRONTEND LOGS (last 20 lines) ==="
docker compose -f docker-compose.prod.yml logs --tail=20 frontend
echo ""

echo "=== DATABASE LOGS (last 10 lines) ==="
docker compose -f docker-compose.prod.yml logs --tail=10 db
echo ""

echo "=== NGINX LOGS (last 10 lines) ==="
docker compose -f docker-compose.prod.yml logs --tail=10 nginx
echo ""

echo "=== CHECKING FOR ERRORS ==="
echo "Backend errors:"
docker compose -f docker-compose.prod.yml logs backend | grep -i error | tail -5
echo ""
echo "Database errors:"
docker compose -f docker-compose.prod.yml logs db | grep -i "error\|fatal" | tail -5
```

Make it executable:
```bash
chmod +x check-logs.sh
./check-logs.sh
```

## One-Liner Commands

```bash
# Check all errors across all services
docker compose -f docker-compose.prod.yml logs | grep -i error

# Count errors by service
docker compose -f docker-compose.prod.yml logs backend | grep -c ERROR
docker compose -f docker-compose.prod.yml logs frontend | grep -c ERROR

# Get last error from each service
docker compose -f docker-compose.prod.yml logs backend | grep -i error | tail -1
docker compose -f docker-compose.prod.yml logs frontend | grep -i error | tail -1

# Follow logs and highlight errors in red (requires grep with color)
docker compose -f docker-compose.prod.yml logs -f | grep --color=always -i error
```

## Log Management

### Clear Old Logs
```bash
# Docker automatically rotates logs based on /etc/docker/daemon.json
# To manually clear logs:

# Stop container
docker compose -f docker-compose.prod.yml stop backend

# Clear logs
sudo truncate -s 0 $(docker inspect --format='{{.LogPath}}' dimension-backend-1)

# Start container
docker compose -f docker-compose.prod.yml start backend
```

### Configure Log Rotation
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

Then restart Docker:
```bash
sudo systemctl restart docker
```
