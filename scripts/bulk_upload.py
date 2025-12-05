#!/usr/bin/env python3
"""
Bulk upload markdown files to the portfolio API.

Usage:
    python bulk_upload.py ./content/blog blog
    python bulk_upload.py ./content/projects project
    python bulk_upload.py ./content/cases case-study
"""

import sys
import requests
from pathlib import Path

API_BASE = "http://localhost:8000/api/v1"

def upload_file(filepath: Path, section: str):
    """Upload a single markdown file."""
    url = f"{API_BASE}/content/upload"
    params = {"section": section}

    try:
        with open(filepath, 'rb') as f:
            files = {'file': (filepath.name, f, 'text/markdown')}
            response = requests.post(url, params=params, files=files)

        if response.status_code == 201:
            data = response.json()
            title = data.get('metadata', {}).get('title', filepath.name)
            print(f"✓ Uploaded: {title}")
            return True
        else:
            error = response.json().get('detail', 'Unknown error')
            print(f"✗ Failed: {filepath.name} - {error}")
            return False

    except Exception as e:
        print(f"✗ Error uploading {filepath.name}: {str(e)}")
        return False

def bulk_upload(directory: str, section: str):
    """Upload all markdown files in a directory."""
    path = Path(directory)

    if not path.exists():
        print(f"Error: Directory '{directory}' does not exist")
        sys.exit(1)

    if not path.is_dir():
        print(f"Error: '{directory}' is not a directory")
        sys.exit(1)

    md_files = list(path.glob("*.md"))

    if not md_files:
        print(f"No markdown files found in {directory}")
        sys.exit(0)

    print(f"Found {len(md_files)} markdown files")
    print(f"Uploading to section: {section}\n")

    success_count = 0
    fail_count = 0

    for filepath in md_files:
        if upload_file(filepath, section):
            success_count += 1
        else:
            fail_count += 1

    print(f"\nResults: {success_count} succeeded, {fail_count} failed")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python bulk_upload.py <directory> <section>")
        print("Example: python bulk_upload.py ./content/blog blog")
        sys.exit(1)

    directory = sys.argv[1]
    section = sys.argv[2]

    valid_sections = ["blog", "project", "case-study"]
    if section not in valid_sections:
        print(f"Error: Invalid section '{section}'")
        print(f"Valid sections: {', '.join(valid_sections)}")
        sys.exit(1)

    bulk_upload(directory, section)
