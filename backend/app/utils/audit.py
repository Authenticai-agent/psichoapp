"""
Audit logging utilities for compliance
"""

from datetime import datetime
from typing import Optional
from app.database import get_supabase
import logging

logger = logging.getLogger(__name__)


def log_audit_event(
    user_id: str,
    action: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None
):
    """Log an audit event to the database"""
    try:
        supabase = get_supabase()
        supabase.table("audit_log").insert({
            "user_id": user_id,
            "action": action,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "timestamp": datetime.utcnow().isoformat(),
            "ip_address": ip_address,
            "user_agent": user_agent
        }).execute()
    except Exception as e:
        logger.error(f"Failed to log audit event: {str(e)}")


def log_access_event(
    therapist_id: str,
    client_id: str,
    ip_address: Optional[str] = None
):
    """Log therapist access to client data"""
    try:
        supabase = get_supabase()
        supabase.table("access_log").insert({
            "therapist_id": therapist_id,
            "client_id": client_id,
            "timestamp": datetime.utcnow().isoformat(),
            "ip_address": ip_address
        }).execute()
    except Exception as e:
        logger.error(f"Failed to log access event: {str(e)}")


def log_error_event(
    user_id: Optional[str],
    error_type: str,
    error_message: str,
    sanitized: bool = True
):
    """Log error events (sanitized to remove sensitive data)"""
    try:
        supabase = get_supabase()
        supabase.table("error_log").insert({
            "user_id": user_id,
            "error_type": error_type,
            "error_message": error_message,
            "sanitized": sanitized,
            "timestamp": datetime.utcnow().isoformat()
        }).execute()
    except Exception as e:
        logger.error(f"Failed to log error event: {str(e)}")

