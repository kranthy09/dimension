#!/usr/bin/env python3
"""
Validate frontmatter in markdown files before uploading.

Usage:
    python validate_frontmatter.py ./content/blog blog
    python validate_frontmatter.py my-post.md blog
"""

import sys
import frontmatter
from pathlib import Path

REQUIRED_FIELDS = {
    "blog": ["slug", "title", "summary", "category"],
    "project": ["slug", "title", "summary", "techStack"],
    "case-study": ["slug", "title", "summary", "category"]
}

def validate_file(filepath: Path, section: str) -> bool:
    """Validate a single markdown file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            post = frontmatter.load(f)

        metadata = post.metadata
        required = REQUIRED_FIELDS.get(section, [])
        missing = [field for field in required if field not in metadata]

        if missing:
            print(f"✗ {filepath.name}: Missing fields: {', '.join(missing)}")
            return False

        slug = metadata.get('slug', '')
        if not slug or not slug.replace('-', '').replace('_', '').isalnum():
            print(f"✗ {filepath.name}: Invalid slug format: {slug}")
            return False

        print(f"✓ {filepath.name}: Valid")
        return True

    except Exception as e:
        print(f"✗ {filepath.name}: Error - {str(e)}")
        return False

def validate_directory(path: Path, section: str):
    """Validate all markdown files in a directory."""
    md_files = list(path.glob("*.md"))

    if not md_files:
        print(f"No markdown files found in {path}")
        return

    print(f"Validating {len(md_files)} files for section: {section}\n")

    valid_count = 0
    invalid_count = 0

    for filepath in md_files:
        if validate_file(filepath, section):
            valid_count += 1
        else:
            invalid_count += 1

    print(f"\nResults: {valid_count} valid, {invalid_count} invalid")

    if invalid_count == 0:
        print("✓ All files are valid and ready to upload!")

def main():
    if len(sys.argv) != 3:
        print("Usage: python validate_frontmatter.py <file_or_directory> <section>")
        print("Example: python validate_frontmatter.py ./content/blog blog")
        sys.exit(1)

    target = sys.argv[1]
    section = sys.argv[2]

    valid_sections = ["blog", "project", "case-study"]
    if section not in valid_sections:
        print(f"Error: Invalid section '{section}'")
        print(f"Valid sections: {', '.join(valid_sections)}")
        sys.exit(1)

    path = Path(target)

    if not path.exists():
        print(f"Error: '{target}' does not exist")
        sys.exit(1)

    if path.is_dir():
        validate_directory(path, section)
    elif path.is_file():
        if validate_file(path, section):
            print("\n✓ File is valid and ready to upload!")
        else:
            sys.exit(1)
    else:
        print(f"Error: '{target}' is not a file or directory")
        sys.exit(1)

if __name__ == "__main__":
    main()
