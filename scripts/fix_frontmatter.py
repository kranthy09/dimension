#!/usr/bin/env python3
"""
Frontmatter Fixer Script
Automatically fixes common YAML frontmatter issues in markdown files
"""

import os
import sys
import re
from pathlib import Path


def quote_if_needed(value):
    """
    Quote a value if it contains special YAML characters
    """
    if not isinstance(value, str):
        return value

    # Check if already quoted
    if (value.startswith('"') and value.endswith('"')) or \
       (value.startswith("'") and value.endswith("'")):
        return value

    # Characters that require quoting in YAML
    special_chars = [':', '#', '@', '`', '|', '>', '*', '&', '!', '%',
                     '{', '}', '[', ']', ',', '?', '-']

    # Check if value contains special characters
    if any(char in value for char in special_chars):
        # Escape any existing quotes
        escaped = value.replace('"', '\\"')
        return f'"{escaped}"'

    return value


def fix_frontmatter(content):
    """
    Fix common frontmatter issues in markdown content
    """
    lines = content.split('\n')

    # Check if file has frontmatter
    if len(lines) < 3 or lines[0].strip() != '---':
        return content, []

    # Find end of frontmatter
    fm_end = -1
    for i in range(1, len(lines)):
        if lines[i].strip() == '---':
            fm_end = i
            break

    if fm_end == -1:
        return content, ["Missing closing --- for frontmatter"]

    # Extract frontmatter lines
    fm_lines = lines[1:fm_end]
    fixed_lines = []
    fixes_applied = []

    for line in fm_lines:
        # Skip empty lines and comments
        if not line.strip() or line.strip().startswith('#'):
            fixed_lines.append(line)
            continue

        # Match key: value pattern
        match = re.match(r'^(\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.+)$',
                         line)
        if match:
            indent, key, value = match.groups()
            value = value.strip()

            # Fix common issues
            original_value = value

            # 1. Quote values with colons
            if ':' in value and not (
                value.startswith('"') or value.startswith("'")
            ):
                value = quote_if_needed(value)
                if value != original_value:
                    fixes_applied.append(
                        f"Quoted value with colon: {key}"
                    )

            # 2. Fix array syntax if needed
            if value.startswith('[') and value.endswith(']'):
                # Check if items are properly quoted
                array_content = value[1:-1]
                items = [item.strip()
                         for item in array_content.split(',')]
                fixed_items = [quote_if_needed(item) for item in items]

                # Only update if changes were made
                new_value = '[' + ', '.join(fixed_items) + ']'
                if new_value != value:
                    value = new_value
                    fixes_applied.append(f"Fixed array syntax: {key}")

            fixed_lines.append(f"{indent}{key}: {value}")
        else:
            # Keep line as-is if it doesn't match key:value
            fixed_lines.append(line)

    # Reconstruct content
    fixed_content = (
        ['---'] +
        fixed_lines +
        lines[fm_end:]
    )

    return '\n'.join(fixed_content), fixes_applied


def process_file(filepath):
    """
    Process a single markdown file
    """
    print(f"\n📄 Processing: {filepath}")

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        fixed_content, fixes = fix_frontmatter(content)

        if fixes:
            print("  ✓ Fixes applied:")
            for fix in fixes:
                print(f"    - {fix}")

            # Write fixed content back
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(fixed_content)

            print(f"  ✅ File updated: {filepath}")
        else:
            print("  ℹ️  No fixes needed")

        return True

    except Exception as e:
        print(f"  ❌ Error: {str(e)}")
        return False


def main():
    """
    Main function
    """
    print("=" * 60)
    print("FRONTMATTER FIXER")
    print("=" * 60)

    if len(sys.argv) < 2:
        print("\nUsage:")
        print("  Fix single file:")
        print("    python fix_frontmatter.py <file.md>")
        print("\n  Fix all files in directory:")
        print("    python fix_frontmatter.py <directory>")
        print("\nExample:")
        print("  python fix_frontmatter.py blog.md")
        print("  python fix_frontmatter.py backend/media/markdown/blog/")
        sys.exit(1)

    path = Path(sys.argv[1])

    if path.is_file():
        if path.suffix == '.md':
            process_file(path)
        else:
            print(f"❌ Not a markdown file: {path}")
            sys.exit(1)

    elif path.is_dir():
        md_files = list(path.glob('**/*.md'))
        if not md_files:
            print(f"❌ No markdown files found in: {path}")
            sys.exit(1)

        print(f"\nFound {len(md_files)} markdown file(s)")

        success_count = 0
        for md_file in md_files:
            if process_file(md_file):
                success_count += 1

        print("\n" + "=" * 60)
        print(f"DONE! Processed {success_count}/{len(md_files)} files")
        print("=" * 60)

    else:
        print(f"❌ Path not found: {path}")
        sys.exit(1)


if __name__ == "__main__":
    main()
