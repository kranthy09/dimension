import frontmatter
import yaml
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

        Raises:
            ValueError: If frontmatter is invalid or malformed
        """
        if isinstance(content, bytes):
            content = content.decode('utf-8')

        try:
            post = frontmatter.loads(content)
            return dict(post.metadata), post.content
        except yaml.scanner.ScannerError as e:
            # Provide helpful error message for YAML syntax errors
            error_line = getattr(e, 'problem_mark', None)
            if error_line:
                line_num = error_line.line + 1
                col_num = error_line.column + 1

                # Extract the problematic line
                lines = content.split('\n')
                if 0 <= error_line.line < len(lines):
                    problem_line = lines[error_line.line]

                    raise ValueError(
                        f"Invalid YAML syntax in frontmatter at line {line_num}, column {col_num}.\n"
                        f"Problem line: {problem_line}\n\n"
                        f"Common fixes:\n"
                        f"  - Wrap values containing colons (:) in quotes\n"
                        f"    Example: title: \"My Title: A Subtitle\"\n"
                        f"  - Wrap values containing special characters in quotes\n"
                        f"  - Use proper YAML list syntax for arrays\n"
                        f"    Example: tags: [\"tag1\", \"tag2\"] or\n"
                        f"             tags:\n"
                        f"               - tag1\n"
                        f"               - tag2"
                    )
            raise ValueError(f"Invalid YAML frontmatter: {str(e)}")
        except Exception as e:
            raise ValueError(f"Failed to parse markdown file: {str(e)}")

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
