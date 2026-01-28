# Home Page Content Guide

Edit home page content in `/frontend/src/content/home.ts`

## Structure

### Hero Section
```typescript
export const heroContent = {
  title: {
    primary: "Energy meets Evolution",  // Gradient text
    secondary: "in every line of code"
  },
  subtitle: "Your tagline",
  cta: [
    { text: "Read Blog", link: "/blog" },
    { text: "View Projects", link: "/projects" }
  ]
}
```

### Featured Sections
```typescript
{
  slug: "blog",
  title: "Blog",
  subtitle: "Your subtitle",
  features: [  // Exactly 2 cards
    {
      title: "Feature Title",
      description: "Description (2-3 sentences)",
      icon: "pen" | "code" | "search"
    }
  ],
  ctaText: "Read Articles",
  ctaLink: "/blog"
}
```

## Available Icons
- `pen` - Writing/documentation
- `code` - Coding/development
- `search` - Research/analysis

## Making Changes
1. Edit `/frontend/src/content/home.ts`
2. Save (hot-reload in dev mode)
3. Rebuild for production: `docker compose build frontend`
