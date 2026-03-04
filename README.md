# Dimension — Portfolio + DSA Tracker

A production-ready personal portfolio and developer dashboard built with
**FastAPI**, **Next.js 14**, and **PostgreSQL**.

Publish markdown content (blog, projects, case studies) through a self-hosted
admin panel, and track LeetCode progress in real time via a GitHub-synced
DSA Explorer — all running on a single VPS behind Nginx with SSL.

**Live:** [evolune.dev](https://evolune.dev)

**GitHub Synced Repo**: [engineering-excellence](https://github.com/kranthy09/engineering-excellence)

---

## What's Inside

| Surface                            | What It Does                                                                           |
| ---------------------------------- | -------------------------------------------------------------------------------------- |
| **Blog / Projects / Case Studies** | Markdown-first CMS with admin upload, publish/unpublish, image management              |
| **DSA Explorer**                   | GitHub-synced LeetCode tracker with heatmap, weekly performance chart, and file viewer |
| **Admin Panel**                    | JWT-authenticated upload interface at `/admin`                                         |
| **REST API**                       | 15 endpoints across auth, content, and GitHub routes                                   |
| **Infrastructure**                 | Docker Compose (dev + prod), Nginx reverse proxy, Let's Encrypt SSL                    |

---

## How This Was Built — Feature Coding with Claude Code

This project was developed using **Feature Coding** — an incremental, AI-assisted
approach where each feature is planned, reviewed, and implemented using
[Claude Code](https://claude.ai/code) as the coding agent.

**The workflow:**

```
1. Define feature intent clearly (user story + acceptance criteria)
2. Enter Plan Mode  →  Claude explores the codebase and proposes an approach
3. Review the plan  →  approve or redirect before any code is written
4. Claude implements  →  targeted edits, no over-engineering
5. Review output  →  verify correctness and test locally
6. Document  →  update .claude_code/docs/ with the new behaviour
```

**Why this works well:**

- Planning before coding prevents wasted effort on wrong approaches
- Agent explores the codebase before touching files, so changes fit existing patterns
- Each feature is isolated and testable without disrupting working code
- Docs stay in sync with the code because they are updated as part of each feature cycle

**Canonical docs** (in `.claude_code/docs/`) are the source of truth for the agent:

| File           | Purpose                                         |
| -------------- | ----------------------------------------------- |
| `Context.md`   | Architecture, data flow, DB schema, env vars    |
| `Features.md`  | Full feature spec with API table, design system |
| `Request.md`   | Feature backlog and user stories                |
| `Checklist.md` | Pre-code rules, test checklist, known pitfalls  |

These are read at the start of every coding session to give the agent accurate,
up-to-date project context — preventing regressions and duplicated effort.

---

## Architecture

```
Browser
  │
  ├── Next.js 14 (App Router)          /frontend
  │     ├── /blog, /projects, /case-studies   Content pages
  │     ├── /dsa                              DSA dashboard + file viewer
  │     └── /admin                            Upload + publish UI
  │
  │  REST API  http(s)://domain/api/v1/*
  │
  ├── FastAPI (Python 3.11)            /backend
  │     ├── /auth          JWT login
  │     ├── /content       CMS CRUD + image upload
  │     └── /github        DSA sync, stats, webhooks
  │
  ├── PostgreSQL 15                    /db
  │     ├── content_files   (CMS, JSONB meta)
  │     ├── users           (auth)
  │     ├── dsa_problems    (unique file paths from GitHub)
  │     ├── dsa_daily_activity  (IST commit counts per day)
  │     ├── dsa_topic_stats     (folder aggregations)
  │     └── dsa_sync_state      (sync cursor)
  │
  └── Nginx                           /nginx
        SSL termination, reverse proxy, static media
```

**DSA sync pipeline:**

```
GitHub push
  → Webhook POST /api/v1/github/webhook  (HMAC-SHA256 validated)
  → Background incremental_sync()
      → fetch commits since last_synced_at (GitHub API)
      → upsert dsa_problems (unique by file path)
      → upsert dsa_daily_activity (per IST calendar day)
      → rebuild dsa_topic_stats
  → Dashboard reads purely from DB (zero GitHub calls on page load)
```

---

## Features

### Content Management System

- Upload `.md` files via web UI or `curl` → parsed, stored, rendered
- Three content sections: **Blog**, **Projects**, **Case Studies**
- YAML frontmatter drives all metadata (title, slug, tags, tech stack, …)
- Publish / unpublish without deleting
- Per-entry image upload, co-located with markdown
- JWT-authenticated admin panel (7-day tokens, bcrypt passwords)

### DSA Explorer

- **Activity Heatmap** — last 100 days of repo commit activity (IST),
  Monday-start weeks, real data only (no padding or fake minimums)
- **Weekly Performance Chart** — unique new problems solved per week,
  filtered to 4 / 8 / 12 weeks; SVG line chart with hover tooltips
- **Topics Table** — folder-level breakdown sorted by problem count
- **Recent Solutions** — last 10 updated files with difficulty and tags
- **File Viewer** — syntax-highlighted code with extracted metadata
- **Tree Sidebar** — full solutions/ tree, collapsible, searchable (Ctrl+K)
- Metric labels make the data clear: heatmap = "commits / day",
  chart = "problems solved / week" — no ambiguity for visitors

### Data Accuracy

The weekly chart queries `dsa_problems.first_seen_at` (one row per unique
file path) rather than `dsa_daily_activity.problems_modified` (which inflates
counts because it increments per-file-per-commit). Each problem is counted
exactly once regardless of how many times it was re-committed.

All date logic runs in **IST (UTC+5:30)** — commit timestamps, day boundaries,
week boundaries, streak calculation, and heatmap rendering all use the same
timezone anchor.

---

## Tech Stack

**Backend**

- Python 3.11, FastAPI 0.109, Uvicorn
- SQLAlchemy 2.0 (ORM), Alembic (migrations)
- PostgreSQL 15 (JSONB indexes, TIMESTAMPTZ)
- httpx (async GitHub API client), python-frontmatter
- python-jose + bcrypt (JWT + password hashing)

**Frontend**

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- react-markdown + react-syntax-highlighter + remark-gfm + rehype-katex
- Zustand (responsive state), pure SVG (charts — no chart library)

**Infrastructure**

- Docker Compose (local dev: 3 services, production: 4 with Nginx)
- Nginx with Let's Encrypt SSL, Docker embedded DNS resolver
- GitHub webhook for automatic DSA sync on push

---

## Local Development

**Prerequisites:** Docker + Docker Compose

```bash
git clone <repo> && cd dimension

# 1. Environment variables
cp .env.example .env
# Edit .env — set GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME,
#              GITHUB_WEBHOOK_SECRET, SECRET_KEY

# 2. Start all services
docker compose up -d

# 3. Run migrations
docker compose exec backend alembic upgrade head

# 4. Create admin user
docker compose exec backend python3 scripts/create_admin.py \
  --email admin@local.dev --password admin123 --name "Admin"
```

**Access:**

| URL                                 | What                 |
| ----------------------------------- | -------------------- |
| `http://localhost:3000`             | Frontend             |
| `http://localhost:3000/admin/login` | Admin panel          |
| `http://localhost:8000/docs`        | Interactive API docs |
| `http://localhost:3000/dsa`         | DSA dashboard        |

**First DSA sync:**

```bash
# Initial full sync (fetches all files + last 6 months of commits)
curl -X POST http://localhost:8000/api/v1/github/dsa/sync/full

# Subsequent incremental syncs happen automatically via webhook,
# or trigger manually:
curl -X POST http://localhost:8000/api/v1/github/dsa/sync
```

---

## Production Deployment

Hosted on a single VPS (Ubuntu) using `docker-compose.prod.yml`.

```bash
ssh evolune
su - devuser
cd /path/to/dimension

# Standard deploy (pull + rebuild changed images + restart)
./deploy-vps.sh

# Force full rebuild
./deploy-vps.sh --force-rebuild
```

The deploy script:

1. Pulls latest code
2. Rebuilds Docker images
3. Brings services up
4. Restarts Nginx last (ensures upstream DNS resolves correctly)

**First-time production setup:**

```bash
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head

docker compose -f docker-compose.prod.yml exec backend \
  python3 scripts/create_admin.py \
  --email admin@domain.com --password SecurePass --name "Admin"
```

---

## Capacity & Scalability

### Current setup (single VPS, Docker Compose)

| Metric              | Estimate                                   |
| ------------------- | ------------------------------------------ |
| Concurrent visitors | ~200–500 comfortably                       |
| API response time   | < 50 ms (indexed DB queries)               |
| DSA dashboard load  | < 100 ms (single DB read, no GitHub calls) |
| Content reads       | Thousands/day with no tuning               |
| Sync throughput     | ~6 months of commits in a single full sync |

The GitHub API in-memory cache (1-hour TTL) prevents rate-limiting on the
file tree endpoint. DSA stats are served entirely from PostgreSQL with no
upstream API calls on page load.

### How to scale further

| Bottleneck             | Solution                                                |
| ---------------------- | ------------------------------------------------------- |
| Static assets + images | Add Cloudflare CDN in front of Nginx                    |
| API throughput         | Add Redis cache for `GET /dsa/stats` (low-churn data)   |
| DB read load           | Add a PostgreSQL read replica; route GET queries to it  |
| Concurrent connections | Increase `uvicorn --workers` count (CPU × 2 + 1)        |
| Storage for media      | Migrate `/backend/media` volume to S3 / Cloudflare R2   |
| Multi-region           | Containerise with Kubernetes; deploy to managed cluster |

The current architecture hits no fundamental ceiling until ~2,000–5,000
concurrent users. At that scale, the migration path is:
Redis → read replica → CDN → Kubernetes — each step is independently deployable.

---

## Project Structure

```
dimension/
├── backend/
│   ├── app/
│   │   ├── models/           SQLAlchemy models (content, users, DSA tables)
│   │   ├── schemas/          Pydantic request / response shapes
│   │   ├── services/
│   │   │   ├── content_service.py      CMS CRUD + file storage
│   │   │   ├── dsa_sync_service.py     GitHub→DB sync + get_stats()
│   │   │   └── github_service.py       GitHub API client + 1-hour cache
│   │   ├── api/routes/       auth.py, content.py, github.py
│   │   └── core/             security.py, dependencies.py, exceptions.py
│   ├── alembic/versions/     4 sequential migrations
│   ├── scripts/create_admin.py
│   └── requirements.txt
│
├── frontend/src/
│   ├── app/
│   │   ├── dsa/
│   │   │   ├── page.tsx              Dashboard (stats, heatmap, chart)
│   │   │   ├── layout.tsx            Sidebar + search
│   │   │   ├── [problemId]/page.tsx  Solution viewer
│   │   │   └── components/
│   │   │       ├── ActivityHeatmap.tsx   100-day commit heatmap
│   │   │       ├── StatCards.tsx         Metrics + WeeklyChart SVG
│   │   │       ├── TopicsTable.tsx
│   │   │       └── RecentFiles.tsx
│   │   ├── blog/, projects/, case-studies/
│   │   └── admin/
│   ├── lib/github.ts         fetchStats(), DsaStats type, buildTree()
│   └── content/home.ts       Static hero + featured section copy
│
├── .claude_code/docs/        Agent context docs (Context, Features, Request, Checklist)
├── nginx/                    nginx.conf with SSL + dynamic DNS resolver
├── docker-compose.yml        Local dev (db → backend → frontend)
├── docker-compose.prod.yml   Production (+ nginx)
└── deploy-vps.sh
```

---

## API Reference (summary)

Full interactive docs at `/api/v1/docs` when running locally.

| Method | Route                              | Auth  | Purpose                        |
| ------ | ---------------------------------- | ----- | ------------------------------ |
| POST   | `/api/v1/auth/login`               | —     | Get JWT token                  |
| GET    | `/api/v1/content/{section}`        | —     | List published content         |
| GET    | `/api/v1/content/{section}/{slug}` | —     | Get single content + markdown  |
| POST   | `/api/v1/content/upload`           | Admin | Upload markdown file           |
| PATCH  | `/api/v1/content/{id}`             | Admin | Toggle publish / update        |
| DELETE | `/api/v1/content/{id}`             | Admin | Delete                         |
| POST   | `/api/v1/content/{id}/images`      | Admin | Attach images                  |
| GET    | `/api/v1/github/dsa/stats`         | —     | Full dashboard stats (DB only) |
| GET    | `/api/v1/github/dsa/tree`          | —     | Repo file tree (1-hour cache)  |
| GET    | `/api/v1/github/dsa/file/{path}`   | —     | Solution code + metadata       |
| POST   | `/api/v1/github/dsa/sync`          | —     | Incremental sync               |
| POST   | `/api/v1/github/dsa/sync/full`     | —     | Full re-sync                   |
| POST   | `/api/v1/github/webhook`           | HMAC  | Auto-sync on GitHub push       |

---

## Next Steps

### In Progress / Near-term

- [ ] **Home page quick-glimpse panel** — hero section that surfaces DSA
      stats (total solved, streak, last problem) and a blog post preview card
      so first-time visitors immediately see active work without navigating away

- [ ] **SEO + meta tags** — Open Graph images, `<meta>` descriptions,
      JSON-LD structured data for blog posts and projects

- [ ] **RSS feed** — `GET /api/v1/content/blog/feed.xml` for readers and
      aggregators

- [ ] **Full-text search** — PostgreSQL `tsvector` index on `metajson` for
      searching titles, summaries, and tags across all content

- [ ] **Problem accepted / not-accepted status** — add a `status` field to
      `dsa_problems` (accepted | attempted | revisit) parsed from a comment
      annotation in solution files; filter heatmap and chart to accepted only

---

## Common Commands

```bash
# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Database access
docker compose exec db psql -U portfolio -d portfolio

# Backup database
docker compose exec db pg_dump -U portfolio portfolio > backup.sql

# Rebuild after dependency changes
docker compose build --no-cache backend

# Clear GitHub API cache (after repo restructure)
curl -X POST http://localhost:8000/api/v1/github/dsa/cache/clear
```

---

## Environment Variables

```bash
# Database
POSTGRES_USER=portfolio
POSTGRES_PASSWORD=your_db_password
POSTGRES_DB=portfolio

# Security — change SECRET_KEY in production
SECRET_KEY=your-256-bit-random-key

# GitHub integration
GITHUB_TOKEN=ghp_...
GITHUB_REPO_OWNER=your-username
GITHUB_REPO_NAME=dsa-solutions
GITHUB_WEBHOOK_SECRET=your-webhook-secret

# Production only
FASTAPI_CONFIG=production
CORS_ORIGINS=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com/api/v1
```

---

## Contributing

The project is personal but the architecture is reusable.
Fork it, replace `content/home.ts`, point `GITHUB_REPO_*` at your own
solutions repository, run `./deploy-vps.sh`, and you have your own instance.

Feature ideas and bug reports welcome via GitHub Issues.

---

_Built incrementally with [Claude Code](https://claude.ai/code) — Energy meets Evolution._
