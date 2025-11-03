"""
Configuration settings for the application
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings"""
    
    # Supabase
    supabase_url: str
    supabase_key: str
    supabase_service_key: str
    
    # Gemini AI
    gemini_api_key: str
    
    # JWT
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 12
    
    # Environment
    environment: str = "development"
    
    # CORS
    cors_origins: List[str] = ["http://localhost:5173"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

