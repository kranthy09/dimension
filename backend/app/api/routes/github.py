import hashlib
import hmac
import logging

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.config import get_settings
from app.core.exceptions import GitHubAPIError, RateLimitError
from app.database import SessionLocal, get_db
from app.services.dsa_sync_service import DsaSyncService
from app.services.github_service import github_service

logger = logging.getLogger(__name__)
settings = get_settings()

router = APIRouter(prefix="/github", tags=["GitHub DSA"])


@router.get("/health")
async def check_github_connection():
    """Check GitHub API connection status."""
    try:
        return await github_service.check_connection()
    except GitHubAPIError as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.get("/dsa/tree")
async def get_dsa_tree(prefix: str = "solutions/"):
    """Return the repository tree filtered by prefix."""
    try:
        tree = await github_service.get_tree(prefix=prefix)
        return {"tree": tree}
    except RateLimitError:
        raise HTTPException(
            status_code=429,
            detail="GitHub API rate limit exceeded.",
        )
    except GitHubAPIError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/dsa/latest")
async def get_latest_file():
    """Return the most recently committed file under solutions/."""
    try:
        result = await github_service.get_latest_file()
        if result is None:
            raise HTTPException(
                status_code=404,
                detail="No files found in solutions/",
            )
        return result
    except RateLimitError:
        raise HTTPException(
            status_code=429, detail="Rate limit exceeded"
        )
    except GitHubAPIError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/dsa/stats")
def get_dsa_stats(db: Session = Depends(get_db)):
    """Return aggregated DSA dashboard statistics from DB."""
    service = DsaSyncService(db)
    return service.get_stats()


@router.post("/dsa/sync")
async def trigger_sync(db: Session = Depends(get_db)):
    """Trigger incremental sync (commits since last sync)."""
    service = DsaSyncService(db)
    return await service.incremental_sync()


@router.post("/dsa/sync/full")
async def trigger_full_sync(db: Session = Depends(get_db)):
    """Trigger full re-sync of all files and commits."""
    service = DsaSyncService(db)
    return await service.full_sync()


@router.get("/dsa/file/{file_path:path}")
async def get_file_content(file_path: str):
    """Fetch content of a single file by its repo-relative path."""
    try:
        return await github_service.get_file_content(file_path)
    except RateLimitError:
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    except GitHubAPIError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/dsa/cache/clear")
async def clear_cache():
    """Clear the GitHub API response cache."""
    return github_service.clear_cache()


@router.post("/webhook")
async def github_webhook(request: Request):
    """Handle GitHub push webhooks to trigger incremental sync."""
    # Validate webhook secret
    secret = settings.GITHUB_WEBHOOK_SECRET
    if not secret:
        raise HTTPException(status_code=500, detail="Webhook secret not configured")

    body = await request.body()
    signature = request.headers.get("X-Hub-Signature-256")
    if not signature:
        raise HTTPException(status_code=400, detail="Missing signature header")

    expected = "sha256=" + hmac.new(
        secret.encode(), body, hashlib.sha256
    ).hexdigest()
    if not hmac.compare_digest(signature, expected):
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Only process push events
    event = request.headers.get("X-GitHub-Event", "")
    if event == "ping":
        return {"status": "pong"}
    if event != "push":
        return {"status": "ignored", "event": event}

    payload = await request.json()

    # Check if any changed files are under solutions/
    commits = payload.get("commits", [])
    has_solutions = any(
        f.startswith("solutions/")
        for commit in commits
        for f in commit.get("added", [])
        + commit.get("modified", [])
        + commit.get("removed", [])
    )

    if not has_solutions:
        return {"status": "ignored", "reason": "no solutions/ changes"}

    # Run incremental sync in background (don't block the webhook response)
    import asyncio

    async def _background_sync():
        db = SessionLocal()
        try:
            service = DsaSyncService(db)
            result = await service.incremental_sync()
            logger.info("Webhook sync complete: %s", result)
        except Exception as e:
            logger.error("Webhook sync failed: %s", e)
        finally:
            db.close()

    asyncio.create_task(_background_sync())

    return {"status": "syncing"}
