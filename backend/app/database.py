"""
Database connection and initialization
"""

from supabase import create_client, Client
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Initialize Supabase client
supabase: Client = create_client(settings.supabase_url, settings.supabase_service_key)

# Supabase client for user operations (with anon key)
supabase_client: Client = create_client(settings.supabase_url, settings.supabase_key)


def init_db():
    """Initialize database connection and verify schema"""
    try:
        # Test connection by querying a simple table
        result = supabase.table("users").select("id").limit(1).execute()
        logger.info("Database connection successful")
        return True
    except Exception as e:
        logger.error(f"Database initialization failed: {str(e)}")
        return False


def get_supabase() -> Client:
    """Get Supabase client with service key (admin operations)"""
    return supabase


def get_supabase_client() -> Client:
    """Get Supabase client with anon key (user operations)"""
    return supabase_client

