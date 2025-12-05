#!/usr/bin/env python3
"""
Sample Data Population Script
Creates 5 items for each section: blog, project, case-study
"""

import os
import sys
from datetime import datetime, timedelta
import random

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.content_file import ContentFile
from app.database import Base
import uuid

# Database connection
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://portfolio:portfolio_pass@localhost:5432/portfolio')
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Sample data templates
BLOG_POSTS = [
    {
        "slug": "mastering-python-async",
        "title": "Mastering Python Async/Await: A Deep Dive",
        "summary": "Explore the intricacies of asynchronous programming in Python, from basic concepts to advanced patterns.",
        "category": "Python",
        "tags": ["Python", "Async", "Programming", "Tutorial"],
        "readTime": "12 min",
        "content": """# Mastering Python Async/Await

Asynchronous programming has become essential in modern Python development. Let's explore how to leverage async/await effectively.

## Understanding the Event Loop

The event loop is the heart of async programming...

## Common Patterns

1. **Concurrent API Calls**
2. **Database Operations**
3. **File I/O**

## Best Practices

- Always use async context managers
- Handle exceptions properly
- Avoid blocking calls

## Conclusion

Mastering async/await opens up new possibilities for building high-performance Python applications.
"""
    },
    {
        "slug": "building-scalable-apis",
        "title": "Building Scalable APIs with FastAPI",
        "summary": "Learn how to design and implement production-ready APIs using FastAPI and best practices.",
        "category": "Backend",
        "tags": ["FastAPI", "API", "Python", "Backend"],
        "readTime": "15 min",
        "content": """# Building Scalable APIs with FastAPI

FastAPI has revolutionized Python web development with its speed and developer experience.

## Why FastAPI?

- Automatic API documentation
- Type safety with Pydantic
- High performance
- Async support

## Architecture Patterns

### Layered Architecture
- Routes
- Services
- Models
- Schemas

### Dependency Injection

FastAPI's dependency injection system makes testing and maintainability a breeze.

## Deployment

Best practices for deploying FastAPI applications in production.
"""
    },
    {
        "slug": "react-state-management",
        "title": "Modern React State Management in 2025",
        "summary": "A comprehensive guide to choosing and implementing state management solutions in React applications.",
        "category": "Frontend",
        "tags": ["React", "State Management", "JavaScript", "Frontend"],
        "readTime": "10 min",
        "content": """# Modern React State Management

The React ecosystem offers numerous state management solutions. Let's explore when to use each.

## Built-in Solutions

- useState
- useReducer
- useContext

## External Libraries

- Redux Toolkit
- Zustand
- Jotai

## Choosing the Right Tool

Consider your application's complexity and team expertise.

## Best Practices

- Keep state close to where it's used
- Avoid prop drilling
- Use TypeScript for type safety
"""
    },
    {
        "slug": "docker-kubernetes-intro",
        "title": "From Docker to Kubernetes: A Practical Guide",
        "summary": "Step-by-step journey from containerizing applications with Docker to orchestrating them with Kubernetes.",
        "category": "DevOps",
        "tags": ["Docker", "Kubernetes", "DevOps", "Containers"],
        "readTime": "18 min",
        "content": """# From Docker to Kubernetes

Learn how to containerize and orchestrate applications effectively.

## Docker Fundamentals

- Images and Containers
- Dockerfile best practices
- Multi-stage builds

## Docker Compose

Orchestrating multiple containers locally.

## Kubernetes Basics

- Pods and Deployments
- Services and Ingress
- ConfigMaps and Secrets

## Production Deployment

Strategies for deploying to production Kubernetes clusters.
"""
    },
    {
        "slug": "typescript-advanced-types",
        "title": "Advanced TypeScript Types You Should Know",
        "summary": "Master advanced TypeScript type features to write safer, more maintainable code.",
        "category": "TypeScript",
        "tags": ["TypeScript", "JavaScript", "Programming", "Types"],
        "readTime": "8 min",
        "content": """# Advanced TypeScript Types

TypeScript's type system is incredibly powerful. Let's explore advanced features.

## Utility Types

- Partial<T>
- Required<T>
- Pick<T, K>
- Omit<T, K>

## Conditional Types

Creating types that adapt based on conditions.

## Template Literal Types

Building string types dynamically.

## Type Guards

Narrowing types safely at runtime.

## Conclusion

These advanced features help build robust, type-safe applications.
"""
    }
]

