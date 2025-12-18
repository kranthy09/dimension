from pathlib import Path
from fastapi import UploadFile
from app.config import get_settings
import logging

logger = logging.getLogger()
settings = get_settings()


class FileStorageService:
    """Handle file storage operations"""

    def __init__(self):
        self.base_dir = Path(settings.MEDIA_ROOT) / settings.MARKDOWN_DIR
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def get_section_dir(self, section: str) -> Path:
        """Get directory for section"""
        section_dir = self.base_dir / section
        section_dir.mkdir(parents=True, exist_ok=True)
        return section_dir

    async def save_file(self, section: str, file: UploadFile) -> str:
        """
        Save uploaded markdown file

        Returns:
            Relative file path (e.g., "markdown/blog/file.md")
        """
        section_dir = self.get_section_dir(section)
        file_path = section_dir / file.filename

        # Read and save content
        content = await file.read()
        file_path.write_bytes(content)

        # Return relative path from MEDIA_ROOT
        relative_path = file_path.relative_to(settings.MEDIA_ROOT)
        return str(relative_path)

    def save_content(self, section: str, filename: str, content: str) -> str:
        """
        Save markdown content directly (without frontmatter)

        Returns:
            Relative file path (e.g., "markdown/blog/file.md")
        """
        section_dir = self.get_section_dir(section)
        file_path = section_dir / filename

        # Write content (already without frontmatter)
        file_path.write_text(content, encoding='utf-8')

        # Return relative path from MEDIA_ROOT
        relative_path = file_path.relative_to(settings.MEDIA_ROOT)
        return str(relative_path)

    def read_file(self, file_path: str) -> str:
        """Read markdown content from disk"""
        # file_path is relative (e.g., "markdown/blog/file.md")
        # Need to prepend MEDIA_ROOT to get absolute path
        absolute_path = Path(settings.MEDIA_ROOT) / file_path
        logger.info(f"Reading file from: {absolute_path}")
        return absolute_path.read_text(encoding="utf-8")

    def delete_file(self, file_path: str) -> None:
        """Delete markdown file from disk"""
        absolute_path = Path(settings.MEDIA_ROOT) / file_path
        absolute_path.unlink(missing_ok=True)

    def file_exists(self, file_path: str) -> bool:
        """Check if file exists"""
        absolute_path = Path(settings.MEDIA_ROOT) / file_path
        return absolute_path.exists()


# Singleton instance
file_storage = FileStorageService()
