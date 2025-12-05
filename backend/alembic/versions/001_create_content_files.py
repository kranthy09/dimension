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
        sa.Column('metajson', postgresql.JSONB(), nullable=False),
        sa.Column('is_published', sa.Boolean(), default=False),
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Indexes
    op.create_index('idx_content_files_section', 'content_files', ['section'])
    op.create_index('idx_section_filename', 'content_files', ['section', 'filename'], unique=True)
    op.create_index('idx_published', 'content_files', ['is_published', 'published_at'])
    op.create_index('idx_metajson_gin', 'content_files', ['metajson'], postgresql_using='gin')

def downgrade() -> None:
    op.drop_table('content_files')
