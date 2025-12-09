#!/bin/bash
set -e

echo "🔍 Checking sample data in database..."
echo ""

# Check if containers are running
if ! docker-compose ps | grep -q "Up"; then
    echo "❌ Docker containers not running"
    exit 1
fi

# Create a temporary Python script
cat > /tmp/check_data.py << 'PYEOF'
from app.database import SessionLocal
from app.models.content_file import ContentFile

db = SessionLocal()
items = db.query(ContentFile).all()

print(f'📊 Total content items: {len(items)}')
print('')

if items:
    print('Content breakdown:')
    sections = {}
    for item in items:
        section = item.section
        sections[section] = sections.get(section, 0) + 1

    for section, count in sections.items():
        print(f'  - {section}: {count} item(s)')

    print('')
    print('Items:')
    for item in items:
        title = item.metajson.get('title', 'Untitled')
        status = '✅ Published' if item.is_published else '❌ Draft'
        print(f'  - [{item.section}] {title} - {status}')
else:
    print('⚠️  No content found in database')
    print('')
    print('Run ./scripts/populate_local.sh to add sample data')

db.close()
PYEOF

# Copy to container and run
docker cp /tmp/check_data.py dimension-backend-1:/app/check_data.py
docker-compose exec -T backend sh -c "cd /app && python check_data.py"

# Cleanup
rm /tmp/check_data.py

echo ""
echo "✅ Check complete"
