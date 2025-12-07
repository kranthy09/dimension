#!/bin/bash

# Deploy from Local - Build locally and sync to VPS
# Usage: ./deploy-from-local.sh [user@]hostname

set -e

echo "========================================="
echo "Deploy from Local Machine"
echo "========================================="
echo ""

# Check arguments
if [ -z "$1" ]; then
    echo "❌ Error: Server hostname required"
    echo "Usage: ./deploy-from-local.sh [user@]hostname"
    echo "Example: ./deploy-from-local.sh root@123.456.789.0"
    exit 1
fi

SERVER=$1
REMOTE_PATH="/home/portfolio/dimension"

# Check if we're in the right directory
if [ ! -f "docker-compose.prod.yml" ]; then
    echo "❌ Error: Run this script from the project root directory"
    exit 1
fi

# Build frontend locally
echo "🔨 Step 1/4: Building frontend locally..."
cd frontend

if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🏗️  Building Next.js..."
npm run build

if [ ! -d ".next/standalone" ]; then
    echo "❌ Error: Build failed"
    exit 1
fi

cd ..
echo "✅ Frontend built successfully"
echo ""

# Sync code to server (excluding node_modules, .next cache)
echo "📤 Step 2/4: Syncing code to server..."
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude 'frontend/.next/cache' \
    --exclude 'backend/__pycache__' \
    --exclude 'backend/venv' \
    --exclude '.git' \
    --exclude '*.pyc' \
    ./ ${SERVER}:${REMOTE_PATH}/

echo "✅ Code synced"
echo ""

# Run deployment on server
echo "🚀 Step 3/4: Running deployment on server..."
ssh ${SERVER} "cd ${REMOTE_PATH} && ./deploy.sh"

echo ""
echo "========================================="
echo "✅ Deployment Complete!"
echo "========================================="
echo ""
echo "Your application should be running on the server"
echo ""
