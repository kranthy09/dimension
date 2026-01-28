# Content Upload Guide

## Quick Start

1. Visit http://localhost:3000/admin/upload
2. Select section (blog/project/case-study)
3. Upload `.md` file
4. Upload images (optional)
5. Publish when ready

## Frontmatter Format

**Blog:**
```yaml
---
slug: my-post-slug
title: "Post Title"
summary: "Brief description"
category: "Technology"
tags: ["Python", "Tutorial"]
readTime: "5 min"
---
```

**Project:**
```yaml
---
slug: my-project
title: "Project Name"
summary: "What it does"
techStack: ["React", "Node.js"]
deployedUrl: "https://example.com"
codebaseUrl: "https://github.com/user/repo"
---
```

**Case Study:**
```yaml
---
slug: my-study
title: "Study Title"
summary: "Brief description"
category: "Performance"
tags: ["Optimization"]
---
```

## Image Upload

1. Upload markdown first
2. Click "Upload Images"
3. Select multiple images
4. Reference in markdown: `![alt](./images/filename.png)`

Images stored in: `markdown/{section}/{blog_folder}/images/`

## Common YAML Errors

**Problem:** Title contains colon
```yaml
# ❌ WRONG
title: Building APIs: A Guide

# ✅ CORRECT
title: "Building APIs: A Guide"
```

**Problem:** Invalid array
```yaml
# ❌ WRONG
tags: Python, Tutorial

# ✅ CORRECT
tags: ["Python", "Tutorial"]
```

**Always quote strings with:** `:` `#` `@` `*` `&` `!` `%`

## Troubleshooting

- **"Only .md files"** - Check file extension
- **"Invalid YAML"** - Wrap values in quotes
- **"Missing fields"** - Ensure all required fields present
- **"Slug exists"** - Use unique slug
