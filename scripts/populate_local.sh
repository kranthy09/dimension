#!/bin/bash
set -e

echo "🚀 Populating local development database..."

# Check if containers are running
if ! docker-compose ps | grep -q "Up"; then
    echo "❌ Docker containers not running. Starting..."
    docker-compose up -d
    sleep 5
fi

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
for i in {1..30}; do
    if docker-compose exec -T db pg_isready -U frontuser -d portfolio > /dev/null 2>&1; then
        echo "✅ Database is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Database failed to start"
        exit 1
    fi
    sleep 1
done

# Run population script
echo "📝 Running population script..."
docker-compose exec -T backend python /app/scripts/populate_sample_data.py

echo ""
echo "✅ Done! Visit http://localhost:3000 to see the sample data"
echo ""
echo "Sample content available at:"
echo "  - http://localhost:3000/blog"
echo "  - http://localhost:3000/projects"
echo "  - http://localhost:3000/case-studies"
