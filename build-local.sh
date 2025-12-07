#!/bin/bash

# Local Build Script - Build frontend locally before deployment
# This avoids dependency issues on the server

set -e

echo "========================================="
echo "Local Build Script"
echo "========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ Error: Run this script from the project root directory"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found"
    echo "Make sure to create .env on the server with production values"
fi

# Build frontend
echo "🔨 Building frontend locally..."
cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build Next.js application
echo "🏗️  Building Next.js production bundle..."
NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-"https://yourdomain.com"} npm run build

# Check if build was successful
if [ ! -d ".next/standalone" ]; then
    echo "❌ Error: Build failed - .next/standalone directory not found"
    echo "Make sure next.config.js has output: 'standalone'"
    exit 1
fi

cd ..

echo ""
echo "✅ Frontend build complete!"
echo ""
echo "Build artifacts:"
echo "  📁 frontend/.next/standalone"
echo "  📁 frontend/.next/static"
echo "  📁 frontend/public"
echo ""
echo "Next steps:"
echo "  1. Commit and push changes: git add . && git commit -m 'Add built frontend' && git push"
echo "  2. SSH to server and pull: git pull origin main"
echo "  3. Run deploy: ./deploy.sh"
echo ""
