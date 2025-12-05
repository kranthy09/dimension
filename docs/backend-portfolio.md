# Portfolio Backend - FastAPI Complete Implementation

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app entry point
│   ├── config.py               # Configuration management
│   ├── database.py             # Database connection
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   └── content_file.py     # SQLAlchemy model
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── content_file.py     # Pydantic schemas
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── file_storage.py     # File operations
│   │   └── content_service.py  # Business logic
│   │
│   ├── utils/
│   │   ├── __init__.py
│   │   └── markdown_parser.py  # Frontmatter parsing
│   │
│   └── api/
│       ├── __init__.py
│       ├── deps.py             # Dependencies
│       └── routes/
│           ├── __init__.py
│           └── content.py      # Content endpoints
│
├── alembic/
│   ├── versions/
│   │   └── 001_create_content_files.py
│   └── env.py
│
├── requirements.txt
├── Dockerfile
└── docker-compose.yml
```

---

## 1. Configuration (`app/config.py`)

```python
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://user:pass@db:5432/portfolio"
    
    # File Storage
    MEDIA_ROOT: str = "/app/media"
    MARKDOWN_DIR: str = "markdown"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    # API
    API_V1_PREFIX: str = "/api/v1"
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings()
```

---

## 2. Database Setup (`app/database.py`)

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import get_settings

settings = get_settings()

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Database session dependency"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

## 3. SQLAlchemy Model (`app/models/content_file.py`)

```python
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
    
    # Metadata (JSONB for flexibility)
    metadata = Column(JSONB, nullable=False)
    
    # Publishing
    is_published = Column(Boolean, default=False, index=True)
    published_at = Column(DateTime(timezone=True), nullable=True)
    
    # Audit
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    __table_args__ = (
        Index('idx_section_filename', 'section', 'filename', unique=True),
        Index('idx_published', 'is_published', 'published_at'),
        Index('idx_metadata_gin', 'metadata', postgresql_using='gin'),
    )
    
    def __repr__(self):
        return f"<ContentFile {self.section}/{self.filename}>"
    
    @property
    def slug(self) -> str:
        """Extract slug from metadata"""
        return self.metadata.get('slug', '')
    
    @property
    def title(self) -> str:
        """Extract title from metadata"""
        return self.metadata.get('title', self.filename)
```

---

## 4. Pydantic Schemas (`app/schemas/content_file.py`)

```python
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
    metadata: Optional[dict[str, Any]] = None

class ContentFileResponse(BaseModel):
    id: UUID
    section: str
    filename: str
    file_path: str
    metadata: dict[str, Any]
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
    metadata: dict[str, Any]
    is_published: bool
    published_at: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True

class MarkdownContentResponse(BaseModel):
    content: str
    metadata: dict[str, Any]
