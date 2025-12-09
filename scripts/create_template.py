#!/usr/bin/env python3
"""
Markdown Template Generator
Creates properly formatted markdown templates for blog, project, case-study
"""

import sys
from pathlib import Path
from datetime import datetime


TEMPLATES = {
    "blog": """---
slug: my-blog-post-slug
title: "My Blog Post Title"
summary: "A brief summary of what this blog post is about. Keep it concise and engaging."
category: "Technology"
tags: ["Python", "Tutorial", "Web Development"]
readTime: "5 min"
---

# My Blog Post Title

## Introduction

Write your introduction here. Explain what the post is about and why it matters.

## Main Content

### Section 1

Your first main point goes here.

### Section 2

Your second main point goes here.

## Conclusion

Wrap up your thoughts and provide key takeaways.
""",

    "project": """---
slug: my-project-slug
title: "My Awesome Project"
summary: "A brief description of what this project does and why it's cool."
techStack: ["React", "Node.js", "PostgreSQL", "Docker"]
deployedUrl: "https://my-project.com"
codebaseUrl: "https://github.com/username/project"
---

# My Awesome Project

## Overview

Describe what your project does and the problem it solves.

## Features

- Feature 1: Description
- Feature 2: Description
- Feature 3: Description

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Deployment**: Docker, AWS

## Architecture

Explain how your project is architected.

## Challenges & Solutions

### Challenge 1

Problem description and how you solved it.

### Challenge 2

Another problem and solution.

## Getting Started

```bash
npm install
npm run dev
```

## Screenshots

[Add screenshots or demo GIFs here]
""",

    "case-study": """---
slug: my-case-study-slug
title: "My Case Study: Solving Complex Problem"
summary: "How we achieved X result by implementing Y solution for Z client/project."
category: "Performance"
tags: ["Optimization", "Case Study", "Best Practices"]
---

# My Case Study: Solving Complex Problem

## Executive Summary

Brief overview of the project, problem, solution, and results.

**Key Metrics:**
- Metric 1: X% improvement
- Metric 2: Y reduction
- Metric 3: Z increase

## The Challenge

### Initial Situation

Describe the problem state before your intervention.

**Problems Identified:**
- Problem 1
- Problem 2
- Problem 3

**Business Impact:**
- Impact 1
- Impact 2

## Our Approach

### Phase 1: Analysis

Explain how you analyzed the problem.

### Phase 2: Strategy

Describe the strategy you developed.

### Phase 3: Implementation

Detail the implementation process.

## Results

**Technical Improvements:**
- Improvement 1: Before → After
- Improvement 2: Before → After
- Improvement 3: Before → After

**Business Outcomes:**
- Outcome 1
- Outcome 2
- Outcome 3

## Key Takeaways

1. Lesson 1
2. Lesson 2
3. Lesson 3

## Technologies Used

- Technology 1
- Technology 2
- Technology 3

## Conclusion

Summary of the project success and future considerations.
"""
}


def create_template(section, filename=None):
    """
    Create a markdown template file
    """
    if section not in TEMPLATES:
        print(f"❌ Invalid section: {section}")
        print(f"   Valid options: {', '.join(TEMPLATES.keys())}")
        return False

    # Generate filename if not provided
    if not filename:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{section}_template_{timestamp}.md"

    # Ensure .md extension
    if not filename.endswith('.md'):
        filename += '.md'

    filepath = Path(filename)

    # Check if file exists
    if filepath.exists():
        response = input(
            f"⚠️  File {filename} already exists. Overwrite? (y/N): "
        )
        if response.lower() != 'y':
            print("❌ Cancelled")
            return False

    # Write template
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(TEMPLATES[section].strip() + '\n')

        print(f"✅ Created template: {filepath}")
        print(f"\n📝 Next steps:")
        print(f"   1. Edit {filename} with your content")
        print(f"   2. Update the frontmatter fields (slug, title, etc.)")
        print(f"   3. Upload via /admin/upload page")
        print(f"\n💡 Tips:")
        print(f"   - Keep slug lowercase with hyphens (e.g., 'my-post-slug')")
        print(f"   - Wrap values with colons in quotes")
        print(f"   - Use double quotes for consistency")

        return True

    except Exception as e:
        print(f"❌ Error creating template: {str(e)}")
        return False


def main():
    """
    Main function
    """
    print("=" * 60)
    print("MARKDOWN TEMPLATE GENERATOR")
    print("=" * 60)
    print()

    if len(sys.argv) < 2:
        print("Usage:")
        print("  python create_template.py <section> [filename]")
        print()
        print("Sections:")
        print("  blog        - Blog post template")
        print("  project     - Project showcase template")
        print("  case-study  - Case study template")
        print()
        print("Examples:")
        print("  python create_template.py blog")
        print("  python create_template.py blog my-post.md")
        print("  python create_template.py project awesome-project.md")
        sys.exit(1)

    section = sys.argv[1].lower()
    filename = sys.argv[2] if len(sys.argv) > 2 else None

    if create_template(section, filename):
        print("\n" + "=" * 60)
        print("DONE!")
        print("=" * 60)
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
