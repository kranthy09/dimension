# Content Upload Guide

Complete guide for creating and uploading markdown content to your portfolio.

---

## Quick Start

### 1. Create a Template

```bash
# Generate a blog post template
python scripts/create_template.py blog my-post.md

# Generate a project template
python scripts/create_template.py project my-project.md

# Generate a case study template
python scripts/create_template.py case-study my-study.md
```

### 2. Edit Your Content

Open the generated `.md` file and fill in your content.

### 3. Upload

- Visit http://localhost:3000/admin/upload
- Select section (blog/project/case-study)
- Upload your `.md` file
- Publish when ready

---

## Frontmatter Format

All markdown files must have YAML frontmatter at the top, enclosed by `---`.

### Blog Post Frontmatter

```yaml
---
slug: my-blog-post-slug
title: "My Blog Post Title"
summary: "A brief summary of the post"
category: "Technology"
tags: ["Python", "Tutorial", "Web Development"]
readTime: "5 min"
---
```

**Required fields:**
- `slug` - URL-friendly identifier (lowercase, hyphens only)
- `title` - Post title (wrap in quotes if it contains colons)
- `summary` - Brief description
- `category` - Post category

**Optional fields:**
- `tags` - Array of tags
- `readTime` - Estimated reading time

### Project Frontmatter

```yaml
---
slug: my-project-slug
title: "My Awesome Project"
summary: "What this project does"
techStack: ["React", "Node.js", "PostgreSQL"]
deployedUrl: "https://my-project.com"
codebaseUrl: "https://github.com/username/project"
---
```

**Required fields:**
- `slug` - URL-friendly identifier
- `title` - Project name
- `summary` - Brief description
- `techStack` - Array of technologies used

**Optional fields:**
- `deployedUrl` - Live demo URL
- `codebaseUrl` - Source code URL

### Case Study Frontmatter

```yaml
---
slug: my-case-study-slug
title: "My Case Study: Problem Solved"
summary: "How we achieved X result"
category: "Performance"
tags: ["Optimization", "Best Practices"]
---
```

**Required fields:**
- `slug` - URL-friendly identifier
- `title` - Case study title
- `summary` - Brief description
- `category` - Study category

**Optional fields:**
- `tags` - Array of tags

---

## Common YAML Errors & Fixes

### Error: "mapping values are not allowed in this context"

**Problem:** Title or other field contains a colon without quotes

```yaml
# ❌ WRONG
title: Building APIs: A Complete Guide

# ✅ CORRECT
title: "Building APIs: A Complete Guide"
```

**Fix:** Wrap the entire value in double quotes.

### Error: Invalid list syntax

**Problem:** Array format is incorrect

```yaml
# ❌ WRONG
tags: Python, Tutorial, Web

# ✅ CORRECT (Option 1: Inline)
tags: ["Python", "Tutorial", "Web"]

# ✅ CORRECT (Option 2: Multi-line)
tags:
  - Python
  - Tutorial
  - Web
```

### Error: Special characters not escaped

**Problem:** Value contains YAML special characters

```yaml
# ❌ WRONG
summary: Learn to use @decorators & *args in Python

# ✅ CORRECT
summary: "Learn to use @decorators & *args in Python"
```

**YAML special characters that require quoting:**
- `:` (colon)
- `#` (hash)
- `@` (at sign)
- `*` (asterisk)
- `&` (ampersand)
- `!` (exclamation)
- `%` (percent)
- `{` `}` (braces)
- `[` `]` (brackets)
- `,` (comma)
- `>` `|` (greater/pipe)

**Best practice:** Always use double quotes for string values.

---

## Automated Frontmatter Fixer

If you have existing markdown files with frontmatter issues, use the auto-fixer:

```bash
# Fix a single file
python scripts/fix_frontmatter.py my-post.md

# Fix all files in a directory
python scripts/fix_frontmatter.py backend/media/markdown/blog/
```

The fixer will:
- Auto-quote values containing colons
- Fix array syntax
- Add quotes for special characters
- Preserve your content

---

## Content Upload Process

### Via Admin UI (Recommended)

