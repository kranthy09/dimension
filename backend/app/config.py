import os

from pydantic_settings import BaseSettings
from functools import lru_cache


class BaseConfig(BaseSettings):
    """Shared settings loaded from .env — all environments inherit these."""

    # Environment
    FASTAPI_CONFIG: str = "development"

    # Postgres (individual vars used by docker-compose)
    POSTGRES_USER: str = "portfolio"
    POSTGRES_PASSWORD: str = "portfolio_pass"
    POSTGRES_DB: str = "portfolio"

    # Database (composed from individual vars if not set explicitly)
    DATABASE_URL: str = ""

    # File Storage
    MEDIA_ROOT: str = "/app/media"
    MARKDOWN_DIR: str = "markdown"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB

    # API
    API_V1_PREFIX: str = "/api/v1"
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # GitHub Integration
    GITHUB_TOKEN: str = ""
    GITHUB_REPO_OWNER: str = ""
    GITHUB_REPO_NAME: str = ""
    GITHUB_API_BASE: str = "https://api.github.com"
    GITHUB_WEBHOOK_SECRET: str = ""

    # Security
    SECRET_KEY: str = "dev-only-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    class Config:
        env_file = ".env"
        extra = "ignore"

    def model_post_init(self, __context):
        if not self.DATABASE_URL:
            self.DATABASE_URL = (
                f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
                f"@db:5432/{self.POSTGRES_DB}"
            )


class DevelopmentConfig(BaseConfig):
    DEBUG: bool = True


class ProductionConfig(BaseConfig):
    DEBUG: bool = False

    def model_post_init(self, __context):
        super().model_post_init(__context)
        if self.SECRET_KEY == "dev-only-key-change-in-production":
            raise ValueError(
                "SECRET_KEY must be set to a real value in production"
            )


class TestingConfig(BaseConfig):
    DEBUG: bool = True
    DATABASE_URL: str = "sqlite:///./test.db"
    SECRET_KEY: str = "test-secret-key"


@lru_cache()
def get_settings() -> BaseConfig:
    config_map = {
        "development": DevelopmentConfig,
        "production": ProductionConfig,
        "testing": TestingConfig,
    }
    config_name = os.environ.get("FASTAPI_CONFIG", "development")
    config_cls = config_map.get(config_name, DevelopmentConfig)
    return config_cls()
