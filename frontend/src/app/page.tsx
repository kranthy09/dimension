import { Hero } from '@/components/home/Hero'
import { FeaturedSection } from '@/components/home/FeaturedSection'
import { sectionsContent } from '@/content/home'

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <Hero />

      {/* Featured Sections - Blog, Projects, Case Studies */}
      {sectionsContent.map((section, index) => (
        <FeaturedSection
          key={section.slug}
          section={section}
          reversed={index % 2 === 1}
        />
      ))}
    </main>
  )
}
