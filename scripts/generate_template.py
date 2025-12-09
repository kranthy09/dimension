#!/usr/bin/env python3
"""
Generate markdown template for blog posts, projects, or case studies.

Usage:
    python generate_template.py blog my-slug "My Post Title"
    python generate_template.py project my-project "My Project"
    python generate_template.py case-study my-case "My Case Study"
"""

import sys
from pathlib import Path

TEMPLATES = {
    "blog": """---
slug: {slug}
title: {title}
summary: Brief description of the post
category: Tech
tags: [tag1, tag2, tag3]
readTime: 5
thumbnail: /images/blog/{slug}.png
featured: false
---

# {title}

Write your content here...

## Section 1

Your content...

## Section 2

More content...
""",
    "project": """---
slug: {slug}
title: {title}
summary: Brief description of the project
reason: Why you built this project
techStack: [Next.js, FastAPI, PostgreSQL]
deployedUrl: https://example.com
codebaseUrl: https://github.com/username/repo
thumbnail: /images/projects/{slug}.png
featured: false
---

# {title}

## Overview

Describe your project...

## Problem

What problem does it solve?

## Solution

How did you solve it?

## Technical Highlights

Key technical decisions...

## Results

What were the outcomes?
""",
    "case-study": """---
slug: {slug}
title: {title}
summary: Brief description of the case study
category: System Design
tags: [architecture, scalability, performance]
thumbnail: /images/cases/{slug}.png
featured: false
---

# {title}

## Context

Set the stage...

## Challenge

What was the problem?

## Approach

How did you tackle it?

## Implementation

Technical details...

## Results

Metrics and outcomes...

## Lessons Learned

Key takeaways...
""",
}


def generate_template(section: str, slug: str, title: str):
    """Generate a markdown template file."""
    if section not in TEMPLATES:
        print(f"Error: Invalid section '{section}'")
        print(f"Valid sections: {', '.join(TEMPLATES.keys())}")
        sys.exit(1)

    template = TEMPLATES[section]
    content = template.format(slug=slug, title=title)

    filename = f"{slug}.md"
    filepath = Path(filename)

    if filepath.exists():
        print(f"Error: File '{filename}' already exists")
        sys.exit(1)

    filepath.write_text(content)
    print(f"✓ Created {filename}")
    print("\nNext steps:")
    print(f"1. Edit {filename} in your favorite editor")
    print(
        f"2. Upload: curl \
            -X POST \
            'http://localhost:8000/api/v1/content/upload?section={section}' \
            -F 'file=@{filename}'"
    )


if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python generate_template.py <section> <slug> <title>")
        print(
            "Example: python generate_template.py blog my-post 'My Post Title'"
        )
        sys.exit(1)

    section = sys.argv[1]
    slug = sys.argv[2]
    title = sys.argv[3]

    generate_template(section, slug, title)