1. **Login to admin**
   - Visit http://localhost:3000/admin/upload
   - Login with admin credentials

2. **Select section**
   - Choose: blog, project, or case-study

3. **Upload file**
   - Click "Choose File"
   - Select your `.md` file
   - Click "Upload"

4. **Review**
   - Check that all fields parsed correctly
   - Preview the content

5. **Publish**
   - Toggle "Published" status
   - Content will appear on the site

### Via API

```bash
# Get authentication token first
TOKEN="your-jwt-token"

# Upload blog post
curl -X POST "http://localhost:8000/api/v1/content/upload?section=blog" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@my-post.md"

# Upload project
curl -X POST "http://localhost:8000/api/v1/content/upload?section=project" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@my-project.md"

# Upload case study
curl -X POST "http://localhost:8000/api/v1/content/upload?section=case-study" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@my-study.md"
```

---

## Troubleshooting Upload Errors

### "Only .md files allowed"

**Solution:** Ensure your file has a `.md` extension.

```bash
# Rename file if needed
mv mypost.txt mypost.md
```

### "Invalid YAML syntax in frontmatter"

**Solution:** Check the error message for the line and column number. Common fixes:

1. Wrap values in quotes
2. Check for missing closing quotes
3. Ensure proper array syntax
4. Validate YAML at https://www.yamllint.com/

### "Missing required fields"

**Solution:** Ensure all required fields are present for your section type.

**Blog requires:**
- slug, title, summary, category

**Project requires:**
- slug, title, summary, techStack

**Case study requires:**
- slug, title, summary, category

### "Content with slug 'X' already exists"

**Solution:** Change the slug to a unique value or delete the existing content first.

### Validation Tips

**Before uploading, check:**

1. ✅ File has `.md` extension
2. ✅ Frontmatter starts and ends with `---`
3. ✅ All required fields are present
4. ✅ Slug is unique (lowercase, hyphens only)
5. ✅ Values with special characters are quoted
6. ✅ Arrays use proper syntax

---

## Testing Your Content Locally

### Preview Frontmatter

```bash
# View parsed frontmatter
python scripts/validate_frontmatter.py my-post.md
```

### Check Content in Database

```bash
# List all content
./scripts/check_sample_data.sh

# Query specific section
docker-compose exec -T backend python -c "
from app.database import SessionLocal
from app.models.content_file import ContentFile

db = SessionLocal()
items = db.query(ContentFile).filter_by(section='blog').all()
for item in items:
    print(f'{item.metajson[\"title\"]} - {item.metajson[\"slug\"]}')
db.close()
"
```

### View on Frontend

```bash
# Blog posts
http://localhost:3000/blog

# Projects
http://localhost:3000/projects

# Case studies
http://localhost:3000/case-studies

# Individual item (replace {slug} with actual slug)
http://localhost:3000/blog/{slug}
http://localhost:3000/projects/{slug}
http://localhost:3000/case-studies/{slug}
```

---

## Best Practices

### 1. Slug Naming

**Good slugs:**
- `building-rest-apis`
- `react-state-management`
- `python-async-await`

**Bad slugs:**
- `Building REST APIs` (has spaces and capitals)
- `react_state_management` (use hyphens, not underscores)
- `api's-guide` (avoid apostrophes)

### 2. Title Formatting

```yaml
# ✅ GOOD
title: "Building REST APIs: A Complete Guide"
title: "How to Use Python's @decorator Syntax"
title: "React State Management in 2024"

# ❌ BAD
title: Building REST APIs: A Complete Guide  # Needs quotes (has colon)
title: How to Use Python's @decorator Syntax  # Needs quotes (has @)
```

### 3. Summary Guidelines

- Keep it under 160 characters (SEO friendly)
- Make it compelling and clear
- Don't duplicate the title
- Always use quotes

```yaml
# ✅ GOOD
summary: "Learn how to build scalable REST APIs using FastAPI, including authentication, database integration, and best practices."

# ❌ BAD
summary: "Building REST APIs"  # Too short, not descriptive
```

### 4. Tags

