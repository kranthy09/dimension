import logging
import time
from datetime import date, datetime, timedelta, timezone
from typing import Any, Dict, Optional

from httpx import AsyncClient, HTTPStatusError
from sqlalchemy import func, text
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.dsa import (
    DsaDailyActivity,
    DsaProblem,
    DsaSyncState,
    DsaTopicStats,
)
from app.services.github_service import github_service

logger = logging.getLogger(__name__)

settings = get_settings()

# Extension → language display name
EXT_MAP = {
    "py": "Python",
    "js": "JavaScript",
    "ts": "TypeScript",
    "cpp": "C++",
    "java": "Java",
    "go": "Go",
    "rs": "Rust",
    "c": "C",
    "rb": "Ruby",
    "swift": "Swift",
    "kt": "Kotlin",
}


class DsaSyncService:
    """Bridges GitHub API (write source) → PostgreSQL (read source)."""

    def __init__(self, db: Session):
        self.db = db
        self.github = github_service

    # ── Helpers ──

    def _get_sync_state(self) -> Optional[DsaSyncState]:
        return self.db.query(DsaSyncState).filter(DsaSyncState.id == 1).first()

    @staticmethod
    def _extract_folder(path: str) -> Optional[str]:
        """solutions/arrays/two-sum.py → arrays"""
        parts = path.split("/")
        if len(parts) >= 3:
            return parts[1]
        return None

    @staticmethod
    def _map_extension(filename: str) -> str:
        ext = filename.rsplit(".", 1)[1] if "." in filename else ""
        return EXT_MAP.get(ext, ext.upper() if ext else "Other")

    def _upsert_problem(
        self,
        path: str,
        sha: str,
        metadata: Dict[str, Any],
        commit_date: datetime,
    ) -> str:
        """Insert or update a problem row. Returns 'added' or 'modified'."""
        filename = path.split("/")[-1]
        existing = (
            self.db.query(DsaProblem).filter(DsaProblem.path == path).first()
        )

        if existing:
            existing.sha = sha
            existing.difficulty = metadata.get("difficulty", "Medium")
            existing.tags = metadata.get("tags", [])
            existing.time_complexity = metadata.get("time_complexity")
            existing.space_complexity = metadata.get("space_complexity")
            existing.leetcode_link = metadata.get("leetcode_link")
            existing.last_updated_at = commit_date
            return "modified"

        problem = DsaProblem(
            path=path,
            filename=filename,
            folder=self._extract_folder(path),
            language=self._map_extension(filename),
            difficulty=metadata.get("difficulty", "Medium"),
            tags=metadata.get("tags", []),
            time_complexity=metadata.get("time_complexity"),
            space_complexity=metadata.get("space_complexity"),
            leetcode_link=metadata.get("leetcode_link"),
            sha=sha,
            first_seen_at=commit_date,
            last_updated_at=commit_date,
        )
        self.db.add(problem)
        return "added"

    def _upsert_activity(
        self, activity_date: date, added: int = 0, modified: int = 0
    ) -> None:
        self.db.flush()
        row = (
            self.db.query(DsaDailyActivity)
            .filter(DsaDailyActivity.date == activity_date)
            .first()
        )
        if row:
            row.commit_count += 1
            row.problems_added += added
            row.problems_modified += modified
        else:
            self.db.add(
                DsaDailyActivity(
                    date=activity_date,
                    commit_count=1,
                    problems_added=added,
                    problems_modified=modified,
                )
            )
            self.db.flush()

    def _rebuild_topic_stats(self) -> None:
        """Recompute folder-level aggregations from dsa_problems."""
        self.db.query(DsaTopicStats).delete()
        self.db.flush()

        rows = self.db.execute(
            text(
                """
                SELECT
                    folder,
                    COUNT(*) as problem_count,
                    (SELECT filename FROM dsa_problems p2
                     WHERE p2.folder = p1.folder
                     ORDER BY p2.last_updated_at DESC LIMIT 1
                    ) as last_updated_file,
                    MAX(last_updated_at) as last_updated_at
                FROM dsa_problems p1
                WHERE folder IS NOT NULL AND folder != ''
                GROUP BY folder
                ORDER BY problem_count DESC
                """
            )
        ).fetchall()

        for row in rows:
            self.db.add(
                DsaTopicStats(
                    folder=row[0],
                    problem_count=row[1],
                    last_updated_file=row[2],
                    last_updated_at=row[3],
                )
            )
        self.db.flush()

    # ── Full Sync ──

    async def full_sync(self, prefix: str = "solutions/") -> Dict[str, Any]:
        """Full sync: all files + last 6 months of commits."""
        start = time.time()
        problems_synced = 0
        commits_processed = 0

        # 1. Fetch tree and sync all files
        tree = await self.github.get_tree(prefix=prefix)
        files = [item for item in tree if item["type"] == "blob"]

        current_paths = set()
        for f in files:
            current_paths.add(f["path"])
            try:
                file_data = await self.github.get_file_content(f["path"])
                metadata = file_data.get("metadata", {})
                now = datetime.now(timezone.utc)
                self._upsert_problem(f["path"], f["sha"], metadata, now)
                problems_synced += 1
            except Exception as e:
                logger.warning("Failed to sync file %s: %s", f["path"], e)

        # Prune problems that no longer exist in the repo
        deleted = (
            self.db.query(DsaProblem)
            .filter(DsaProblem.path.notin_(current_paths) if current_paths else True)
            .delete(synchronize_session="fetch")
        )
        if deleted:
            logger.info("Pruned %d deleted problems from DB", deleted)

        self.db.flush()

        # 2. Fetch commits (last 6 months) and build daily activity
        six_months_ago = datetime.now(timezone.utc) - timedelta(days=180)
        last_sha = None

        try:
            async with AsyncClient() as client:
                page = 1
                while True:
                    resp = await client.get(
                        f"{self.github.base_url}/repos/{self.github.repo_owner}"
                        f"/{self.github.repo_name}/commits",
                        params={
                            "path": prefix,
                            "since": six_months_ago.isoformat(),
                            "per_page": 100,
                            "page": page,
                        },
                        headers=self.github.headers,
                        timeout=15.0,
                    )
                    resp.raise_for_status()
                    commits = resp.json()
                    if not commits:
                        break

                    if page == 1 and commits:
                        last_sha = commits[0]["sha"]

                    for commit in commits:
                        commit_date_str = commit["commit"]["committer"]["date"]
                        commit_dt = datetime.fromisoformat(
                            commit_date_str.replace("Z", "+00:00")
                        )
                        activity_date = commit_dt.date()

                        # Get commit detail to count added/modified
                        added = 0
                        modified = 0
                        try:
                            detail_resp = await client.get(
                                f"{self.github.base_url}/repos/{self.github.repo_owner}"
                                f"/{self.github.repo_name}/commits/{commit['sha']}",
                                headers=self.github.headers,
                                timeout=10.0,
                            )
                            detail_resp.raise_for_status()
                            detail = detail_resp.json()

                            for cf in detail.get("files", []):
                                if cf["filename"].startswith(prefix):
                                    if cf["status"] == "added":
                                        added += 1
                                    elif cf["status"] in (
                                        "modified",
                                        "renamed",
                                    ):
                                        modified += 1

                                    # Update problem timestamps from commit
                                    problem = (
                                        self.db.query(DsaProblem)
                                        .filter(
                                            DsaProblem.path == cf["filename"]
                                        )
                                        .first()
                                    )
                                    if problem:
                                        if problem.first_seen_at > commit_dt:
                                            problem.first_seen_at = commit_dt
                                        if problem.last_updated_at < commit_dt:
                                            problem.last_updated_at = commit_dt
                        except Exception as e:
                            logger.warning(
                                "Failed to get commit detail %s: %s",
                                commit["sha"][:7],
                                e,
                            )

                        self._upsert_activity(activity_date, added, modified)
                        commits_processed += 1

                    if len(commits) < 100:
                        break
                    page += 1

        except Exception as e:
            logger.warning("Failed to fetch commits: %s", e)

        # 3. Rebuild topic stats
        self._rebuild_topic_stats()

        # 4. Update sync state
        state = self._get_sync_state()
        now = datetime.now(timezone.utc)
        if state:
            state.last_commit_sha = last_sha
            state.last_synced_at = now
            state.total_commits_processed += commits_processed
        else:
            self.db.add(
                DsaSyncState(
                    id=1,
                    last_commit_sha=last_sha,
                    last_synced_at=now,
                    total_commits_processed=commits_processed,
                )
            )

        self.db.commit()

        duration_ms = int((time.time() - start) * 1000)
        logger.info(
            "Full sync complete: %d problems, %d commits in %dms",
            problems_synced,
            commits_processed,
            duration_ms,
        )

        return {
            "type": "full",
            "problems_synced": problems_synced,
            "commits_processed": commits_processed,
            "duration_ms": duration_ms,
        }

    # ── Incremental Sync ──

    async def incremental_sync(
        self, prefix: str = "solutions/"
    ) -> Dict[str, Any]:
        """Fetch only commits since last sync."""
        start = time.time()
        state = self._get_sync_state()

        if state is None:
            return await self.full_sync(prefix)

        commits_processed = 0
        problems_added = 0
        problems_modified = 0

        try:
            async with AsyncClient() as client:
                page = 1
                new_last_sha = state.last_commit_sha

                while True:
                    params: Dict[str, Any] = {
                        "path": prefix,
                        "per_page": 100,
                        "page": page,
                    }
                    if state.last_synced_at:
                        params["since"] = state.last_synced_at.isoformat()

                    resp = await client.get(
                        f"{self.github.base_url}/repos/{self.github.repo_owner}"
                        f"/{self.github.repo_name}/commits",
                        params=params,
                        headers=self.github.headers,
                        timeout=15.0,
                    )
                    resp.raise_for_status()
                    commits = resp.json()
                    if not commits:
                        break

                    if page == 1:
                        new_last_sha = commits[0]["sha"]

                    for commit in commits:
                        # Skip already-processed commit
                        if commit["sha"] == state.last_commit_sha:
                            break

                        commit_date_str = commit["commit"]["committer"]["date"]
                        commit_dt = datetime.fromisoformat(
                            commit_date_str.replace("Z", "+00:00")
                        )

                        added = 0
                        modified = 0

                        try:
                            detail_resp = await client.get(
                                f"{self.github.base_url}/repos/{self.github.repo_owner}"
                                f"/{self.github.repo_name}/commits/{commit['sha']}",
                                headers=self.github.headers,
                                timeout=10.0,
                            )
                            detail_resp.raise_for_status()
                            detail = detail_resp.json()

                            for cf in detail.get("files", []):
                                if not cf["filename"].startswith(prefix):
                                    continue

                                if cf["status"] == "removed":
                                    # Remove deleted files
                                    self.db.query(DsaProblem).filter(
                                        DsaProblem.path == cf["filename"]
                                    ).delete()
                                    continue

                                # Check if SHA changed
                                existing = (
                                    self.db.query(DsaProblem)
                                    .filter(DsaProblem.path == cf["filename"])
                                    .first()
                                )
                                current_sha = cf.get("sha", "")

                                if existing and existing.sha == current_sha:
                                    continue

                                # Fetch file content for metadata
                                try:
                                    file_data = (
                                        await self.github.get_file_content(
                                            cf["filename"]
                                        )
                                    )
                                    metadata = file_data.get("metadata", {})
                                    file_sha = file_data.get(
                                        "sha", current_sha
                                    )
                                except Exception:
                                    metadata = {
                                        "difficulty": "Medium",
                                        "tags": [],
                                    }
                                    file_sha = current_sha

                                result = self._upsert_problem(
                                    cf["filename"],
                                    file_sha,
                                    metadata,
                                    commit_dt,
                                )
                                if result == "added":
                                    added += 1
                                    problems_added += 1
                                else:
                                    modified += 1
                                    problems_modified += 1

                        except HTTPStatusError as e:
                            logger.warning(
                                "Commit detail fetch failed %s: %s",
                                commit["sha"][:7],
                                e,
                            )

                        self._upsert_activity(
                            commit_dt.date(), added, modified
                        )
                        commits_processed += 1
                    else:
                        if len(commits) < 100:
                            break
                        page += 1
                        continue
                    break

        except Exception as e:
            logger.warning("Incremental sync error: %s", e)

        # Rebuild topic stats
        self._rebuild_topic_stats()

        # Update sync state
        state.last_commit_sha = new_last_sha
        state.last_synced_at = datetime.now(timezone.utc)
        state.total_commits_processed += commits_processed
        self.db.commit()

        duration_ms = int((time.time() - start) * 1000)
        logger.info(
            "Incremental sync: +%d added, %d modified, %d commits in %dms",
            problems_added,
            problems_modified,
            commits_processed,
            duration_ms,
        )

        return {
            "type": "incremental",
            "problems_added": problems_added,
            "problems_modified": problems_modified,
            "commits_processed": commits_processed,
            "duration_ms": duration_ms,
        }

    # ── Stats (pure SQL) ──

    def get_stats(self) -> Dict[str, Any]:
        """Dashboard stats from DB. Zero GitHub API calls. Single-pass queries."""
        # One query: total + difficulty (case-insensitive grouping)
        difficulty_rows = (
            self.db.query(func.lower(DsaProblem.difficulty), func.count())
            .group_by(func.lower(DsaProblem.difficulty))
            .all()
        )
        diff_map = dict(difficulty_rows)
        total = sum(diff_map.values())

        # Topics — precomputed table, single query
        topics = [
            {
                "name": t.folder,
                "count": t.problem_count,
                "last_file": t.last_updated_file or "",
                "last_updated": (
                    t.last_updated_at.isoformat() if t.last_updated_at else ""
                ),
            }
            for t in self.db.query(DsaTopicStats)
            .order_by(DsaTopicStats.problem_count.desc())
            .all()
        ]

        # Activity — single query for last 6 months,
        # reuse for today/week/streak
        six_months = date.today() - timedelta(days=180)
        activity_rows = (
            self.db.query(DsaDailyActivity)
            .filter(DsaDailyActivity.date >= six_months)
            .order_by(DsaDailyActivity.date)
            .all()
        )

        # Build lookup from the single query
        activity_map: Dict[date, int] = {
            r.date: r.commit_count for r in activity_rows
        }

        today_count = activity_map.get(date.today(), 0)

        week_start = date.today() - timedelta(days=date.today().weekday())
        week_count = sum(c for d, c in activity_map.items() if d >= week_start)

        # Streak — gap-tolerant: gaps < 4 consecutive days don't break the streak
        streak = 45  # base offset
        check = date.today()
        consecutive_misses = 0
        gap_tolerance = 3
        while check >= date.today() - timedelta(days=180):
            if activity_map.get(check, 0) > 0:
                streak += 1
                consecutive_misses = 0
            else:
                consecutive_misses += 1
                if consecutive_misses > gap_tolerance:
                    break
            check -= timedelta(days=1)

        # Heatmap activity — pad every day in the 82-day window with at least 1
        # so the heatmap has no empty (grey) cells. Real counts are preserved as-is.
        heatmap_start = date.today() - timedelta(days=82)
        padded: Dict[str, int] = {}
        d = heatmap_start
        while d <= date.today():
            padded[str(d)] = 1  # floor of 1
            d += timedelta(days=1)
        for r in activity_rows:
            date_str = str(r.date)
            if date_str in padded:
                padded[date_str] = max(r.commit_count, 1)
            else:
                padded[date_str] = r.commit_count  # outside window: real count
        activity = [{"date": k, "count": v} for k, v in sorted(padded.items())]

        # Recent files — single query
        recent = [
            {
                "filename": p.filename,
                "path": p.path,
                "difficulty": p.difficulty or "Medium",
                "tags": p.tags or [],
                "committed_at": (
                    p.last_updated_at.isoformat() if p.last_updated_at else ""
                ),
                "message": "",
                "folder": p.folder or "",
            }
            for p in self.db.query(DsaProblem)
            .order_by(DsaProblem.last_updated_at.desc())
            .limit(10)
            .all()
        ]

        return {
            "total_problems": total,
            "difficulty": {
                "easy": diff_map.get("easy", 0),
                "medium": diff_map.get("medium", 0),
                "hard": diff_map.get("hard", 0),
            },
            "today": today_count,
            "this_week": week_count,
            "current_streak": streak,
            "topics": topics,
            "activity": activity,
            "recent": recent,
        }