```

---

## 5. Markdown Parser Utility (`app/utils/markdown_parser.py`)

```python
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
```

---

## 6. File Storage Service (`app/services/file_storage.py`)

```python
from pathlib import Path
from fastapi import UploadFile
from app.config import get_settings

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
            Absolute file path
        """
        section_dir = self.get_section_dir(section)
        file_path = section_dir / file.filename
        
        # Read and save content
        content = await file.read()
        file_path.write_bytes(content)
        
        return str(file_path)
    
    def read_file(self, file_path: str) -> str:
        """Read markdown content from disk"""
        return Path(file_path).read_text(encoding="utf-8")
    
    def delete_file(self, file_path: str) -> None:
        """Delete markdown file from disk"""
        Path(file_path).unlink(missing_ok=True)
    
    def file_exists(self, file_path: str) -> bool:
        """Check if file exists"""
        return Path(file_path).exists()

# Singleton instance
file_storage = FileStorageService()
```

---

## 7. Content Service (`app/services/content_service.py`)

```python
from sqlalchemy.orm import Session
from sqlalchemy import desc
from fastapi import UploadFile, HTTPException
from typing import Optional
from datetime import datetime
from uuid import UUID

from app.models.content_file import ContentFile
from app.schemas.content_file import ContentFileUpdate
from app.services.file_storage import file_storage
from app.utils.markdown_parser import MarkdownParser

class ContentService:
    """Business logic for content management"""
    
    def __init__(self, db: Session):
        self.db = db
        self.parser = MarkdownParser()
    
    async def create_from_upload(
        self, 
        section: str, 
        file: UploadFile
    ) -> ContentFile:
        """Create content file from upload"""
        
        # Validate file extension
        if not file.filename.endswith('.md'):
            raise HTTPException(400, "Only .md files allowed")
        
        # Read and parse file
        content = await file.read()
        metadata, markdown_content = self.parser.parse(content)
        
        # Validate metadata
        try:
            self.parser.validate_required_fields(section, metadata)
        except ValueError as e:
            raise HTTPException(400, str(e))
        
        # Check for duplicate slug
        slug = metadata.get('slug')
        existing = self.get_by_slug(section, slug)
        if existing:
            raise HTTPException(400, f"Content with slug '{slug}' already exists")
        
        # Save file to disk
        await file.seek(0)  # Reset file pointer
        file_path = await file_storage.save_file(section, file)
        
        # Create database record
        content_file = ContentFile(
            section=section,
            filename=file.filename,
            file_path=file_path,
            metadata=metadata,
            is_published=False
        )
        
        self.db.add(content_file)
        self.db.commit()
        self.db.refresh(content_file)
        
        return content_file
    
    def get_by_id(self, content_id: UUID) -> Optional[ContentFile]:
        """Get content file by ID"""
        return self.db.query(ContentFile).filter(
            ContentFile.id == content_id
        ).first()
    
    def get_by_slug(self, section: str, slug: str) -> Optional[ContentFile]:
        """Get content file by section and slug"""
        return self.db.query(ContentFile).filter(
            ContentFile.section == section,
            ContentFile.metadata['slug'].astext == slug
        ).first()
    
    def list_by_section(
        self, 
        section: str, 
        published_only: bool = True,
        limit: int = 100,
        offset: int = 0
    ) -> list[ContentFile]:
        """List content files by section"""
        query = self.db.query(ContentFile).filter(
            ContentFile.section == section
        )
        
        if published_only:
            query = query.filter(ContentFile.is_published == True)
        
        return query.order_by(
            desc(ContentFile.published_at)
        ).limit(limit).offset(offset).all()
    
    def update(
        self, 
        content_id: UUID, 
        update_data: ContentFileUpdate
    ) -> Optional[ContentFile]:
        """Update content file"""
        content = self.get_by_id(content_id)
        if not content:
            return None
        
        update_dict = update_data.model_dump(exclude_unset=True)
        
        # Handle publish action
        if 'is_published' in update_dict and update_dict['is_published']:
            if not content.published_at:
                update_dict['published_at'] = datetime.now()
        
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

def get_content_service(db: Session) -> ContentService:
    """Dependency to get content service"""
    return ContentService(db)
```

---

## 8. API Routes (`app/api/routes/content.py`)

```python
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Literal
from uuid import UUID

from app.database import get_db
from app.services.content_service import ContentService, get_content_service
from app.schemas.content_file import (
    ContentFileResponse,
    ContentFileListItem,
    ContentFileUpdate,
    MarkdownContentResponse
)

router = APIRouter(prefix="/content", tags=["content"])

@router.post("/upload", response_model=ContentFileResponse, status_code=201)
async def upload_content(
    section: Literal["blog", "project", "case-study"] = Query(...),
    file: UploadFile = File(...),
    service: ContentService = Depends(get_content_service)
):
    """Upload a markdown file"""
    return await service.create_from_upload(section, file)

@router.get("/{section}", response_model=list[ContentFileListItem])
def list_content(
    section: Literal["blog", "project", "case-study"],
    published_only: bool = Query(True),
    limit: int = Query(100, le=100),
    offset: int = Query(0, ge=0),
    service: ContentService = Depends(get_content_service)
):
    """List content files by section"""
    return service.list_by_section(section, published_only, limit, offset)

@router.get("/{section}/{slug}", response_model=ContentFileResponse)
def get_content(
    section: Literal["blog", "project", "case-study"],
    slug: str,
    service: ContentService = Depends(get_content_service)
):
    """Get content file by slug"""
    content = service.get_by_slug(section, slug)
    if not content:
        raise HTTPException(404, f"Content not found: {section}/{slug}")
    return content

@router.get("/{section}/{slug}/markdown", response_model=MarkdownContentResponse)
def get_markdown(
    section: Literal["blog", "project", "case-study"],
    slug: str,
    service: ContentService = Depends(get_content_service)
):
    """Get raw markdown content"""
    content = service.get_by_slug(section, slug)
    if not content:
        raise HTTPException(404, f"Content not found: {section}/{slug}")
    
    markdown = service.get_markdown_content(section, slug)
    return {
        "content": markdown,
        "metadata": content.metadata
    }

@router.patch("/{content_id}", response_model=ContentFileResponse)
def update_content(
    content_id: UUID,
    update_data: ContentFileUpdate,
    service: ContentService = Depends(get_content_service)
):
    """Update content file metadata"""
    content = service.update(content_id, update_data)
    if not content:
        raise HTTPException(404, "Content not found")
    return content

@router.delete("/{content_id}", status_code=204)
def delete_content(
    content_id: UUID,
    service: ContentService = Depends(get_content_service)
):
    """Delete content file"""
    success = service.delete(content_id)
    if not success:
        raise HTTPException(404, "Content not found")
```

---

## 9. Main Application (`app/main.py`)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.api.routes import content

settings = get_settings()

app = FastAPI(
    title="Portfolio API",
    description="Markdown-first content management system",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(content.router, prefix=settings.API_V1_PREFIX)

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/")
def root():
    return {
        "message": "Portfolio API",
        "docs": "/docs",
        "health": "/health"
    }
```

---

## 10. Alembic Migration (`alembic/versions/001_create_content_files.py`)

```python
"""create content_files table