```yaml
# ✅ GOOD - Inline array with quotes
tags: ["Python", "FastAPI", "REST API", "Tutorial"]

# ✅ GOOD - Multi-line array
tags:
  - Python
  - FastAPI
  - REST API
  - Tutorial

# ❌ BAD - No quotes, commas separated
tags: [Python, FastAPI, REST API, Tutorial]
```

### 5. Tech Stack

```yaml
# ✅ GOOD
techStack: ["React", "Node.js", "PostgreSQL", "Docker", "AWS"]

# ❌ BAD - Inconsistent naming
techStack: ["react", "nodejs", "postgres", "Docker"]
```

---

## Content Examples

### Complete Blog Post Example

```markdown
---
slug: fastapi-authentication-guide
title: "FastAPI Authentication: Complete Guide with JWT"
summary: "Learn how to implement secure authentication in FastAPI using JWT tokens, including password hashing, token generation, and protected routes."
category: "Backend"
tags: ["Python", "FastAPI", "Authentication", "Security", "JWT"]
readTime: "15 min"
---

# FastAPI Authentication: Complete Guide with JWT

## Introduction

Authentication is a crucial part of any web application...

## Prerequisites

Before we begin, make sure you have:
- Python 3.9+
- FastAPI installed
- Basic understanding of REST APIs

## Implementation

### Step 1: Install Dependencies

\`\`\`bash
pip install fastapi[all] python-jose[cryptography] passlib[bcrypt]
\`\`\`

### Step 2: Password Hashing

... (rest of content)
```

### Complete Project Example

```markdown
---
slug: task-manager-app
title: "TaskFlow: Modern Task Management App"
summary: "A full-stack task management application with real-time updates, team collaboration, and smart prioritization features."
techStack: ["React", "TypeScript", "Node.js", "Express", "PostgreSQL", "Socket.io", "Docker"]
deployedUrl: "https://taskflow-demo.com"
codebaseUrl: "https://github.com/username/taskflow"
---

# TaskFlow: Modern Task Management App

## Overview

TaskFlow is a comprehensive task management solution designed for modern teams...

## Features

- ✅ Real-time task updates
- ✅ Team collaboration
- ✅ Smart prioritization
- ✅ Kanban boards
- ✅ Time tracking
- ✅ Reports and analytics

... (rest of content)
```

---

## Advanced Tips

### Using Environment Variables in Content

While markdown content is static, you can reference your deployed URLs:

```yaml
deployedUrl: "https://yourdomain.com"  # Update for production
codebaseUrl: "https://github.com/yourusername/repo"
```

### Content Organization

Organize your markdown files before uploading:

```
/content-drafts/
  /blog/
    - post-1.md
    - post-2.md
  /projects/
    - project-1.md
    - project-2.md
  /case-studies/
    - study-1.md
```

### Bulk Upload Script

For uploading multiple files at once, use the bulk upload script:

```bash
python scripts/bulk_upload.py blog content-drafts/blog/*.md
```

---

## Support

### Need Help?

1. Check error messages carefully - they include helpful hints
2. Use the auto-fixer: `python scripts/fix_frontmatter.py your-file.md`
3. Validate YAML at https://www.yamllint.com/
4. Check Docker logs: `docker-compose logs backend`

### Common Questions

**Q: Can I edit content after uploading?**
A: Yes, you can update metadata via the API or re-upload with the same slug.

**Q: How do I delete content?**
A: Use the DELETE endpoint or remove from admin panel (if implemented).

**Q: Can I use HTML in markdown?**
A: Yes, markdown supports inline HTML, but use it sparingly.

**Q: How do I add images?**
A: Upload images to `/backend/media/images/` and reference them in markdown:
```markdown
![Alt text](/media/images/my-image.png)
```

---

## Next Steps

1. Create your first template: `python scripts/create_template.py blog`
2. Edit the generated file with your content
3. Run the fixer to ensure valid YAML: `python scripts/fix_frontmatter.py your-file.md`
4. Upload via http://localhost:3000/admin/upload
5. Publish and view on your site!

Happy writing! ✍️
