'use client'

import { useEffect, useState, useRef } from 'react'

interface Heading {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  markdown: string
}

export function TableOfContents({ markdown }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const activeItemRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    // Extract headings from markdown
    const headingRegex = /^(#{1,3})\s+(.+)$/gm
    const matches: Heading[] = []
    let match

    while ((match = headingRegex.exec(markdown)) !== null) {
      const level = match[1].length
      const text = match[2].trim()
      // Create ID similar to how markdown renderers do it
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')

      matches.push({ id, text, level })
    }

    setHeadings(matches)
  }, [markdown])

  useEffect(() => {
    if (headings.length === 0) return

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      // Find all currently intersecting entries
      const intersectingEntries = entries.filter(entry => entry.isIntersecting)

      if (intersectingEntries.length > 0) {
        // Sort by position and take the topmost one
        const sorted = intersectingEntries.sort((a, b) => {
          return a.boundingClientRect.top - b.boundingClientRect.top
        })
        setActiveId(sorted[0].target.id)
      }
    }

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: '-100px 0px -66% 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1],
    })

    // Observe all heading elements
    const elements: Element[] = []
    headings.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
        elements.push(element)
      }
    })

    // Also track scroll to update active heading
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150

      for (let i = headings.length - 1; i >= 0; i--) {
        const element = document.getElementById(headings[i].id)
        if (element && element.offsetTop <= scrollPosition) {
          setActiveId(headings[i].id)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Set initial active heading

    return () => {
      elements.forEach((element) => {
        observer.unobserve(element)
      })
      window.removeEventListener('scroll', handleScroll)
    }
  }, [headings])

  // Auto-scroll the TOC to keep active item visible
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }, [activeId])

  if (headings.length === 0) {
    return null
  }

  const handleClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 80 // Account for fixed header
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
  }

  return (
    <nav className="sticky top-24 hidden xl:block">
      <div className="pb-4 mb-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          On this page
        </h3>
      </div>
      <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
        <ul className="space-y-1 text-sm">
          {headings.map(({ id, text, level }) => (
            <li
              key={id}
              style={{
                paddingLeft: `${(level - 1) * 0.75}rem`,
              }}
            >
              <button
                ref={activeId === id ? activeItemRef : null}
                onClick={() => handleClick(id)}
                className={`text-left w-full py-2 px-3 rounded-md transition-all duration-200 hover:bg-[var(--bg-secondary)] ${
                  activeId === id
                    ? 'font-semibold border-l-2'
                    : 'border-l-2 border-transparent'
                }`}
                style={{
                  color: activeId === id ? 'var(--energy-500)' : 'var(--text-muted)',
                  borderLeftColor: activeId === id ? 'var(--energy-500)' : 'transparent',
                  backgroundColor: activeId === id ? 'rgba(255, 107, 53, 0.1)' : 'transparent',
                }}
              >
                {text}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
