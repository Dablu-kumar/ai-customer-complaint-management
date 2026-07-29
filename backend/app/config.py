import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///C:/Users/dablu/.gemini/antigravity/scratch/aivoa-ai/database/aivoa.db"
    SECRET_KEY: str = "aivoa-secret-key-super-secure-change-it-in-prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    GROQ_API_KEY: str = ""
    UPLOAD_DIR: str = "C:/Users/dablu/.gemini/antigravity/scratch/aivoa-ai/uploads"
    
    # Advanced AI configs
    AI_PROVIDER: str = "Groq"
    AI_MODEL: str = "gemma2-9b-it"
    TEMPERATURE: float = 0.2
    MAX_TOKENS: int = 4096

    # Allow loading from a .env file
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

# Ensure uploads directories exist
os.makedirs(os.path.join(settings.UPLOAD_DIR, "pdf"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "images"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "emails"), exist_ok=True)
