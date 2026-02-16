"""create dsa tables

Revision ID: 003
Revises: 002
Create Date: 2026-02-16
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'dsa_problems',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('path', sa.String(500), nullable=False, unique=True),
        sa.Column('filename', sa.String(255), nullable=False),
        sa.Column('folder', sa.String(255), nullable=True),
        sa.Column('language', sa.String(20), nullable=True),
        sa.Column('difficulty', sa.String(10), server_default='Medium'),
        sa.Column('tags', postgresql.JSONB(), server_default='[]'),
        sa.Column('time_complexity', sa.String(50), nullable=True),
        sa.Column('space_complexity', sa.String(50), nullable=True),
        sa.Column('leetcode_link', sa.String(500), nullable=True),
        sa.Column('sha', sa.String(40), nullable=False),
        sa.Column('first_seen_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('last_updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_index('idx_dsa_problems_difficulty', 'dsa_problems', ['difficulty'])
    op.create_index('idx_dsa_problems_folder', 'dsa_problems', ['folder'])
    op.create_index('idx_dsa_problems_tags', 'dsa_problems', ['tags'], postgresql_using='gin')

    op.create_table(
        'dsa_daily_activity',
        sa.Column('date', sa.Date(), primary_key=True),
        sa.Column('commit_count', sa.Integer(), server_default='0'),
        sa.Column('problems_added', sa.Integer(), server_default='0'),
        sa.Column('problems_modified', sa.Integer(), server_default='0'),
    )

    op.create_table(
        'dsa_sync_state',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('last_commit_sha', sa.String(40), nullable=True),
        sa.Column('last_synced_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('total_commits_processed', sa.Integer(), server_default='0'),
    )


def downgrade() -> None:
    op.drop_table('dsa_sync_state')
    op.drop_table('dsa_daily_activity')
    op.drop_index('idx_dsa_problems_tags', table_name='dsa_problems')
    op.drop_index('idx_dsa_problems_folder', table_name='dsa_problems')
    op.drop_index('idx_dsa_problems_difficulty', table_name='dsa_problems')
    op.drop_table('dsa_problems')
