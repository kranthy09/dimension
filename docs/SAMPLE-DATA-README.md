# Sample Data Population

## Overview

The database has been populated with 15 sample items to showcase the new Energy & Evolution design:
- **5 Blog Posts** - Technical articles on Python, FastAPI, React, Docker/Kubernetes, and TypeScript
- **5 Projects** - Full-stack applications including chat apps, AI tools, and automation platforms
- **5 Case Studies** - In-depth analyses of scaling, optimization, migration, caching, and real-time features

## Populated Data

### Blog Posts (5)

1. **Mastering Python Async/Await: A Deep Dive**
   - Category: Python
   - Tags: Python, Async, Programming, Tutorial
   - Read Time: 12 min

2. **Building Scalable APIs with FastAPI**
   - Category: Backend
   - Tags: FastAPI, API, Python, Backend
   - Read Time: 15 min

3. **Modern React State Management in 2025**
   - Category: Frontend
   - Tags: React, State Management, JavaScript, Frontend
   - Read Time: 10 min

4. **From Docker to Kubernetes: A Practical Guide**
   - Category: DevOps
   - Tags: Docker, Kubernetes, DevOps, Containers
   - Read Time: 18 min

5. **Advanced TypeScript Types You Should Know**
   - Category: TypeScript
   - Tags: TypeScript, JavaScript, Programming, Types
   - Read Time: 8 min

### Projects (5)

1. **Real-Time Chat Application**
   - Tech Stack: React, Node.js, Socket.io, MongoDB, TypeScript
   - Demo: https://chat-demo.example.com
   - Code: https://github.com/example/chat-app

2. **AI-Powered Code Review Assistant**
   - Tech Stack: Python, FastAPI, OpenAI, PostgreSQL, React
   - Demo: https://code-review.example.com
   - Code: https://github.com/example/ai-reviewer

3. **Task Automation Platform**
   - Tech Stack: Next.js, PostgreSQL, Redis, Docker, TypeScript
   - Demo: https://automate.example.com
   - Code: https://github.com/example/automation

4. **Markdown-First Portfolio CMS**
   - Tech Stack: Next.js, FastAPI, PostgreSQL, Alembic, Markdown
   - Code: https://github.com/example/portfolio-cms

5. **API Analytics Dashboard**
   - Tech Stack: React, D3.js, Python, InfluxDB, Kubernetes
   - Demo: https://analytics.example.com
   - Code: https://github.com/example/api-analytics

### Case Studies (5)

1. **Scaling Microservices from 100 to 1M Users**
   - Category: Architecture
   - Tags: Microservices, Scaling, Architecture, Performance

2. **Database Optimization: Reducing Query Time by 95%**
   - Category: Performance
   - Tags: Database, PostgreSQL, Optimization, Performance

3. **Zero-Downtime Migration: MongoDB to PostgreSQL**
   - Category: Migration
   - Tags: MongoDB, PostgreSQL, Migration, DevOps

4. **Implementing Multi-Layer Caching: 10x Performance Boost**
   - Category: Performance
   - Tags: Caching, Redis, Performance, Architecture

5. **Building Real-Time Features with WebSockets**
   - Category: Architecture
   - Tags: WebSockets, Real-time, Architecture, Scaling

## Viewing the Data

### Frontend URLs
- **Homepage**: http://localhost:3000
- **Blog**: http://localhost:3000/blog
- **Projects**: http://localhost:3000/projects
- **Case Studies**: http://localhost:3000/case-studies

### API Endpoints
- **Blog**: http://localhost:8000/api/v1/content/blog
- **Projects**: http://localhost:8000/api/v1/content/project
- **Case Studies**: http://localhost:8000/api/v1/content/case-study
- **API Docs**: http://localhost:8000/docs

## Re-populating Data

To re-populate the sample data (this will DELETE existing data):

```bash
docker-compose exec backend python3 -c "
import os, sys
from datetime import datetime, timedelta
import random
sys.path.insert(0, '/app')
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.content_file import ContentFile
import uuid

# ... (run the population script)
"
```

Or simply run the inline script again via the bash command.

## Clearing Sample Data

To remove all sample data:

```bash
docker-compose exec backend python3 -c "
import os, sys
sys.path.insert(0, '/app')
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.content_file import ContentFile

DATABASE_URL = os.getenv('DATABASE_URL')
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
session = SessionLocal()

session.query(ContentFile).delete()
session.commit()
session.close()
print('✅ All data cleared!')
"
```

Or use a fresh database:

```bash
docker-compose down -v
docker-compose build
docker-compose up -d
```

## Files Created

All markdown files are stored in:
- `/app/media/markdown/blog/*.md`
- `/app/media/markdown/project/*.md`
- `/app/media/markdown/case-study/*.md`

Database records are created in the `content_files` table with `is_published=true` and realistic publication dates.

## Design Showcase

The sample data is designed to showcase the new **Energy & Evolution** design system:

- ✨ Orange (Energy) and Green (Life) gradients
- 🎨 Terracotta-inspired neutral colors
- 🌓 Dark/Light theme toggle
- 📱 Responsive card layouts
- 🎯 Professional typography
- ⚡ Smooth animations and transitions

Each section (Blog, Projects, Case Studies) has its own visual identity while maintaining design consistency.

## Notes

- All published dates are randomized within the past 120 days
- All items are marked as published (`is_published=true`)
- External URLs are placeholder examples
- Content is abbreviated for demo purposes
- Tech stacks and tags are realistic and diverse

Enjoy exploring your new portfolio design! 🎉
