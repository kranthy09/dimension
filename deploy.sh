#!/bin/bash

# Production Deployment Script for Dimension Portfolio
# Usage: ./deploy.sh

set -e

echo "========================================="
echo "Dimension Portfolio - Production Deploy"
echo "========================================="
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env from .env.production.example"
    exit 1
fi

# Load environment variables
set -a
source .env
set +a

# Validate required variables
if [ -z "$DOMAIN" ] || [ -z "$SECRET_KEY" ] || [ -z "$POSTGRES_PASSWORD" ]; then
    echo "❌ Error: Missing required environment variables!"
    echo "Please check your .env file contains DOMAIN, SECRET_KEY, and POSTGRES_PASSWORD"
    exit 1
fi

echo "✅ Environment variables loaded"
echo "Domain: $DOMAIN"
echo ""

# Check if SSL certificates exist
if [ ! -f "nginx/ssl/fullchain.pem" ] || [ ! -f "nginx/ssl/privkey.pem" ]; then
    echo "⚠️  Warning: SSL certificates not found in nginx/ssl/"
    echo "You need to:"
    echo "  1. Generate SSL certificate with certbot"
    echo "  2. Copy certificates to nginx/ssl/"
    echo ""
    read -p "Do you want to continue without SSL? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Pull latest changes if using git
if [ -d ".git" ]; then
    echo "📥 Pulling latest changes from git..."
    git pull origin main || echo "⚠️  Git pull failed or not on a branch"
fi

# Build and start services
echo ""
echo "🔨 Building Docker images..."
docker-compose -f docker-compose.prod.yml build

echo ""
echo "🚀 Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo ""
echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
echo ""
echo "📊 Service Status:"
docker-compose -f docker-compose.prod.yml ps

# Test health endpoint
echo ""
echo "🏥 Testing health endpoint..."
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy!"
else
    echo "⚠️  Backend health check failed"
fi

# Show logs
echo ""
echo "📝 Recent logs:"
docker-compose -f docker-compose.prod.yml logs --tail=20

echo ""
echo "========================================="
echo "✅ Deployment Complete!"
echo "========================================="
echo ""
echo "Your portfolio should be accessible at:"
echo "  https://$DOMAIN"
echo ""
echo "Admin panel:"
echo "  https://$DOMAIN/admin/login"
echo ""
echo "Useful commands:"
echo "  View logs:    docker-compose -f docker-compose.prod.yml logs -f"
echo "  Stop:         docker-compose -f docker-compose.prod.yml down"
echo "  Restart:      docker-compose -f docker-compose.prod.yml restart"
echo "  Status:       docker-compose -f docker-compose.prod.yml ps"
echo ""
