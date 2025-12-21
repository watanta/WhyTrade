from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # プロジェクト情報
    PROJECT_NAME: str = "WhyTrade API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
    # CORS設定
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://frontend:3000"]
    
    # データベース設定
    POSTGRES_SERVER: str = "db"
    POSTGRES_USER: str = "whytrade_user"
    POSTGRES_PASSWORD: str = "whytrade_password"
    POSTGRES_DB: str = "whytrade"
    
    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}/{self.POSTGRES_DB}"
    
    # JWT設定
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