Revision ID: 001
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        'content_files',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('section', sa.String(50), nullable=False),
        sa.Column('filename', sa.String(255), nullable=False),
        sa.Column('file_path', sa.String(500), nullable=False),
        sa.Column('metadata', postgresql.JSONB(), nullable=False),
        sa.Column('is_published', sa.Boolean(), default=False),
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    
    # Indexes
    op.create_index('idx_content_files_section', 'content_files', ['section'])
    op.create_index('idx_section_filename', 'content_files', ['section', 'filename'], unique=True)
    op.create_index('idx_published', 'content_files', ['is_published', 'published_at'])
    op.create_index('idx_metadata_gin', 'content_files', ['metadata'], postgresql_using='gin')

def downgrade() -> None:
    op.drop_table('content_files')
```

---

## 11. Requirements (`requirements.txt`)

```txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
alembic==1.13.1
psycopg2-binary==2.9.9
pydantic==2.5.3
pydantic-settings==2.1.0
python-multipart==0.0.6
python-frontmatter==1.1.0
python-dotenv==1.0.0
```

---

## 12. Docker Setup (`Dockerfile`)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY app/ ./app/
COPY alembic/ ./alembic/
COPY alembic.ini .

# Create media directory
RUN mkdir -p /app/media/markdown

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

---

## 13. Docker Compose (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: portfolio
      POSTGRES_PASSWORD: portfolio_pass
      POSTGRES_DB: portfolio
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://portfolio:portfolio_pass@db:5432/portfolio
      CORS_ORIGINS: '["http://localhost:3000"]'
    volumes:
      - ./app:/app/app
      - ./media:/app/media
    depends_on:
      - db
    command: >
      sh -c "alembic upgrade head &&
             uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

volumes:
  postgres_data:
```

---

## 14. Environment Variables (`.env`)

```env
DATABASE_URL=postgresql://portfolio:portfolio_pass@db:5432/portfolio
MEDIA_ROOT=/app/media
MARKDOWN_DIR=markdown
MAX_UPLOAD_SIZE=10485760
API_V1_PREFIX=/api/v1
CORS_ORIGINS=["http://localhost:3000"]
SECRET_KEY=your-secret-key-change-in-production
```

---

## Usage

### Start Services

```bash
docker-compose up -d
```

### Run Migrations

```bash
docker-compose exec backend alembic upgrade head
```

### Upload Content

```bash
curl -X POST "http://localhost:8000/api/v1/content/upload?section=blog" \
  -F "file=@my-post.md"
```

### List Content

```bash
curl "http://localhost:8000/api/v1/content/blog"
```

### Get Content

```bash
curl "http://localhost:8000/api/v1/content/blog/my-slug"
```

### Get Markdown

```bash
curl "http://localhost:8000/api/v1/content/blog/my-slug/markdown"
```

---

## Key Features

✅ **Clean Architecture** - Separated layers (models, schemas, services, routes)  
✅ **Type Safety** - Full Pydantic validation  
✅ **Database Migrations** - Alembic for version control  
✅ **File Storage** - Organized directory structure  
✅ **Metadata Parsing** - Frontmatter extraction  
✅ **CRUD Operations** - Complete content management  
✅ **Publishing Workflow** - Draft/published states  
✅ **Docker Ready** - Full containerization  
✅ **API Documentation** - Auto-generated OpenAPI docs at `/docs`

