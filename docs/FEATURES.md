# Features

Content management system with FastAPI backend, Next.js frontend, and PostgreSQL database.

## Content Types
- **Blog**: Articles with categories, tags, read time
- **Projects**: Tech stack, demo/code links
- **Case Studies**: Problem-solving analysis

## Markdown Support
- Headers, code blocks with syntax highlighting
- Lists, links, images, tables, blockquotes
- Frontmatter metadata (YAML)

## Admin System
- JWT authentication with bcrypt hashing
- Upload markdown files
- Publish/unpublish toggle
- Delete content

## API Endpoints
- `GET /api/v1/content/{section}` - List content
- `GET /api/v1/content/{section}/{slug}` - Get content
- `POST /api/v1/content/upload` - Upload (admin)
- `PATCH /api/v1/content/{id}` - Update (admin)
- `DELETE /api/v1/content/{id}` - Delete (admin)
- `POST /api/v1/content/{content_id}/images` - Upload images (admin)

## Image Support
- Upload multiple images per content
- Stored in `markdown/{section}/{folder}/images/`
- Reference in markdown: `![alt](./images/filename.png)`
- StaticFiles serving at `/media/` for development

## Database
- PostgreSQL with JSONB metadata
- GIN indexes for fast queries
- Section + filename unique constraint

## Security
- Password hashing (bcrypt)
- JWT tokens (7-day expiry)
- Role-based access control
- CORS configuration