PROJECTS = [
    {
        "slug": "realtime-chat-app",
        "title": "Real-Time Chat Application",
        "summary": "A full-stack chat application with WebSocket support, user authentication, and message persistence.",
        "techStack": ["React", "Node.js", "Socket.io", "MongoDB", "TypeScript"],
        "deployedUrl": "https://chat-demo.example.com",
        "codebaseUrl": "https://github.com/example/chat-app",
        "content": """# Real-Time Chat Application

A modern chat application built with real-time communication.

## Features

- Real-time messaging with Socket.io
- User authentication and authorization
- Message history and search
- Typing indicators
- Online status

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS
- **Backend**: Node.js, Express, Socket.io
- **Database**: MongoDB
- **Auth**: JWT

## Architecture

The application uses a microservices architecture with separate services for authentication, messaging, and presence.

## Challenges Solved

- Scalability with Redis pub/sub
- Message ordering and delivery
- Connection management

## Screenshots

[Screenshots would go here]

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`
"""
    },
    {
        "slug": "ai-code-reviewer",
        "title": "AI-Powered Code Review Assistant",
        "summary": "An intelligent code review tool that uses machine learning to identify code smells and suggest improvements.",
        "techStack": ["Python", "FastAPI", "OpenAI", "PostgreSQL", "React"],
        "deployedUrl": "https://code-review.example.com",
        "codebaseUrl": "https://github.com/example/ai-reviewer",
        "content": """# AI-Powered Code Review Assistant

Automated code review powered by AI to catch issues early.

## Features

- Automatic code analysis
- Security vulnerability detection
- Code smell identification
- Refactoring suggestions
- PR integration

## How It Works

1. Code is submitted via GitHub webhook
2. AI analyzes the code
3. Suggestions are posted as PR comments

## Tech Stack

- **AI**: OpenAI GPT-4, Custom fine-tuned models
- **Backend**: Python, FastAPI
- **Frontend**: React, TypeScript
- **Database**: PostgreSQL

## Impact

Reduced code review time by 40% and caught 95% of common issues automatically.
"""
    },
    {
        "slug": "task-automation-platform",
        "title": "Task Automation Platform",
        "summary": "A no-code platform for creating and scheduling automated workflows with 50+ integrations.",
        "techStack": ["Next.js", "PostgreSQL", "Redis", "Docker", "TypeScript"],
        "deployedUrl": "https://automate.example.com",
        "codebaseUrl": "https://github.com/example/automation",
        "content": """# Task Automation Platform

Build workflows without writing code.

## Key Features

- Drag-and-drop workflow builder
- 50+ integrations (Slack, Email, APIs)
- Scheduled and event-triggered tasks
- Real-time monitoring
- Template marketplace

## Architecture

- **Frontend**: Next.js 14 with App Router
- **Backend**: FastAPI microservices
- **Queue**: Redis for job processing
- **Storage**: PostgreSQL + S3

## Performance

- Handles 10,000+ tasks per minute
- 99.9% uptime
- Sub-second response times

## Use Cases

- Social media posting
- Data synchronization
- Report generation
- Alert notifications
"""
    },
    {
        "slug": "portfolio-cms",
        "title": "Markdown-First Portfolio CMS",
        "summary": "A content management system designed for developers, using markdown files and Git for version control.",
        "techStack": ["Next.js", "FastAPI", "PostgreSQL", "Alembic", "Markdown"],
        "codebaseUrl": "https://github.com/example/portfolio-cms",
        "content": """# Markdown-First Portfolio CMS

Built for developers who love markdown and version control.

## Philosophy

- Content as code
- Git-based workflow
- Markdown everywhere
- Type-safe schemas

## Features

- Frontmatter metadata validation
- Automatic slug generation
- Tag management
- Publishing workflow
- Full-text search

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: FastAPI, PostgreSQL
- **Storage**: File system + Database
- **Search**: PostgreSQL full-text search

## Design System

Custom design system with Energy & Evolution theme featuring orange and green gradients.
"""
    },
    {
        "slug": "api-analytics-dashboard",
        "title": "API Analytics Dashboard",
        "summary": "Real-time analytics and monitoring dashboard for REST and GraphQL APIs with custom alerting.",
        "techStack": ["React", "D3.js", "Python", "InfluxDB", "Kubernetes"],
        "deployedUrl": "https://analytics.example.com",
        "codebaseUrl": "https://github.com/example/api-analytics",
        "content": """# API Analytics Dashboard

Comprehensive API monitoring and analytics.

## Metrics Tracked

- Request/response times
- Error rates
- Throughput
- Geographic distribution
- Custom business metrics

## Visualizations

- Real-time charts with D3.js
- Heatmaps
- Geographic maps
- Custom dashboards

## Alerting

- Custom alert rules
- Multiple notification channels
- Anomaly detection

## Tech Stack

- **Frontend**: React, D3.js, TypeScript
- **Backend**: Python, FastAPI
- **Database**: InfluxDB (time-series)
- **Deploy**: Kubernetes

## Scale

- Processes 1M+ requests/day
- Sub-100ms query times
- Multi-tenant architecture
"""
    }
]

