from sqlalchemy.orm import Session
from sqlalchemy import desc
from fastapi import UploadFile, HTTPException, Depends
from typing import Optional
from datetime import datetime
from uuid import UUID

from app.models.content_file import ContentFile
from app.schemas.content_file import ContentFileUpdate
from app.services.file_storage import file_storage
from app.utils.markdown_parser import MarkdownParser
from app.database import get_db


class ContentService:
    """Business logic for content management"""

    def __init__(self, db: Session):
        self.db = db
        self.parser = MarkdownParser()

    async def create_from_upload(
        self, section: str, file: UploadFile
    ) -> ContentFile:
        """Create content file from upload"""

        # Validate file extension
        if not file.filename.endswith(".md"):
            raise HTTPException(400, "Only .md files allowed")

        # Read and parse file
        content = await file.read()
        try:
            metajson, markdown_content = self.parser.parse(content)
            print("metajson: ", metajson)
        except ValueError as e:
            # Parser raises ValueError with helpful messages for YAML errors
            raise HTTPException(400, str(e))

        # Validate metajson
        try:
            self.parser.validate_required_fields(section, metajson)
        except ValueError as e:
            raise HTTPException(400, str(e))

        # Check for duplicate slug
        slug = metajson.get("slug")
        existing = self.get_by_slug(section, slug)
        if existing:
            raise HTTPException(
                400, f"Content with slug '{slug}' already exists"
            )

        # Save only the markdown content (without frontmatter) to disk
        # The metadata is already stored in metajson in the database
        file_path = file_storage.save_content(
            section,
            file.filename,
            markdown_content
        )

        # Create database record
        content_file = ContentFile(
            section=section,
            filename=file.filename,
            file_path=file_path,
            metajson=metajson,
            is_published=False,
        )

        self.db.add(content_file)
        self.db.commit()
        self.db.refresh(content_file)

        return content_file

    def get_by_id(self, content_id: UUID) -> Optional[ContentFile]:
        """Get content file by ID"""
        return (
            self.db.query(ContentFile)
            .filter(ContentFile.id == content_id)
            .first()
        )

    def get_by_slug(self, section: str, slug: str) -> Optional[ContentFile]:
        """Get content file by section and slug"""
        return (
            self.db.query(ContentFile)
            .filter(
                ContentFile.section == section,
                ContentFile.metajson["slug"].astext == slug,
            )
            .first()
        )

    def list_by_section(
        self,
        section: str,
        published_only: bool = True,
        limit: int = 100,
        offset: int = 0,
    ) -> list[ContentFile]:
        """List content files by section"""
        query = self.db.query(ContentFile).filter(
            ContentFile.section == section
        )

        if published_only:
            query = query.filter(ContentFile.is_published == True)

        return (
            query.order_by(desc(ContentFile.published_at))
            .limit(limit)
            .offset(offset)
            .all()
        )

    def update(
        self, content_id: UUID, update_data: ContentFileUpdate
    ) -> Optional[ContentFile]:
        """Update content file"""
        content = self.get_by_id(content_id)
        if not content:
            return None

        update_dict = update_data.model_dump(exclude_unset=True)

        # Handle publish action
        if "is_published" in update_dict and update_dict["is_published"]:
            if not content.published_at:
                update_dict["published_at"] = datetime.now()

        for key, value in update_dict.items():
            setattr(content, key, value)

        self.db.commit()
        self.db.refresh(content)

        return content

    def delete(self, content_id: UUID) -> bool:
        """Delete content file"""
        content = self.get_by_id(content_id)
        if not content:
            return False

        # Delete file from disk
        file_storage.delete_file(content.file_path)

        # Delete database record
        self.db.delete(content)
        self.db.commit()

        return True

    def get_markdown_content(self, section: str, slug: str) -> Optional[str]:
        """Get raw markdown content"""
        content = self.get_by_slug(section, slug)
        if not content:
            return None

        return file_storage.read_file(content.file_path)


def get_content_service(db: Session = Depends(get_db)) -> ContentService:
    """Dependency to get content service"""
    return ContentService(db)
