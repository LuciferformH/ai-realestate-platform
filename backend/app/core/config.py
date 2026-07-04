from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Real Estate Insights Platform"
    API_V1_PREFIX: str = "/api/v1"
    DATABASE_URL: str = "sqlite:///./realestate.db"
    SECRET_KEY: str = "a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://ai-realestate-frontend.vercel.app",
        "https://ai-realestate-frontend-neon.vercel.app",
    ]
    OPENAI_API_KEY: str = ""
    ENVIRONMENT: str = "development"

    model_config = {
        "env_file": ".env",
        "case_sensitive": True,
    }

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def database_url_sync(self) -> str:
        url = self.DATABASE_URL
        if not url or not url.strip():
            return "sqlite:///./realestate.db"
        url = url.strip()
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        if url.startswith("postgresql://") and "+psycopg2" not in url:
            url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
        return url


settings = Settings()
