"""
Therapist feedback routes
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List
from datetime import datetime
from app.models import FeedbackCreate, FeedbackResponse
from app.database import get_supabase
from app.utils.auth import get_current_therapist, get_current_user
from app.utils.audit import log_audit_event
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("", response_model=FeedbackResponse)
async def create_feedback(
    feedback: FeedbackCreate,
    req: Request,
    current_user: dict = Depends(get_current_therapist)
):
    """Create feedback message from therapist to client"""
    try:
        supabase = get_supabase()
        therapist_id = current_user["id"]
        
        # Verify client exists
        client_result = supabase.table("users")\
            .select("id, role")\
            .eq("id", feedback.client_id)\
            .single()\
            .execute()
        
        if not client_result.data or client_result.data.get("role") != "client":
            raise HTTPException(status_code=404, detail="Client not found")
        
        # Verify entry exists if provided
        if feedback.entry_id:
            entry_result = supabase.table("journals")\
                .select("id, user_id")\
                .eq("id", feedback.entry_id)\
                .single()\
                .execute()
            
            if not entry_result.data:
                raise HTTPException(status_code=404, detail="Journal entry not found")
            
            if entry_result.data["user_id"] != feedback.client_id:
                raise HTTPException(status_code=400, detail="Entry does not belong to client")
        
        # Create feedback
        feedback_data = {
            "therapist_id": therapist_id,
            "client_id": feedback.client_id,
            "message": feedback.message,
            "entry_id": feedback.entry_id,
            "is_encouragement": feedback.is_encouragement,
            "created_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table("therapist_feedback").insert(feedback_data).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create feedback")
        
        created_feedback = result.data[0]
        
        # Log audit event
        log_audit_event(
            user_id=therapist_id,
            action="create",
            resource_type="feedback",
            resource_id=created_feedback["id"],
            ip_address=req.client.host if req.client else None,
            user_agent=req.headers.get("user-agent")
        )
        
        return FeedbackResponse(
            id=created_feedback["id"],
            therapist_id=created_feedback["therapist_id"],
            client_id=created_feedback["client_id"],
            message=created_feedback["message"],
            entry_id=created_feedback.get("entry_id"),
            is_encouragement=created_feedback.get("is_encouragement", True),
            created_at=datetime.fromisoformat(created_feedback["created_at"])
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating feedback: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create feedback")


@router.get("/me", response_model=List[FeedbackResponse])
async def get_my_feedback(
    current_user: dict = Depends(get_current_user)
):
    """Get feedback messages for current user (client)"""
    try:
        supabase = get_supabase()
        user_id = current_user["id"]
        user_role = current_user.get("role")
        
        if user_role == "client":
            # Client gets their feedback
            result = supabase.table("therapist_feedback")\
                .select("*")\
                .eq("client_id", user_id)\
                .order("created_at", desc=True)\
                .execute()
        elif user_role in ["therapist", "admin"]:
            # Therapist gets their sent feedback
            result = supabase.table("therapist_feedback")\
                .select("*")\
                .eq("therapist_id", user_id)\
                .order("created_at", desc=True)\
                .execute()
        else:
            raise HTTPException(status_code=403, detail="Invalid role")
        
        feedbacks = []
        if result.data:
            for fb in result.data:
                feedbacks.append(FeedbackResponse(
                    id=fb["id"],
                    therapist_id=fb["therapist_id"],
                    client_id=fb["client_id"],
                    message=fb["message"],
                    entry_id=fb.get("entry_id"),
                    is_encouragement=fb.get("is_encouragement", True),
                    created_at=datetime.fromisoformat(fb["created_at"])
                ))
        
        return feedbacks
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching feedback: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch feedback")

