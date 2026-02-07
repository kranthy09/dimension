class GitHubAPIError(Exception):
    """GitHub API related errors"""
    pass


class RateLimitError(Exception):
    """GitHub API rate limit exceeded"""
    pass
