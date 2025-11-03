"""
Configuration settings for the application
"""

from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # Supabase
    supabase_url: str
    supabase_key: str
    supabase_service_key: str
    
    # Gemini AI
    gemini_api_key: str
    gemini_model: str = "gemini-1.5-flash"  # Cheapest model: gemini-1.5-flash (free tier available)
    
    # JWT
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 12
    
    # Environment
    environment: str = "development"
    
    # CORS - handle as string and parse manually
    # Don't use List[str] here as pydantic_settings tries to parse as JSON
    cors_origins_str: str = "http://localhost:5173,http://localhost:3000"
    
    @property
    def cors_origins(self) -> List[str]:
        """Parse CORS origins from comma-separated string"""
        origins_str = os.getenv("CORS_ORIGINS", self.cors_origins_str)
        # Split by comma and strip whitespace
        origins = [origin.strip() for origin in origins_str.split(",") if origin.strip()]
        # Add default Netlify domain if in production
        if self.environment == "production":
            default_netlify = "https://psichoapp.netlify.app"
            if default_netlify not in origins:
                origins.append(default_netlify)
        return origins
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

