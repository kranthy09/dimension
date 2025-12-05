/**
 * Home Page Content Configuration
 *
 * This file contains all editable content for the home page.
 * Modify the text, titles, and descriptions to customize your portfolio.
 */

export interface FeatureItem {
  title: string
  description: string
  icon: 'pen' | 'code' | 'search'
}

export interface SectionContent {
  slug: string
  title: string
  subtitle: string
  features: [FeatureItem, FeatureItem]
  ctaText: string
  ctaLink: string
}

export const heroContent = {
  title: {
    primary: "Energy meets Evolution",
    secondary: "in every line of code"
  },
  subtitle: "Exploring ideas through writing, building projects, and sharing insights from real-world problem solving.",
  cta: [
    { text: "Read Blog", link: "/blog" },
    { text: "View Projects", link: "/projects" },
    { text: "Case Studies", link: "/case-studies" }
  ]
}

export const sectionsContent: SectionContent[] = [
  {
    slug: "blog",
    title: "Blog",
    subtitle: "Writing to learn, learning to write",
    features: [
      {
        title: "Document the Journey",
        description: "I write to crystallize my thoughts and share knowledge. Every article is a reflection of challenges I've faced, solutions I've discovered, and lessons learned in the trenches of software development.",
        icon: "pen"
      },
      {
        title: "Break Down Complexity",
        description: "Complex topics deserve clear explanations. My blog breaks down intricate technical concepts into digestible pieces, making advanced development techniques accessible to everyone.",
        icon: "search"
      }
    ],
    ctaText: "Read Articles",
    ctaLink: "/blog"
  },
  {
    slug: "projects",
    title: "Projects",
    subtitle: "Building solutions that matter",
    features: [
      {
        title: "Solve Real Problems",
        description: "Each project starts with a problem worth solving. I build tools and applications that address genuine needs, focusing on user experience, performance, and maintainability.",
        icon: "code"
      },
      {
        title: "Modern Stack Mastery",
        description: "From React and TypeScript to Python and FastAPI, I leverage modern technologies to create robust, scalable applications. Every project is an opportunity to refine my craft.",
        icon: "code"
      }
    ],
    ctaText: "View Projects",
    ctaLink: "/projects"
  },
  {
    slug: "case-studies",
    title: "Case Studies",
    subtitle: "Deep dives into architectural decisions",
    features: [
      {
        title: "Learn from Experience",
        description: "Case studies allow me to dissect complex implementations, understand architectural tradeoffs, and extract transferable patterns. Each study is a masterclass in decision-making.",
        icon: "search"
      },
      {
        title: "Share the Process",
        description: "Beyond the final product, I document the why and how. These studies reveal the thought process behind technical decisions, helping others navigate similar challenges.",
        icon: "pen"
      }
    ],
    ctaText: "Explore Studies",
    ctaLink: "/case-studies"
  }
]

export const aboutContent = {
  title: "What I Create",
  subtitle: "From technical blog posts to full-stack projects, I build and share"
}
