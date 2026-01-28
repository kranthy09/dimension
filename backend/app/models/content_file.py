from sqlalchemy import Column, String, Boolean, DateTime, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid
from app.database import Base


class ContentFile(Base):
    __tablename__ = "content_files"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Content classification
    section = Column(String(50), nullable=False, index=True)

    # File information
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)

    # Metadata (JSONB for flexibility) - renamed to avoid built-in conflicts
    metajson = Column(JSONB, nullable=False)

    # Publishing
    is_published = Column(Boolean, default=False, index=True)
    published_at = Column(DateTime(timezone=True), nullable=True)

    # Audit
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True),
                        server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        Index('idx_section_filename', 'section', 'filename', unique=True),
        Index('idx_published', 'is_published', 'published_at'),
        Index('idx_metajson_gin', 'metajson', postgresql_using='gin'),
    )

    def __repr__(self):
        return f"<ContentFile {self.section}/{self.filename}>"

    @property
    def slug(self) -> str:
        """Extract slug from metajson"""
        return self.metajson.get('slug', '')

    @property
    def title(self) -> str:
        """Extract title from metajson"""
        return self.metajson.get('title', self.filename)
