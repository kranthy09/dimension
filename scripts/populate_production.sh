#!/bin/bash
set -e

echo "🚀 Populating production database..."
echo ""

# Confirm with user
read -p "⚠️  This will modify production data. Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted"
    exit 1
fi

# Check if containers are running
if ! docker-compose ps | grep -q "Up"; then
    echo "❌ Docker containers not running. Please start them first."
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p backups

# Backup first
BACKUP_FILE="backups/portfolio_backup_$(date +%Y%m%d_%H%M%S).sql"
echo "📦 Creating backup at $BACKUP_FILE..."
docker-compose exec -T db pg_dump -U frontuser portfolio > "$BACKUP_FILE"
echo "✅ Backup created successfully"

# Run population script
echo "📝 Populating data..."
docker-compose exec -T backend python /app/scripts/populate_sample_data.py

echo ""
echo "✅ Done! Sample data has been populated in production"
echo ""
echo "Backup saved at: $BACKUP_FILE"
echo "Check your production site to verify the data"
