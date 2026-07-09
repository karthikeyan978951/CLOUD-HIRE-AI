import os
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    # App General Settings
    APP_NAME: str = "CloudHire AI"
    DEBUG: bool = True
    
    # Security/JWT Settings
    SECRET_KEY: str = Field(default="super_secret_jwt_signing_key_change_me_in_production", env="SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # Database Settings (Fallback to SQLite in workspace for local development)
    DATABASE_URL: str = Field(default="sqlite:///./cloudhire.db", env="DATABASE_URL")
    
    # AWS S3 Settings (Optional: falls back to local storage if keys are empty)
    AWS_ACCESS_KEY_ID: str = Field(default="", env="AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY: str = Field(default="", env="AWS_SECRET_ACCESS_KEY")
    AWS_STORAGE_BUCKET_NAME: str = Field(default="", env="AWS_STORAGE_BUCKET_NAME")
    AWS_REGION: str = Field(default="us-east-1", env="AWS_REGION")
    
    # Local Storage Settings
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
    
    # Rate Limiting Settings
    RATE_LIMIT_LIMIT: int = 60  # requests
    RATE_LIMIT_PERIOD: int = 60 # seconds (1 minute)

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

# Ensure local upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
