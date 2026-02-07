import base64
import logging
import re
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from httpx import AsyncClient, HTTPStatusError

from app.config import get_settings
from app.core.exceptions import GitHubAPIError, RateLimitError

logger = logging.getLogger(__name__)

settings = get_settings()


class GitHubService:
    """
    Fetches DSA problems from a GitHub repository.

    Caching: Self-contained in-memory dict with TTL. This cache is isolated
    to this service — it does not interact with the existing content system,
    database, or any other part of the application.
    """

    def __init__(self):
        self.base_url = settings.GITHUB_API_BASE
        self.repo_owner = settings.GITHUB_REPO_OWNER
        self.repo_name = settings.GITHUB_REPO_NAME
        self.headers = {
            "Authorization": f"Bearer {settings.GITHUB_TOKEN}",
            "Accept": "application/vnd.github.v3+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._cache_ttl = timedelta(hours=1)

    # ── Cache helpers (private, isolated to this service) ──

    def _is_cache_valid(self, key: str) -> bool:
        if key not in self._cache:
            return False
        return datetime.now() < self._cache[key]["expires"]

    def _set_cache(self, key: str, data: Any) -> None:
        self._cache[key] = {
            "data": data,
            "expires": datetime.now() + self._cache_ttl,
        }

    def _get_cache(self, key: str) -> Optional[Any]:
        if self._is_cache_valid(key):
            return self._cache[key]["data"]
        return None

    # ── Public API ──

    async def check_connection(self) -> Dict[str, Any]:
        """Verify GitHub API connection and token validity."""
        try:
            async with AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/repos/{self.repo_owner}/{self.repo_name}",
                    headers=self.headers,
                    timeout=10.0,
                )
                response.raise_for_status()
                data = response.json()
                return {
                    "status": "connected",
                    "repo": data["full_name"],
                    "visibility": data["visibility"],
                    "last_updated": data["updated_at"],
                }
        except HTTPStatusError as e:
            if e.response.status_code == 401:
                raise GitHubAPIError("Invalid GitHub token")
            elif e.response.status_code == 404:
                raise GitHubAPIError("Repository not found")
            raise GitHubAPIError(f"GitHub API error: {e.response.status_code}")
        except Exception as e:
            raise GitHubAPIError(f"Connection failed: {str(e)}")

    async def _fetch_repository_tree(self) -> List[Dict[str, Any]]:
        """Fetch the full repository tree in a single API call."""
        cache_key = "repo_tree"
        cached = self._get_cache(cache_key)
        if cached is not None:
            return cached

        try:
            async with AsyncClient() as client:
                repo_response = await client.get(
                    f"{self.base_url}/repos/{self.repo_owner}/{self.repo_name}",
                    headers=self.headers,
                    timeout=10.0,
                )
                repo_response.raise_for_status()
                default_branch = repo_response.json()["default_branch"]

                tree_response = await client.get(
                    f"{self.base_url}/repos/{self.repo_owner}/{self.repo_name}"
                    f"/git/trees/{default_branch}?recursive=1",
                    headers=self.headers,
                    timeout=10.0,
                )
                tree_response.raise_for_status()
                tree_data = tree_response.json()["tree"]

                self._set_cache(cache_key, tree_data)
                return tree_data

        except HTTPStatusError as e:
            if e.response.status_code == 403:
                raise RateLimitError("GitHub API rate limit exceeded")
            raise GitHubAPIError(f"Failed to fetch repository tree: {e}")
        except Exception as e:
            raise GitHubAPIError(f"Unexpected error: {str(e)}")

    async def get_tree(self) -> List[Dict[str, Any]]:
        """Return the repository tree with only the fields the UI needs."""
        tree = await self._fetch_repository_tree()
        return [
            {
                "path": item["path"],
                "type": item["type"],
                "sha": item["sha"],
                "size": item.get("size"),
            }
            for item in tree
        ]

    def _extract_metadata(self, code_content: str) -> Dict[str, Any]:
        """
        Extract metadata from code comments in the first 20 lines.
        Returns defaults for any missing fields.
        """
        metadata: Dict[str, Any] = {
            "difficulty": "Medium",
            "tags": [],
            "time_complexity": None,
            "space_complexity": None,
            "leetcode_link": None,
        }

        header = "\n".join(code_content.split("\n")[:20])

        patterns = {
            "difficulty": r"@difficulty:\s*(\w+)",
            "tags": r"@tags:\s*(.+)",
            "time": r"@time:\s*(.+)",
            "space": r"@space:\s*(.+)",
            "leetcode": r"@leetcode:\s*(https?://\S+)",
        }

        for key, pattern in patterns.items():
            match = re.search(pattern, header, re.IGNORECASE)
            if match:
                value = match.group(1).strip()
                if key == "tags":
                    metadata["tags"] = [t.strip() for t in value.split(",")]
                elif key == "time":
                    metadata["time_complexity"] = value
                elif key == "space":
                    metadata["space_complexity"] = value
                elif key == "leetcode":
                    metadata["leetcode_link"] = value
                else:
                    metadata[key] = value

        return metadata

    async def get_file_content(self, file_path: str) -> Dict[str, Any]:
        """Fetch and decode a file from the repository by its path."""
        cache_key = f"file_{file_path}"
        cached = self._get_cache(cache_key)
        if cached is not None:
            return cached

        try:
            async with AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/repos/{self.repo_owner}/{self.repo_name}"
                    f"/contents/{file_path}",
                    headers=self.headers,
                    timeout=10.0,
                )
                response.raise_for_status()
                data = response.json()

                code_content = base64.b64decode(
                    data["content"]).decode("utf-8")
                metadata = self._extract_metadata(code_content)

                file_name = file_path.split("/")[-1]
                file_base = file_name.rsplit(
                    ".", 1)[0] if "." in file_name else file_name

                result = {
                    "path": file_path,
                    "name": file_base.replace("_", " ").title(),
                    "file_name": file_name,
                    "code": code_content,
                    "language": file_name.rsplit(".", 1)[1] if "." in file_name else "",
                    "size": data["size"],
                    "sha": data["sha"],
                    "github_url": data["html_url"],
                    "metadata": metadata,
                }

                self._set_cache(cache_key, result)
                return result

        except HTTPStatusError as e:
            if e.response.status_code == 404:
                raise GitHubAPIError(f"File not found: {file_path}")
            elif e.response.status_code == 403:
                raise RateLimitError("GitHub API rate limit exceeded")
            raise GitHubAPIError(f"Failed to fetch file content: {e}")
        except Exception as e:
            raise GitHubAPIError(f"Unexpected error: {str(e)}")

    def clear_cache(self) -> Dict[str, str]:
        """Clear all cached GitHub data."""
        cache_size = len(self._cache)
        self._cache.clear()
        logger.info("GitHub cache cleared (%d entries removed)", cache_size)
        return {"message": f"Cache cleared ({cache_size} entries removed)"}


# Singleton — isolated from the rest of the application
github_service = GitHubService()
