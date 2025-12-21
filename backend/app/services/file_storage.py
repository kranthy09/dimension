from pathlib import Path
from fastapi import UploadFile
from app.config import get_settings
import logging
import re

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

    def get_blog_folder_name(self, title: str) -> str:
        """
        Convert blog title to folder name

        Args:
            title: Blog title from metajson

        Returns:
            Sanitized folder name
        """
        # Remove special characters and convert to lowercase
        folder_name = re.sub(r'[^\w\s-]', '', title)
        # Replace spaces with underscores
        folder_name = re.sub(r'\s+', '_', folder_name)
        # Remove multiple underscores
        folder_name = re.sub(r'_+', '_', folder_name)
        return folder_name.strip('_')

    def get_content_dir(self, section: str, folder_name: str) -> Path:
        """
        Get blog-specific directory with images subdirectory

        Args:
            section: Content section (blog, project, case-study)
            folder_name: Blog folder name (from title)

        Returns:
            Path to blog directory
        """
        section_dir = self.get_section_dir(section)
        content_dir = section_dir / folder_name
        content_dir.mkdir(parents=True, exist_ok=True)

        # Create images subdirectory
        images_dir = content_dir / "images"
        images_dir.mkdir(parents=True, exist_ok=True)

        return content_dir

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

    def save_content(
        self,
        section: str,
        filename: str,
        content: str,
        folder_name: str = None
    ) -> str:
        """
        Save markdown content directly (without frontmatter)

        Args:
            section: Content section (blog, project, case-study)
            filename: Original filename
            content: Markdown content without frontmatter
            folder_name: Blog-specific folder name (optional)

        Returns:
            Relative file path (e.g., "markdown/blog/My_Blog/content.md")
        """
        if folder_name:
            # New structure: markdown/section/Blog_Name/content.md
            content_dir = self.get_content_dir(section, folder_name)
            file_path = content_dir / "content.md"
        else:
            # Legacy structure: markdown/section/filename.md
            section_dir = self.get_section_dir(section)
            file_path = section_dir / filename

        # Write content (already without frontmatter)
        file_path.write_text(content, encoding='utf-8')

        # Return relative path from MEDIA_ROOT
        relative_path = file_path.relative_to(settings.MEDIA_ROOT)
        return str(relative_path)

    async def save_image(
        self,
        section: str,
        folder_name: str,
        image: UploadFile
    ) -> str:
        """
        Save image to blog-specific images folder

        Args:
            section: Content section (blog, project, case-study)
            folder_name: Blog folder name
            image: Uploaded image file

        Returns:
            Relative path to image
            (e.g., "markdown/blog/My_Blog/images/header.png")
        """
        content_dir = self.get_content_dir(section, folder_name)
        images_dir = content_dir / "images"

        # Save image with original filename
        image_path = images_dir / image.filename

        # Read and save content
        content = await image.read()
        image_path.write_bytes(content)

        # Return relative path from MEDIA_ROOT
        relative_path = image_path.relative_to(settings.MEDIA_ROOT)
        return str(relative_path)

    def read_file(self, file_path: str) -> str:
        """Read markdown content from disk"""
        # file_path is relative (e.g., "markdown/blog/file.md")
        # Need to prepend MEDIA_ROOT to get absolute path
        absolute_path = Path(settings.MEDIA_ROOT) / file_path
        logger.info(f"Reading file from: {absolute_path}")
        return absolute_path.read_text(encoding="utf-8")

    def delete_file(self, file_path: str) -> None:
        """Delete markdown file or entire blog folder from disk"""
        absolute_path = Path(settings.MEDIA_ROOT) / file_path

        # If it's a content.md file in a blog folder, delete the whole folder
        if absolute_path.name == "content.md" and absolute_path.parent.name:
            blog_folder = absolute_path.parent
            if blog_folder.exists():
                import shutil
                shutil.rmtree(blog_folder)
                logger.info(f"Deleted blog folder: {blog_folder}")
        else:
            # Legacy: just delete the file
            absolute_path.unlink(missing_ok=True)

    def file_exists(self, file_path: str) -> bool:
        """Check if file exists"""
        absolute_path = Path(settings.MEDIA_ROOT) / file_path
        return absolute_path.exists()


# Singleton instance
file_storage = FileStorageService()
