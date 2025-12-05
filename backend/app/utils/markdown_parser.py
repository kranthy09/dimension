import frontmatter
from typing import Dict, Tuple

class MarkdownParser:
    """Parse markdown files with frontmatter"""

    @staticmethod
    def parse(content: str | bytes) -> Tuple[Dict, str]:
        """
        Parse markdown content with frontmatter

        Args:
            content: Markdown file content (string or bytes)

        Returns:
            (metadata_dict, markdown_content)
        """
        if isinstance(content, bytes):
            content = content.decode('utf-8')

        post = frontmatter.loads(content)
        return dict(post.metadata), post.content

    @staticmethod
    def validate_required_fields(section: str, metadata: Dict) -> None:
        """
        Validate required fields based on section type

        Raises:
            ValueError: If required fields are missing
        """
        required_fields = {
            "blog": ["slug", "title", "summary", "category"],
            "project": ["slug", "title", "summary", "techStack"],
            "case-study": ["slug", "title", "summary", "category"]
        }

        section_fields = required_fields.get(section, [])
        missing = [f for f in section_fields if f not in metadata]

        if missing:
            raise ValueError(f"Missing required fields for {section}: {', '.join(missing)}")

    @staticmethod
    def validate_slug_uniqueness(slug: str) -> None:
        """Validate slug format"""
        if not slug or not slug.replace('-', '').replace('_', '').isalnum():
            raise ValueError(f"Invalid slug format: {slug}")
