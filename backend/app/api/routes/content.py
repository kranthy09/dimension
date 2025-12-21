from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Query

from typing import Literal, List
from uuid import UUID

from app.services.content_service import ContentService, get_content_service
from app.schemas.content_file import (
    ContentFileResponse,
    ContentFileListItem,
    ContentFileUpdate,
    MarkdownContentResponse,
)
from app.core.dependencies import get_current_admin_user
from app.models.user import User

router = APIRouter(prefix="/content", tags=["content"])


@router.post("/upload", response_model=ContentFileResponse, status_code=201)
async def upload_content(
    section: Literal["blog", "project", "case-study"] = Query(...),
    file: UploadFile = File(...),
    service: ContentService = Depends(get_content_service),
    current_user: User = Depends(get_current_admin_user),
):
    """Upload a markdown file (Admin only)"""
    return await service.create_from_upload(section, file)


@router.get("/{section}", response_model=list[ContentFileListItem])
def list_content(
    section: Literal["blog", "project", "case-study"],
    published_only: bool = Query(True),
    limit: int = Query(100, le=100),
    offset: int = Query(0, ge=0),
    service: ContentService = Depends(get_content_service),
):
    """List content files by section"""
    return service.list_by_section(section, published_only, limit, offset)


@router.get("/{section}/{slug}", response_model=ContentFileResponse)
def get_content(
    section: Literal["blog", "project", "case-study"],
    slug: str,
    service: ContentService = Depends(get_content_service),
):
    """Get content file by slug"""
    content = service.get_by_slug(section, slug)
    if not content:
        raise HTTPException(404, f"Content not found: {section}/{slug}")
    return content


@router.get(
    "/{section}/{slug}/markdown", response_model=MarkdownContentResponse
)
def get_markdown(
    section: Literal["blog", "project", "case-study"],
    slug: str,
    service: ContentService = Depends(get_content_service),
):
    """Get raw markdown content"""
    content = service.get_by_slug(section, slug)
    if not content:
        raise HTTPException(404, f"Content not found: {section}/{slug}")

    markdown = service.get_markdown_content(section, slug)
    return {"content": markdown, "metajson": content.metajson}


@router.patch("/{content_id}", response_model=ContentFileResponse)
def update_content(
    content_id: UUID,
    update_data: ContentFileUpdate,
    service: ContentService = Depends(get_content_service),
    current_user: User = Depends(get_current_admin_user),
):
    """Update content file metadata (Admin only)"""
    content = service.update(content_id, update_data)
    if not content:
        raise HTTPException(404, "Content not found")
    return content


@router.delete("/{content_id}", status_code=204)
def delete_content(
    content_id: UUID,
    service: ContentService = Depends(get_content_service),
    current_user: User = Depends(get_current_admin_user),
):
    """Delete content file (Admin only)"""
    success = service.delete(content_id)
    if not success:
        raise HTTPException(404, "Content not found")


@router.post("/{content_id}/images", status_code=201)
async def upload_images(
    content_id: UUID,
    images: List[UploadFile] = File(...),
    service: ContentService = Depends(get_content_service),
    _: User = Depends(get_current_admin_user),
):
    """Upload images for a content file (Admin only)"""
    return await service.upload_images(content_id, images)
