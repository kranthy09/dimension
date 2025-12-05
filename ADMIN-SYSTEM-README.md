# Admin System Documentation

## Overview

The portfolio now includes a complete admin authentication and content management system. This allows you to securely manage all your blog posts, projects, and case studies through a protected admin dashboard.

## Features

✅ **JWT-based Authentication** - Secure token-based login system
✅ **Admin User Management** - Create admin users with hashed passwords
✅ **Protected API Routes** - Upload, update, and delete operations require admin authentication
✅ **Admin Dashboard** - Full-featured frontend interface for content management
✅ **Content Publishing** - Toggle publish/unpublish status for all content
✅ **File Upload** - Direct markdown file upload from the dashboard
✅ **Content Deletion** - Remove unwanted content with confirmation

## Architecture

### Backend (FastAPI)

**Authentication Layer:**
- `/backend/app/models/user.py` - User model with admin role
- `/backend/app/schemas/user.py` - Pydantic schemas for user data and tokens
- `/backend/app/core/security.py` - Password hashing and JWT token generation
- `/backend/app/core/dependencies.py` - Authentication middleware (`get_current_user`, `get_current_admin_user`)
- `/backend/app/api/routes/auth.py` - Login and user info endpoints

**Database:**
- Migration: `/backend/alembic/versions/002_create_users.py`
- Users table with email, hashed_password, is_admin, is_active fields

**Protected Routes:**
- `POST /api/v1/content/upload` - Requires admin authentication
- `PATCH /api/v1/content/{content_id}` - Requires admin authentication
- `DELETE /api/v1/content/{content_id}` - Requires admin authentication

### Frontend (Next.js)

**Admin Pages:**
- `/frontend/src/app/admin/login/page.tsx` - Login page
- `/frontend/src/app/admin/dashboard/page.tsx` - Content management dashboard

**Auth Utilities:**
- `/frontend/src/lib/auth.ts` - Authentication service with login, token storage, and user info

## Admin User Credentials

**Email:** `admin@portfolio.com`
**Password:** `admin123`

⚠️ **IMPORTANT:** Change this password in production!

## Usage Guide

### 1. Access Admin Dashboard

Navigate to: **http://localhost:3000/admin/login**

Login with the credentials above.

### 2. Upload New Content

1. Select the content type (Blog, Project, or Case Study)
2. Click "Choose File" and select a markdown file
3. The file will be automatically uploaded and parsed
4. Content will appear in the list below

### 3. Manage Existing Content

**Publish/Unpublish:**
- Click the "Publish" button to make content visible on the public site
- Click "Unpublish" to hide content without deleting it

**Delete Content:**
- Click the "Delete" button to permanently remove content
- Confirmation dialog will appear before deletion

### 4. View Published Site

Click "View Site" in the header to return to the public portfolio.

### 5. Logout

Click "Logout" in the header to end your session.

## API Endpoints

### Authentication

**Login**
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@portfolio.com",
  "password": "admin123"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Get Current User**
```bash
GET /api/v1/auth/me
Authorization: Bearer <access_token>

Response:
{
  "id": "cd15cf5e-cbdb-4d3b-9022-e35b12e73706",
  "email": "admin@portfolio.com",
  "full_name": "Admin User",
  "is_admin": true,
  "is_active": true,
  "created_at": "2025-12-01T10:45:43.123456Z",
  "last_login": "2025-12-01T10:45:43.123456Z"
}
```

### Content Management (Admin Only)

**Upload Content**
```bash
POST /api/v1/content/upload?section=blog
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

file: <markdown file>
```

**Update Content**
```bash
PATCH /api/v1/content/{content_id}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "is_published": true,
  "published_at": "2025-12-01T10:00:00Z"
}
```

**Delete Content**
```bash
DELETE /api/v1/content/{content_id}
Authorization: Bearer <access_token>
```

## Creating Additional Admin Users

To create a new admin user, run this command:

```bash
docker-compose exec backend python3 scripts/create_admin.py \
  --email newadmin@example.com \
  --password securepassword123 \
  --name "New Admin Name"
```

Or run interactively:

```bash
docker-compose exec backend python3 scripts/create_admin.py
```

## Security Features

1. **Password Hashing** - All passwords are hashed using bcrypt
2. **JWT Tokens** - Tokens expire after 7 days
3. **Admin-Only Routes** - Content modification requires admin role
4. **Active User Check** - Inactive users cannot access the system
5. **Token Validation** - All protected routes validate JWT tokens

## Token Storage

- Tokens are stored in `localStorage` with key `admin_token`
- Tokens are automatically included in API requests
- Logout clears the token from storage

## Design System Integration

The admin interface uses the same **Energy & Evolution** design system:
- Orange energy gradient for primary actions
- Terracotta sand color palette
- Dark/light theme support
- Smooth transitions and animations
- Professional, minimalistic UI

## File Structure

```
backend/
├── app/
│   ├── models/
│   │   └── user.py                 # User model
│   ├── schemas/
│   │   └── user.py                 # User schemas
│   ├── core/
│   │   ├── security.py             # Password hashing & JWT
│   │   └── dependencies.py         # Auth middleware
│   └── api/routes/
│       ├── auth.py                 # Auth endpoints
│       └── content.py              # Protected content routes
├── alembic/versions/
│   └── 002_create_users.py        # Users table migration
└── scripts/
    └── create_admin.py             # Admin creation script

frontend/
├── src/
│   ├── app/admin/
│   │   ├── login/
│   │   │   └── page.tsx           # Login page
│   │   └── dashboard/
│   │       └── page.tsx           # Admin dashboard
│   └── lib/
│       └── auth.ts                # Auth utilities
```

## Environment Variables

Add to `/backend/.env` for production:

```env
SECRET_KEY=your-very-secure-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080  # 7 days
```

## Troubleshooting

**Cannot login:**
- Verify credentials are correct
- Check backend logs: `docker-compose logs backend`
- Ensure database migration ran: `docker-compose exec backend alembic current`

**Upload fails:**
- Check you're logged in as admin
- Verify token hasn't expired
- Check file is valid markdown (.md extension)

**Dashboard not loading:**
- Clear browser localStorage
- Check browser console for errors
- Verify frontend is running: `docker-compose ps`

## Next Steps

1. **Change admin password** in production
2. **Set strong SECRET_KEY** in environment variables
3. **Enable HTTPS** for production deployment
4. **Add more admins** as needed
5. **Regular backups** of the database

---

**Admin Dashboard URL:** http://localhost:3000/admin/login
**API Documentation:** http://localhost:8000/docs
