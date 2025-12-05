#!/bin/bash

# Cleanup Script - Remove cache and temporary files
# Run this before committing to git

echo "Cleaning up cache and temporary files..."

# Stop Docker containers first (they may have created root-owned files)
echo "Stopping Docker containers..."
docker-compose down 2>/dev/null || true

# Remove Python cache files (may require sudo if owned by root)
echo "Removing Python cache files..."
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -type f -name "*.pyc" -delete 2>/dev/null || true
find . -type f -name "*.pyo" -delete 2>/dev/null || true

# Remove Next.js cache
echo "Removing Next.js cache..."
rm -rf frontend/.next 2>/dev/null || true
rm -rf frontend/out 2>/dev/null || true

# Remove node_modules (optional - uncomment if needed)
# echo "Removing node_modules..."
# rm -rf frontend/node_modules 2>/dev/null || true

# Remove log files
echo "Removing log files..."
find . -type f -name "*.log" -delete 2>/dev/null || true

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "If you see permission errors, run:"
echo "  sudo find . -type d -name '__pycache__' -exec rm -rf {} + 2>/dev/null"
echo ""
echo "Now you can run: git add ."
