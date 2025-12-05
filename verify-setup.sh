#!/bin/bash
# verify-setup.sh - Verify portfolio setup is working

set -e

echo "🔍 Verifying Portfolio Setup..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if docker-compose is running
echo "1️⃣  Checking Docker services..."
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✓ Docker services are running${NC}"
else
    echo -e "${RED}✗ Docker services are not running${NC}"
    echo "   Run: docker-compose up -d"
    exit 1
fi
echo ""

# Check database
echo "2️⃣  Checking database..."
if docker-compose ps db | grep -q "healthy"; then
    echo -e "${GREEN}✓ Database is healthy${NC}"
else
    echo -e "${YELLOW}⚠ Database may not be ready yet${NC}"
fi
echo ""

# Check backend
echo "3️⃣  Checking backend..."
if curl -s http://localhost:8000/health | grep -q "healthy"; then
    echo -e "${GREEN}✓ Backend is responding${NC}"
    echo "   API Docs: http://localhost:8000/docs"
else
    echo -e "${RED}✗ Backend is not responding${NC}"
    echo "   Check logs: docker-compose logs backend"
fi
echo ""

# Check frontend
echo "4️⃣  Checking frontend..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is responding${NC}"
    echo "   URL: http://localhost:3000"
else
    echo -e "${RED}✗ Frontend is not responding${NC}"
    echo "   Check logs: docker-compose logs frontend"
fi
echo ""

# Check admin upload
echo "5️⃣  Checking admin upload page..."
if curl -s http://localhost:3000/admin/upload > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Admin upload page is accessible${NC}"
    echo "   URL: http://localhost:3000/admin/upload"
else
    echo -e "${YELLOW}⚠ Admin upload page not accessible yet${NC}"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Services:"
echo "  🗄️  Database:     http://localhost:5432"
echo "  🔧 Backend API:  http://localhost:8000"
echo "  🎨 Frontend:     http://localhost:3000"
echo ""
echo "Quick Links:"
echo "  📚 API Docs:     http://localhost:8000/docs"
echo "  ⬆️  Admin Upload: http://localhost:3000/admin/upload"
echo ""
echo "Next Steps:"
echo "  1. Create content:  python scripts/generate_template.py blog my-post 'My Post'"
echo "  2. Upload via UI:   http://localhost:3000/admin/upload"
echo "  3. View content:    http://localhost:3000/blog"
echo ""
echo -e "${GREEN}✅ Setup verification complete!${NC}"
