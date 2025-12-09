#!/usr/bin/env python3
"""
Sample Data Population Script
Creates 1 item for each section: blog, project, case-study
"""

import os
import sys
from datetime import datetime

# Add backend to path
sys.path.insert(
    0, os.path.join(os.path.dirname(__file__), '..', 'backend')
)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.content_file import ContentFile
from app.database import Base
import uuid

# Database connection
DATABASE_URL = os.getenv(
    'DATABASE_URL',
    'postgresql://frontuser:frontpass@db:5432/portfolio'
)
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Sample data templates
BLOG_POSTS = [
    {
        "slug": "mastering-python-async",
        "title": "Mastering Python Async/Await: A Deep Dive",
        "summary": (
            "Explore the intricacies of asynchronous programming in "
            "Python, from basic concepts to advanced patterns."
        ),
        "category": "Python",
        "tags": ["Python", "Async", "Programming", "Tutorial"],
        "readTime": "12 min",
        "content": """# Mastering Python Async/Await

Asynchronous programming has become essential in modern Python \
development. Let's explore how to leverage async/await effectively.

## Understanding the Event Loop

The event loop is the heart of async programming. It manages the \
execution of asynchronous tasks, allowing your program to handle \
multiple operations concurrently without blocking.

## Common Patterns

1. **Concurrent API Calls**
   ```python
   async def fetch_multiple():
       results = await asyncio.gather(
           fetch_api_1(),
           fetch_api_2(),
           fetch_api_3()
       )
       return results
   ```

2. **Database Operations**
   Use async database drivers for non-blocking queries.

3. **File I/O**
   `aiofiles` provides async file operations.

## Best Practices

- Always use async context managers
- Handle exceptions properly with try/except
- Avoid blocking calls in async functions
- Use `asyncio.create_task()` for fire-and-forget operations

## Conclusion

Mastering async/await opens up new possibilities for building \
high-performance Python applications that can handle thousands of \
concurrent connections efficiently.
"""
    }
]

PROJECTS = [
    {
        "slug": "realtime-chat-app",
        "title": "Real-Time Chat Application",
        "summary": (
            "A full-stack chat application with WebSocket support, "
            "user authentication, and message persistence."
        ),
        "techStack": [
            "React",
            "Node.js",
            "Socket.io",
            "MongoDB",
            "TypeScript"
        ],
        "deployedUrl": "https://chat-demo.example.com",
        "codebaseUrl": "https://github.com/example/chat-app",
        "content": """# Real-Time Chat Application

A modern chat application built with real-time communication \
capabilities.

## Features

- Real-time messaging with Socket.io
- User authentication and authorization
- Message history and search
- Typing indicators
- Online status tracking
- File sharing support

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS
- **Backend**: Node.js, Express, Socket.io
- **Database**: MongoDB
- **Auth**: JWT tokens
- **Deployment**: Docker, AWS

## Architecture

The application uses a microservices architecture with separate \
services for:
- Authentication service
- Messaging service
- Presence tracking service

## Challenges Solved

- **Scalability**: Implemented Redis pub/sub for horizontal scaling
- **Message ordering**: Ensured consistent message delivery across \
clients
- **Connection management**: Handled reconnection logic gracefully

## Screenshots

[Screenshots would go here in production]

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

Visit `http://localhost:3000` to see the application.
"""
    }
]