CASE_STUDIES = [
    {
        "slug": "scaling-microservices",
        "title": "Scaling Microservices from 100 to 1M Users",
        "summary": "How we redesigned our architecture to handle 10x growth while reducing infrastructure costs by 30%.",
        "category": "Architecture",
        "tags": ["Microservices", "Scaling", "Architecture", "Performance"],
        "content": """# Scaling Microservices: 100 to 1M Users

## The Challenge

Our platform was experiencing rapid growth. The monolithic architecture couldn't keep up with demand, causing frequent outages and slow response times.

### Initial State

- Monolithic Rails application
- Single PostgreSQL database
- 100K monthly active users
- Average response time: 2-3 seconds
- Frequent downtime during peak hours

### Goals

- Handle 1M+ concurrent users
- Reduce response time to <500ms
- Achieve 99.9% uptime
- Reduce infrastructure costs

## The Solution

### 1. Service Decomposition

We identified 5 core domains:
- Authentication & Users
- Content Management
- Analytics
- Notifications
- Billing

### 2. Database Strategy

- Implemented database per service
- Used PostgreSQL for transactional data
- Added Redis for caching
- Implemented event sourcing for analytics

### 3. Communication Patterns

- REST APIs for synchronous communication
- RabbitMQ for async messaging
- gRPC for inter-service communication

### 4. Infrastructure

- Kubernetes for orchestration
- Horizontal pod autoscaling
- CDN for static assets
- Load balancing with NGINX

## Results

- **Performance**: Response time reduced to 300ms (85% improvement)
- **Scalability**: Successfully handled 1.2M concurrent users
- **Reliability**: Achieved 99.95% uptime
- **Cost**: Reduced infrastructure costs by 30%
- **Development**: Faster feature deployment (3x improvement)

## Lessons Learned

1. **Start with clear boundaries**: Service boundaries should align with business domains
2. **Monitor everything**: Distributed tracing was essential for debugging
3. **Plan for failure**: Circuit breakers and retries saved us multiple times
4. **Gradual migration**: We migrated service by service over 6 months

## Challenges Faced

- **Data consistency**: Implementing eventual consistency was complex
- **Testing**: E2E testing became more challenging
- **Monitoring**: Needed centralized logging and tracing
- **Team organization**: Aligned teams with services

## Key Takeaways

Microservices aren't a silver bullet, but when done right, they enable:
- Independent scaling
- Technology diversity
- Faster deployments
- Better fault isolation

Would I do it again? Absolutely, but I'd start earlier in the growth curve.
"""
    },
    {
        "slug": "database-optimization",
        "title": "Database Optimization: Reducing Query Time by 95%",
        "summary": "A deep dive into identifying and fixing database performance bottlenecks in a high-traffic application.",
        "category": "Performance",
        "tags": ["Database", "PostgreSQL", "Optimization", "Performance"],
        "content": """# Database Optimization Journey

## The Problem

Our main dashboard query was taking 30+ seconds to load, causing user frustration and timeout errors.

### Symptoms

- Dashboard loading time: 30-45 seconds
- Database CPU usage: 90%+
- Frequent connection pool exhaustion
- Users abandoning the application

## Investigation

### 1. Query Analysis

Used `EXPLAIN ANALYZE` to identify problematic queries:

\`\`\`sql
EXPLAIN ANALYZE SELECT * FROM orders
JOIN users ON orders.user_id = users.id
WHERE created_at > NOW() - INTERVAL '30 days';
\`\`\`

**Result**: Sequential scan on 10M+ rows

### 2. Missing Indexes

Discovered several missing indexes on frequently queried columns.

### 3. N+1 Queries

ORM was generating hundreds of separate queries instead of using joins.

## Solutions Implemented

### 1. Indexing Strategy

\`\`\`sql
-- Added composite index
CREATE INDEX idx_orders_created_user
ON orders(created_at, user_id);

-- Added partial index for active records
CREATE INDEX idx_active_orders
ON orders(status)
WHERE status = 'active';
\`\`\`

### 2. Query Optimization

- Replaced N+1 with eager loading
- Used database views for complex queries
- Implemented query result caching

### 3. Connection Pooling

- Increased pool size appropriately
- Implemented connection timeout handling
- Added connection health checks

### 4. Database Tuning

\`\`\`
shared_buffers = 4GB
effective_cache_size = 12GB
work_mem = 64MB
maintenance_work_mem = 1GB
\`\`\`

## Results

- **Query Time**: 30s → 1.5s (95% improvement)
- **Database CPU**: 90% → 30%
- **Throughput**: 3x increase in queries/second
- **User Satisfaction**: Complaints dropped by 80%

## Monitoring Setup

Implemented comprehensive monitoring:
- Slow query log analysis
- Query performance dashboard
- Automated alerts for performance degradation
- Index usage tracking

## Key Lessons

1. **Measure first**: Use EXPLAIN ANALYZE religiously
2. **Index wisely**: More indexes isn't always better
3. **Cache strategically**: Cache at multiple levels
4. **Monitor continuously**: Performance degrades over time

## Tools Used

- pgAdmin for query analysis
- pg_stat_statements for query tracking
- Grafana for visualization
- Custom scripts for index recommendations
"""
    },
    {
        "slug": "zero-downtime-migration",
        "title": "Zero-Downtime Migration: MongoDB to PostgreSQL",
        "summary": "Successfully migrated 50TB of data from MongoDB to PostgreSQL without any service interruption.",
        "category": "Migration",
        "tags": ["MongoDB", "PostgreSQL", "Migration", "DevOps"],
        "content": """# Zero-Downtime Database Migration

## Background

Our application started with MongoDB but as requirements evolved, we needed ACID transactions and complex joins that PostgreSQL excels at.

### The Challenge

- **Data Volume**: 50TB across 200+ collections
- **Uptime Requirement**: 99.99% (max 4 minutes downtime/month)
- **Active Users**: 500K daily active users
- **Real-time Constraints**: Data must be consistent

## Migration Strategy

### Phase 1: Preparation (Week 1-2)

1. **Schema Design**
   - Analyzed MongoDB documents
   - Designed normalized PostgreSQL schema
   - Created migration scripts

2. **Dual-Write System**
   - Modified application to write to both databases
   - Implemented transaction wrapper
   - Added rollback capability

### Phase 2: Initial Data Migration (Week 3-4)

1. **Bulk Transfer**
   - Used custom ETL pipeline
   - Processed 1TB/day
   - Validated data integrity

2. **Verification**
   - Automated data comparison
   - Sample testing
   - Performance benchmarking

### Phase 3: Incremental Sync (Week 5-6)

1. **Change Data Capture**
   - Captured MongoDB change streams
   - Replayed changes to PostgreSQL
   - Maintained data consistency

2. **Lag Monitoring**
   - Real-time lag dashboard
   - Automated alerts
   - Catchup procedures

### Phase 4: Cutover (Week 7)

1. **Read Migration**
   - Gradual traffic shift (1% → 100%)
   - A/B testing
   - Rollback capability

2. **Write Migration**
   - Stopped MongoDB writes
   - Final data sync
   - Switched to PostgreSQL

3. **Cleanup**
   - Removed dual-write code
   - Archived MongoDB data
   - Updated documentation

## Technical Implementation

### Dual-Write Pattern

\`\`\`python
class DualWriteRepository:
    def save(self, entity):
        try:
            # Write to PostgreSQL (primary)
            pg_result = self.pg_repo.save(entity)

            # Write to MongoDB (shadow)
            try:
                self.mongo_repo.save(entity)
            except Exception as e:
                logger.error(f"MongoDB write failed: {e}")
                # Don't fail - PostgreSQL is source of truth

            return pg_result
        except Exception as e:
            # Rollback if needed
            raise
\`\`\`

### Data Validation

\`\`\`python
def validate_migration():
    for collection in collections:
        mongo_count = mongo.count(collection)
        pg_count = pg.count(table)

        if mongo_count != pg_count:
            alert(f"Count mismatch in {collection}")

        # Sample validation
        samples = mongo.sample(collection, 1000)
        for doc in samples:
            pg_doc = pg.get(doc.id)
            assert_equal(doc, pg_doc)
\`\`\`

## Challenges & Solutions

### 1. Schema Differences

**Problem**: MongoDB's flexible schema vs PostgreSQL's rigid structure
**Solution**: Created schema version migration path

### 2. Performance

**Problem**: Initial queries were slower than MongoDB
**Solution**: Proper indexing and query optimization

### 3. Data Consistency

**Problem**: Ensuring data sync during migration
**Solution**: Implemented checksums and automated validation

## Results

- **Downtime**: 0 minutes
- **Data Loss**: 0 records
- **Performance**: 40% faster queries
- **Cost**: 50% reduction in database costs
- **Duration**: 7 weeks total

## Monitoring

- Real-time lag metrics
- Data consistency checks
- Performance dashboards
- Error rate tracking

## Lessons Learned

1. **Test extensively**: We tested on production clone 5 times
2. **Have a rollback plan**: Saved us twice during read migration
3. **Monitor everything**: Early detection prevented major issues
4. **Team communication**: Daily standups were crucial
5. **User communication**: Transparent updates built trust

## Would I Do It Again?

Yes! The benefits far outweighed the effort:
- Better data integrity
- Improved query performance
- Lower costs
- Enhanced developer experience
"""
    },
    {
        "slug": "implementing-caching-strategy",
        "title": "Implementing Multi-Layer Caching: 10x Performance Boost",
        "summary": "How we designed and implemented a comprehensive caching strategy that reduced server costs and improved user experience.",
        "category": "Performance",
        "tags": ["Caching", "Redis", "Performance", "Architecture"],
        "content": """# Multi-Layer Caching Strategy

## The Challenge

Our e-commerce platform was struggling:
- Slow page loads (5+ seconds)
- High database load
- Expensive infrastructure
- Poor user experience

## Analysis

### Bottlenecks Identified

1. **Database Queries**: 80% of queries hit the same data
2. **External APIs**: Third-party API calls taking 2-3 seconds
3. **Computation**: Heavy calculations on every request
4. **Static Assets**: Unoptimized images and CSS

## Solution: Multi-Layer Caching

### Layer 1: Browser Cache

- Set appropriate Cache-Control headers
- Use ETags for validation
- Implement service workers

### Layer 2: CDN Cache

- CloudFront for static assets
- Edge caching for API responses
- Cache invalidation strategy

### Layer 3: Application Cache (Redis)

\`\`\`python
from functools import wraps
import redis

redis_client = redis.Redis()

def cache(ttl=300):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            key = f"{func.__name__}:{args}:{kwargs}"

            # Try to get from cache
            cached = redis_client.get(key)
            if cached:
                return json.loads(cached)

            # Compute and cache
            result = func(*args, **kwargs)
            redis_client.setex(
                key,
                ttl,
                json.dumps(result)
            )
            return result
        return wrapper
    return decorator

@cache(ttl=600)
def get_product(product_id):
    return db.query(Product).get(product_id)
\`\`\`

### Layer 4: Database Cache

- PostgreSQL query result cache
- Materialized views for complex queries
- Query plan caching

## Caching Patterns Implemented

### 1. Cache-Aside

Most common pattern for read-heavy workloads.

### 2. Write-Through

For critical data that must stay consistent.

### 3. Write-Behind

For high-write scenarios with eventual consistency.

## Cache Invalidation Strategy

The hardest problem in computer science!

\`\`\`python
class CacheInvalidator:
    def invalidate_product(self, product_id):
        patterns = [
            f"product:{product_id}",
            f"products:category:{product.category_id}",
            "products:featured",
            f"search:*{product.name}*"
        ]

        for pattern in patterns:
            keys = redis_client.keys(pattern)
            if keys:
                redis_client.delete(*keys)
\`\`\`

## Monitoring & Observability

### Metrics Tracked

- Cache hit rate
- Cache miss rate
- Average response time
- Memory usage
- Eviction rate

### Grafana Dashboard

Created comprehensive dashboards showing:
- Real-time hit/miss ratios
- Cache size trends
- Performance improvements
- Cost savings

## Results

### Performance

- **Page Load Time**: 5s → 0.5s (90% improvement)
- **API Response Time**: 2s → 200ms (90% improvement)
- **Database Load**: 70% reduction
- **Cache Hit Rate**: 85% average

### Cost Savings

- **Database Costs**: $5000/month → $1500/month
- **API Costs**: $2000/month → $400/month
- **Total Savings**: $5100/month ($61,200/year)

### User Impact

- Bounce rate: 40% → 15%
- Conversion rate: +25%
- User satisfaction: +35%

## Challenges Faced

### 1. Cache Stampede

**Problem**: When cache expires, multiple requests hit database
**Solution**: Implemented lock-based cache refresh

### 2. Memory Management

**Problem**: Redis running out of memory
**Solution**: Implemented LRU eviction and monitoring

### 3. Stale Data

**Problem**: Users seeing outdated information
**Solution**: Smart invalidation and shorter TTLs for critical data

## Best Practices Learned

1. **Start with metrics**: Measure before optimizing
2. **Cache at the right layer**: Don't cache everything
3. **Set appropriate TTLs**: Balance freshness and performance
4. **Monitor aggressively**: Know your hit rates
5. **Plan for invalidation**: It's harder than it seems
6. **Test edge cases**: Cache stampede, memory limits, etc.

## Tools Used

- Redis for in-memory caching
- CloudFront for CDN
- Grafana for monitoring
- Custom cache warming scripts
- Automated cache testing suite

## Conclusion

Caching transformed our application:
- 10x performance improvement
- Significant cost reduction
- Better user experience
- More scalable architecture

The key is understanding your data access patterns and choosing the right caching strategy for each use case.
"""
    },
    {
        "slug": "building-realtime-features",
        "title": "Building Real-Time Features with WebSockets",
        "summary": "Architectural decisions and implementation details for adding real-time collaboration to an existing application.",
        "category": "Architecture",
        "tags": ["WebSockets", "Real-time", "Architecture", "Scaling"],
        "content": """# Building Real-Time Collaboration Features

## The Requirement

Our project management tool needed real-time collaboration:
- Live cursor positions
- Simultaneous editing
- Instant notifications
- Presence indicators

## Technology Choices

### WebSockets vs SSE vs Polling

Evaluated three approaches:

**Long Polling**
- ❌ High latency
- ❌ Server overhead
- ✅ Works everywhere

**Server-Sent Events (SSE)**
- ✅ Simple to implement
- ❌ One-way only
- ❌ Connection limits

**WebSockets**
- ✅ Bidirectional
- ✅ Low latency
- ✅ Full-duplex
- ❌ More complex

**Decision**: WebSockets for real-time, SSE for notifications

## Architecture

### Components

1. **WebSocket Gateway**: Socket.io server
2. **Message Broker**: Redis for pub/sub
3. **Presence Service**: Track online users
4. **State Sync**: CRDT for conflict resolution

### Infrastructure

\`\`\`
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│   LB     │────▶│  WS      │
│          │◀────│          │◀────│  Server  │
└──────────┘     └──────────┘     └──────────┘
                                        │
                                        ▼
                                   ┌─────────┐
                                   │  Redis  │
                                   │ Pub/Sub │
                                   └─────────┘
\`\`\`

## Implementation

### Socket.io Server

\`\`\`javascript
const io = require('socket.io')(server, {
  cors: { origin: '*' },
  transports: ['websocket', 'polling']
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join room
  socket.on('join', async ({ roomId, userId }) => {
    await socket.join(roomId);

    // Broadcast presence
    io.to(roomId).emit('user:joined', {
      userId,
      socketId: socket.id
    });

    // Track in Redis
    await redis.sadd(\`room:\${roomId}:users\`, userId);
  });

  // Handle cursor movement
  socket.on('cursor:move', ({ roomId, position }) => {
    socket.to(roomId).emit('cursor:update', {
      userId: socket.userId,
      position
    });
  });

  // Handle disconnect
  socket.on('disconnect', async () => {
    const rooms = Array.from(socket.rooms);

    for (const roomId of rooms) {
      io.to(roomId).emit('user:left', {
        userId: socket.userId
      });

      await redis.srem(
        \`room:\${roomId}:users\`,
        socket.userId
      );
    }
  });
});
\`\`\`

### Client Implementation

\`\`\`typescript
import io from 'socket.io-client';

class RealtimeClient {
  private socket: Socket;

  constructor(url: string) {
    this.socket = io(url, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('user:joined', (data) => {
      this.handleUserJoined(data);
    });
  }

  joinRoom(roomId: string, userId: string) {
    this.socket.emit('join', { roomId, userId });
  }

  sendCursorPosition(roomId: string, position: Position) {
    this.socket.emit('cursor:move', {
      roomId,
      position
    });
  }
}
\`\`\`

## Scaling Strategy

### Horizontal Scaling

Used Redis adapter for Socket.io:

\`\`\`javascript
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

const pubClient = createClient({ url: REDIS_URL });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
\`\`\`

### Load Balancing

- Sticky sessions based on user ID
- Health checks for WS servers
- Graceful shutdown handling

## Conflict Resolution

### CRDT Implementation

Used Yjs for collaborative editing:

\`\`\`javascript
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

const doc = new Y.Doc();
const wsProvider = new WebsocketProvider(
  'ws://localhost:1234',
  'room-name',
  doc
);

const text = doc.getText('shared-text');

// Collaborative editing
text.observe(event => {
  console.log('Text changed:', event.changes);
});
\`\`\`

## Performance Optimizations

### 1. Message Batching

Batch rapid cursor movements:

\`\`\`javascript
const throttledCursorUpdate = throttle((position) => {
  socket.emit('cursor:move', position);
}, 50);
\`\`\`

### 2. Selective Broadcasting

Only send updates to affected users:

\`\`\`javascript
socket.on('edit', ({ roomId, change, affectedUsers }) => {
  affectedUsers.forEach(userId => {
    io.to(\`user:\${userId}\`).emit('change', change);
  });
});
\`\`\`

### 3. Connection Pooling

Reuse WebSocket connections across tabs.

## Monitoring

### Metrics Tracked

- Active connections
- Message throughput
- Latency (p50, p95, p99)
- Error rates
- Memory usage

### Alerting

- Connection drops > 5%
- Message latency > 100ms
- Memory usage > 80%

## Results

### Performance

- **Latency**: Average 15ms
- **Throughput**: 10,000 messages/second
- **Concurrent Users**: 50,000+
- **Uptime**: 99.9%

### User Experience

- Seamless collaboration
- Instant updates
- Smooth cursor tracking
- Reliable presence

## Challenges & Solutions

### 1. Connection Drops

**Problem**: Users losing connection frequently
**Solution**: Implemented automatic reconnection with exponential backoff

### 2. Message Ordering

**Problem**: Out-of-order messages
**Solution**: Added sequence numbers and reordering buffer

### 3. Memory Leaks

**Problem**: Server memory growing over time
**Solution**: Proper event listener cleanup and room management

## Lessons Learned

1. **Plan for scale from day one**: Easier than retrofitting
2. **Monitor everything**: Real-time systems are complex
3. **Handle edge cases**: Network issues, reconnections, conflicts
4. **Test thoroughly**: Use socket.io-client for automated tests
5. **Document behavior**: Real-time features need clear specs

## Future Improvements

- [ ] Implement message persistence
- [ ] Add end-to-end encryption
- [ ] Improve conflict resolution
- [ ] Add video/audio calls
- [ ] Implement operational transforms

## Conclusion

Building real-time features is challenging but incredibly rewarding. The key is:
- Choose the right technology
- Plan for scale
- Monitor continuously
- Handle failures gracefully

Our users love the collaborative features, and it's become a key differentiator for our product.
"""
    }
]


