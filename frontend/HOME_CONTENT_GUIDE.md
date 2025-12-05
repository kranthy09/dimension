# Home Page Content Guide

This guide explains how to modify the content displayed on your portfolio home page.

## Content Configuration File

All home page content is stored in: **`/frontend/src/content/home.ts`**

This file contains:
- Hero section text and CTAs
- Section descriptions for Blog, Projects, and Case Studies
- Feature cards for each section

## Structure

### Hero Section

```typescript
export const heroContent = {
  title: {
    primary: "Energy meets Evolution",  // Gradient animated text
    secondary: "in every line of code"   // Plain text
  },
  subtitle: "Your tagline here...",
  cta: [
    { text: "Read Blog", link: "/blog" },
    { text: "View Projects", link: "/projects" },
    { text: "Case Studies", link: "/case-studies" }
  ]
}
```

### Featured Sections

Each section (Blog, Projects, Case Studies) has:

```typescript
{
  slug: "blog",                    // Section identifier
  title: "Blog",                   // Section heading
  subtitle: "Your subtitle",       // Below the title
  features: [                      // Exactly 2 feature cards
    {
      title: "Feature Title",
      description: "Feature description...",
      icon: "pen" | "code" | "search"  // Choose one
    },
    {
      title: "Another Feature",
      description: "Another description...",
      icon: "pen" | "code" | "search"
    }
  ],
  ctaText: "Read Articles",        // Button text
  ctaLink: "/blog"                 // Button link
}
```

## Available Icons

- **`pen`** - Writing/documentation icon
- **`code`** - Coding/development icon
- **`search`** - Research/analysis icon

## How to Modify

1. Open `/frontend/src/content/home.ts`
2. Edit the text content while maintaining the structure
3. Save the file
4. In development mode, Next.js will hot-reload automatically
5. Check your changes at `http://localhost:3000`

## Tips

- Keep feature descriptions concise but meaningful (2-3 sentences)
- Use the subtitle to express your philosophy for each section
- Feature cards explain **why** you do what you do
- Choose icons that match the message of each feature

## Example Modifications

### Changing Blog Section

```typescript
{
  slug: "blog",
  title: "Blog",
  subtitle: "Sharing knowledge through words",
  features: [
    {
      title: "Learn in Public",
      description: "I document my learning journey, sharing both successes and failures. Every post is a stepping stone in my growth as a developer.",
      icon: "pen"
    },
    {
      title: "Teach to Learn",
      description: "Writing forces me to truly understand concepts. By teaching others, I solidify my own knowledge and contribute to the community.",
      icon: "search"
    }
  ],
  ctaText: "Read My Blog",
  ctaLink: "/blog"
}
```

### Changing Hero

```typescript
export const heroContent = {
  title: {
    primary: "Building the Future",
    secondary: "one commit at a time"
  },
  subtitle: "Full-stack developer passionate about creating elegant solutions to complex problems.",
  cta: [
    { text: "Explore Blog", link: "/blog" },
    { text: "See Projects", link: "/projects" }
  ]
}
```

## Production Build

After making changes:

```bash
# Rebuild frontend container
docker compose build frontend

# Restart services
docker compose up -d
```

## Components

The home page uses these modular components:

- **`Hero.tsx`** - Hero section with animated background
- **`FeaturedSection.tsx`** - Section wrapper with scroll animations
- **`FeatureCard.tsx`** - Individual feature cards with hover effects

All components support dark/light themes automatically.
