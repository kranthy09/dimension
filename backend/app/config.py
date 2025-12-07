from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Database
    # Default is for local development only - override with environment variable
    DATABASE_URL: str = "postgresql://portfolio:portfolio_pass@db:5432/portfolio"

    # File Storage
    MEDIA_ROOT: str = "/app/media"
    MARKDOWN_DIR: str = "markdown"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB

    # API
    API_V1_PREFIX: str = "/api/v1"
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings()
