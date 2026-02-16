from sqlalchemy import Column, Integer, String, Date, DateTime, Index
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func

from app.database import Base


class DsaProblem(Base):
    __tablename__ = "dsa_problems"

    id = Column(Integer, primary_key=True, autoincrement=True)
    path = Column(String(500), unique=True, nullable=False)
    filename = Column(String(255), nullable=False)
    folder = Column(String(255))
    language = Column(String(20))
    difficulty = Column(String(10), default="Medium")
    tags = Column(JSONB, default=list)
    time_complexity = Column(String(50))
    space_complexity = Column(String(50))
    leetcode_link = Column(String(500))
    sha = Column(String(40), nullable=False)
    first_seen_at = Column(DateTime(timezone=True), nullable=False)
    last_updated_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        Index("idx_dsa_problems_difficulty", "difficulty"),
        Index("idx_dsa_problems_folder", "folder"),
        Index("idx_dsa_problems_tags", "tags", postgresql_using="gin"),
    )


class DsaDailyActivity(Base):
    __tablename__ = "dsa_daily_activity"

    date = Column(Date, primary_key=True)
    commit_count = Column(Integer, default=0)
    problems_added = Column(Integer, default=0)
    problems_modified = Column(Integer, default=0)


class DsaTopicStats(Base):
    __tablename__ = "dsa_topic_stats"

    folder = Column(String(255), primary_key=True)
    problem_count = Column(Integer, default=0)
    last_updated_file = Column(String(255))
    last_updated_at = Column(DateTime(timezone=True))


class DsaSyncState(Base):
    __tablename__ = "dsa_sync_state"

    id = Column(Integer, primary_key=True, default=1)
    last_commit_sha = Column(String(40))
    last_synced_at = Column(DateTime(timezone=True))
    total_commits_processed = Column(Integer, default=0)