CASE_STUDIES = [
    {
        "slug": "e-commerce-performance-optimization",
        "title": "E-Commerce Platform Performance Optimization",
        "summary": (
            "How we reduced page load times by 70% and increased "
            "conversion rates by 25% for a major e-commerce platform."
        ),
        "category": "Performance",
        "tags": [
            "Performance",
            "Optimization",
            "E-Commerce",
            "Case Study"
        ],
        "content": """# E-Commerce Platform Performance Optimization

## Executive Summary

A major e-commerce platform was experiencing slow page load times \
affecting user experience and conversion rates. We implemented \
comprehensive performance optimizations that resulted in 70% faster \
load times and 25% increase in conversions.

## The Challenge

**Initial Metrics:**
- Average page load: 8.5 seconds
- Lighthouse score: 35/100
- Bounce rate: 45%
- Mobile performance: Critical

**Business Impact:**
- High cart abandonment
- Poor mobile experience
- Losing customers to competitors

## Our Approach

### 1. Performance Audit

We conducted a comprehensive audit using:
- Chrome DevTools
- Lighthouse
- WebPageTest
- Real User Monitoring (RUM)

### 2. Key Optimizations

**Image Optimization**
- Implemented WebP format with fallbacks
- Lazy loading for below-fold images
- Responsive images with srcset
- Result: 60% reduction in image payload

**Code Splitting**
- Route-based code splitting
- Dynamic imports for heavy components
- Tree shaking unused code
- Result: 45% smaller JavaScript bundle

**Caching Strategy**
- Implemented service workers
- Browser cache optimization
- CDN for static assets
- Result: 80% reduction in repeat visit load times

**Database Optimization**
- Query optimization
- Database indexing
- Redis caching layer
- Result: 50% faster API responses

### 3. Implementation Timeline

- Week 1-2: Audit and planning
- Week 3-4: Image optimization
- Week 5-6: Code splitting
- Week 7-8: Caching implementation
- Week 9-10: Testing and monitoring

## Results

**Performance Metrics:**
- Page load time: 8.5s → 2.5s (70% improvement)
- Lighthouse score: 35 → 92 (164% improvement)
- Time to Interactive: 12s → 3.5s (71% improvement)
- First Contentful Paint: 3.2s → 1.1s (66% improvement)

**Business Metrics:**
- Conversion rate: +25%
- Bounce rate: 45% → 28%
- Mobile transactions: +40%
- Customer satisfaction: +35%

## Key Takeaways

1. **Measure First**: Always establish baseline metrics
2. **Prioritize Impact**: Focus on high-impact optimizations first
3. **Test Thoroughly**: Use A/B testing for changes
4. **Monitor Continuously**: Set up ongoing performance monitoring

## Technologies Used

- Next.js for server-side rendering
- Sharp for image optimization
- Redis for caching
- CloudFront CDN
- Datadog for monitoring

## Conclusion

Performance optimization is not a one-time effort but an ongoing \
process. By implementing these optimizations and maintaining \
vigilance, we helped the client achieve significant improvements in \
both technical metrics and business outcomes.
"""
    }
]


def create_file_path(section: str, filename: str) -> str:
    """Create full file path for markdown file"""
    base_path = os.path.join(
        os.path.dirname(__file__),
        '..',
        'backend',
        'media',
        'markdown'
    )
    section_path = os.path.join(base_path, section)
    os.makedirs(section_path, exist_ok=True)
    return os.path.join(section_path, filename)


def save_markdown_file(section: str, data: dict) -> str:
    """Save markdown content to file"""
    filename = f"{data['slug']}.md"
    file_path = create_file_path(section, filename)

    # Create frontmatter
    frontmatter = "---\n"
    for key, value in data.items():
        if key != 'content':
            if isinstance(value, list):
                frontmatter += f"{key}:\n"
                for item in value:
                    frontmatter += f"  - {item}\n"
            else:
                frontmatter += f"{key}: {value}\n"
    frontmatter += "---\n\n"

    # Write file
    with open(file_path, 'w') as f:
        f.write(frontmatter + data['content'])

    return file_path


def populate_data():
    """Populate database with sample data"""
    db = SessionLocal()

    try:
        # Clear existing data
        print("Clearing existing sample data...")
        db.query(ContentFile).delete()
        db.commit()

        # Add blog posts
        print("\nAdding blog posts...")
        for post_data in BLOG_POSTS:
            file_path = save_markdown_file('blog', post_data)

            content = ContentFile(
                id=uuid.uuid4(),
                section='blog',
                filename=f"{post_data['slug']}.md",
                file_path=file_path,
                metajson=post_data,
                is_published=True,
                published_at=datetime.utcnow()
            )
            db.add(content)
            print(f"  ✓ Added: {post_data['title']}")

        # Add projects
        print("\nAdding projects...")
        for project_data in PROJECTS:
            file_path = save_markdown_file('project', project_data)

            content = ContentFile(
                id=uuid.uuid4(),
                section='project',
                filename=f"{project_data['slug']}.md",
                file_path=file_path,
                metajson=project_data,
                is_published=True,
                published_at=datetime.utcnow()
            )
            db.add(content)
            print(f"  ✓ Added: {project_data['title']}")

        # Add case studies
        print("\nAdding case studies...")
        for case_data in CASE_STUDIES:
            file_path = save_markdown_file('case-study', case_data)

            content = ContentFile(
                id=uuid.uuid4(),
                section='case-study',
                filename=f"{case_data['slug']}.md",
                file_path=file_path,
                metajson=case_data,
                is_published=True,
                published_at=datetime.utcnow()
            )
            db.add(content)
            print(f"  ✓ Added: {case_data['title']}")

        db.commit()
        print("\n✅ Sample data populated successfully!")
        print(f"\nTotal items created:")
        print(f"  - Blog posts: {len(BLOG_POSTS)}")
        print(f"  - Projects: {len(PROJECTS)}")
        print(f"  - Case studies: {len(CASE_STUDIES)}")

    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


def main():
    print("=" * 60)
    print("SAMPLE DATA POPULATION SCRIPT")
    print("=" * 60)

    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)

    populate_data()

    print("\n" + "=" * 60)
    print("DONE!")
    print("=" * 60)


if __name__ == "__main__":
    main()
