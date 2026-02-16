"""create dsa_topic_stats table

Revision ID: 004
Revises: 003
Create Date: 2026-02-16
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'dsa_topic_stats',
        sa.Column('folder', sa.String(255), primary_key=True),
        sa.Column('problem_count', sa.Integer(), server_default='0'),
        sa.Column('last_updated_file', sa.String(255), nullable=True),
        sa.Column('last_updated_at', sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_table('dsa_topic_stats')