def create_markdown_file(section: str, data: dict) -> str:
    """Create markdown file content with frontmatter"""
    frontmatter = "---\n"
    for key, value in data.items():
        if key == "content":
            continue
        if isinstance(value, list):
            frontmatter += f"{key}:\n"
            for item in value:
                frontmatter += f"  - {item}\n"
        else:
            frontmatter += f"{key}: {value}\n"
    frontmatter += "---\n\n"

    return frontmatter + data.get("content", "")


def populate_database():
    """Populate database with sample data"""
    session = SessionLocal()

    try:
        print("🚀 Starting database population...\n")

        # Create media directories if they don't exist
        media_base = "/app/media/markdown" if os.path.exists("/app") else "./backend/media/markdown"
        for section in ["blog", "project", "case-study"]:
            os.makedirs(f"{media_base}/{section}", exist_ok=True)

        # Clear existing data
        print("🗑️  Clearing existing sample data...")
        session.query(ContentFile).delete()
        session.commit()

        created_count = 0

        # Populate Blog Posts
        print("\n📝 Creating blog posts...")
        for i, post in enumerate(BLOG_POSTS, 1):
            # Create markdown file
            filename = f"{post['slug']}.md"
            file_path = f"markdown/blog/{filename}"
            full_path = f"{media_base}/blog/{filename}"

            with open(full_path, 'w') as f:
                f.write(create_markdown_file('blog', post))

            # Create database record
            published_at = datetime.now() - timedelta(days=random.randint(1, 90))

            content_file = ContentFile(
                id=uuid.uuid4(),
                section="blog",
                filename=filename,
                file_path=file_path,
                metajson={
                    "slug": post["slug"],
                    "title": post["title"],
                    "summary": post["summary"],
                    "category": post["category"],
                    "tags": post["tags"],
                    "readTime": post["readTime"]
                },
                is_published=True,
                published_at=published_at,
                created_at=published_at,
                updated_at=published_at
            )

            session.add(content_file)
            created_count += 1
            print(f"  ✓ {i}. {post['title']}")

        # Populate Projects
        print("\n🚀 Creating projects...")
        for i, project in enumerate(PROJECTS, 1):
            # Create markdown file
            filename = f"{project['slug']}.md"
            file_path = f"markdown/project/{filename}"
            full_path = f"{media_base}/project/{filename}"

            with open(full_path, 'w') as f:
                f.write(create_markdown_file('project', project))

            # Create database record
            published_at = datetime.now() - timedelta(days=random.randint(1, 60))

            metajson = {
                "slug": project["slug"],
                "title": project["title"],
                "summary": project["summary"],
                "techStack": project["techStack"]
            }

            if "deployedUrl" in project:
                metajson["deployedUrl"] = project["deployedUrl"]
            if "codebaseUrl" in project:
                metajson["codebaseUrl"] = project["codebaseUrl"]

            content_file = ContentFile(
                id=uuid.uuid4(),
                section="project",
                filename=filename,
                file_path=file_path,
                metajson=metajson,
                is_published=True,
                published_at=published_at,
                created_at=published_at,
                updated_at=published_at
            )

            session.add(content_file)
            created_count += 1
            print(f"  ✓ {i}. {project['title']}")

        # Populate Case Studies
        print("\n📊 Creating case studies...")
        for i, case_study in enumerate(CASE_STUDIES, 1):
            # Create markdown file
            filename = f"{case_study['slug']}.md"
            file_path = f"markdown/case-study/{filename}"
            full_path = f"{media_base}/case-study/{filename}"

            with open(full_path, 'w') as f:
                f.write(create_markdown_file('case-study', case_study))

            # Create database record
            published_at = datetime.now() - timedelta(days=random.randint(1, 120))

            content_file = ContentFile(
                id=uuid.uuid4(),
                section="case-study",
                filename=filename,
                file_path=file_path,
                metajson={
                    "slug": case_study["slug"],
                    "title": case_study["title"],
                    "summary": case_study["summary"],
                    "category": case_study["category"],
                    "tags": case_study["tags"]
                },
                is_published=True,
                published_at=published_at,
                created_at=published_at,
                updated_at=published_at
            )

            session.add(content_file)
            created_count += 1
            print(f"  ✓ {i}. {case_study['title']}")

        # Commit all changes
        session.commit()

        print(f"\n✅ Successfully created {created_count} items!")
        print(f"   - {len(BLOG_POSTS)} blog posts")
        print(f"   - {len(PROJECTS)} projects")
        print(f"   - {len(CASE_STUDIES)} case studies")
        print("\n🎉 Database population complete!")

    except Exception as e:
        session.rollback()
        print(f"\n❌ Error: {e}")
        raise
    finally:
        session.close()


if __name__ == "__main__":
    populate_database()
