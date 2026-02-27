#!/bin/bash

# VPS Deployment Script for Portfolio Application
# Usage: ./deploy-vps.sh [--force-rebuild]

set -e  # Exit on error

echo "========================================="
echo "Portfolio VPS Deployment Script"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Parse arguments
FORCE_REBUILD=false
if [ "$1" == "--force-rebuild" ]; then
    FORCE_REBUILD=true
    echo -e "${YELLOW}Force rebuild enabled${NC}"
fi

# Step 1: Pull latest code
echo -e "${GREEN}[1/5] Pulling latest code from Git...${NC}"
git pull origin main

# Step 2: Check for .env file
echo -e "${GREEN}[2/5] Checking environment configuration...${NC}"
if [ ! -f .env ]; then
    echo -e "${RED}ERROR: .env file not found!${NC}"
    echo "Please create .env file with your production settings"
    echo "See .env.production.example for reference"
    exit 1
fi

# Step 3: Build containers
if [ "$FORCE_REBUILD" = true ]; then
    echo -e "${GREEN}[3/5] Building all containers (forced)...${NC}"
    docker compose -f docker-compose.prod.yml build --no-cache
else
    echo -e "${GREEN}[3/5] Building containers...${NC}"
    docker compose -f docker-compose.prod.yml build
fi

# Step 4: Start services
echo -e "${GREEN}[4/5] Starting services...${NC}"
docker compose -f docker-compose.prod.yml up -d

# Step 5: Check service health
echo -e "${GREEN}[5/5] Checking service health...${NC}"

# Wait for frontend to be healthy (up to 3 minutes)
echo -e "  Waiting for frontend to become healthy..."
RETRIES=36
while [ $RETRIES -gt 0 ]; do
    HEALTH=$(docker compose -f docker-compose.prod.yml ps frontend --format "{{.Health}}" 2>/dev/null)
    if [ "$HEALTH" = "healthy" ]; then
        echo -e "  ✓ frontend: ${GREEN}healthy${NC}"
        break
    fi
    echo -e "  frontend: ${YELLOW}${HEALTH:-starting}${NC} (retrying in 5s...)"
    sleep 5
    RETRIES=$((RETRIES-1))
done

# Restart nginx to pick up the new frontend container IP from Docker DNS
echo -e "  Restarting nginx to refresh upstream DNS..."
docker compose -f docker-compose.prod.yml restart nginx
echo -e "  ✓ nginx: ${GREEN}restarted${NC}"

# Check all containers
CONTAINERS=$(docker compose -f docker-compose.prod.yml ps --services)
for service in $CONTAINERS; do
    STATUS=$(docker compose -f docker-compose.prod.yml ps $service --format "{{.State}}")
    if [ "$STATUS" == "running" ]; then
        echo -e "  ✓ ${service}: ${GREEN}running${NC}"
    else
        echo -e "  ✗ ${service}: ${RED}${STATUS}${NC}"
    fi
done

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Check logs: docker compose -f docker-compose.prod.yml logs -f"
echo "2. Verify site: https://\${DOMAIN}"
echo "3. Create admin user if needed:"
echo "   docker compose -f docker-compose.prod.yml exec backend python3 scripts/create_admin.py --email admin@example.com --password YourPassword --name 'Admin'"
echo ""
