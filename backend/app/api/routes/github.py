from fastapi import APIRouter, HTTPException

from app.services.github_service import github_service
from app.core.exceptions import GitHubAPIError, RateLimitError

router = APIRouter(prefix="/github", tags=["GitHub DSA"])


@router.get("/health")
async def check_github_connection():
    """Check GitHub API connection status."""
    try:
        return await github_service.check_connection()
    except GitHubAPIError as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.get("/dsa/tree")
async def get_dsa_tree():
    """Return the raw repository tree for the explorer UI."""
    try:
        tree = await github_service.get_tree()
        return {"tree": tree}
    except RateLimitError:
        raise HTTPException(
            status_code=429,
            detail="GitHub API rate limit exceeded. Please try again later.",
        )
    except GitHubAPIError as e:
        raise HTTPException(status_code=500, detail=str(e))


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
