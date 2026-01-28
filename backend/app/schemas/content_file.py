from pydantic import BaseModel, Field, validator
from typing import Literal, Optional, Any
from datetime import datetime
from uuid import UUID

# Metadata schemas


class BlogMetadata(BaseModel):
    slug: str
    title: str
    summary: str
    category: str
    tags: list[str] = []
    readTime: Optional[int] = None
    thumbnail: Optional[str] = None
    featured: bool = False


class ProjectMetadata(BaseModel):
    slug: str
    title: str
    summary: str
    reason: Optional[str] = None
    techStack: list[str]
    deployedUrl: Optional[str] = None
    codebaseUrl: Optional[str] = None
    thumbnail: Optional[str] = None
    featured: bool = False


class CaseStudyMetadata(BaseModel):
    slug: str
    title: str
    summary: str
    category: str
    tags: list[str] = []
    thumbnail: Optional[str] = None
    featured: bool = False

# API Schemas


class ContentFileCreate(BaseModel):
    section: Literal["blog", "project", "case-study"]


class ContentFileUpdate(BaseModel):
    is_published: Optional[bool] = None
    metajson: Optional[dict[str, Any]] = None


class ContentFileResponse(BaseModel):
    id: UUID
    section: str
    filename: str
    file_path: str
    metajson: dict[str, Any]
    is_published: bool
    published_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ContentFileListItem(BaseModel):
    id: UUID
    section: str
    filename: str
    metajson: dict[str, Any]
    is_published: bool
    published_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class MarkdownContentResponse(BaseModel):
    content: str
    metajson: dict[str, Any]
