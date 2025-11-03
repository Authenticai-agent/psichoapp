"""
Journal entry routes
"""

from fastapi import APIRouter, HTTPException, status, Depends, Request
from typing import List
from datetime import datetime
from app.models import JournalEntryCreate, JournalEntryResponse
from app.database import get_supabase
from app.utils.auth import get_current_client, get_current_user
from app.utils.audit import log_audit_event
from app.services.ai_service import analyze_mood
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("", response_model=JournalEntryResponse)
async def create_journal_entry(
    entry: JournalEntryCreate,
    req: Request,
    current_user: dict = Depends(get_current_client)
):
    """Create a new journal entry"""
    try:
        supabase = get_supabase()
        user_id = current_user["id"]
        
        # Analyze mood if not provided
        mood = entry.mood
        ai_analysis = None
        
        if not mood or entry.content:
            # Run AI analysis
            analysis = analyze_mood(entry.content)
            mood = analysis.mood
            ai_analysis = {
                "mood": analysis.mood.value,
                "sentiment": analysis.sentiment,
                "summary": analysis.summary,
                "keywords": analysis.keywords,
                "recommendations": analysis.recommendations,
                "confidence": analysis.confidence
            }
        
        # Create journal entry
        entry_data = {
            "user_id": user_id,
            "content": entry.content,
            "mood": mood.value if mood else None,
            "tags": entry.tags or [],
            "is_voice": entry.is_voice,
            "ai_analysis": ai_analysis,
            "created_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table("journals").insert(entry_data).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create journal entry"
            )
        
        created_entry = result.data[0]
        
        # Log audit event
        log_audit_event(
            user_id=user_id,
            action="create",
            resource_type="journal",
            resource_id=created_entry["id"],
            ip_address=req.client.host if req.client else None,
            user_agent=req.headers.get("user-agent")
        )
        
        return JournalEntryResponse(
            id=created_entry["id"],
            user_id=created_entry["user_id"],
            content=created_entry["content"],
            mood=mood,
            tags=created_entry.get("tags"),
            is_voice=created_entry.get("is_voice", False),
            created_at=datetime.fromisoformat(created_entry["created_at"]),
            ai_analysis=created_entry.get("ai_analysis")
        )
        
    except Exception as e:
        logger.error(f"Error creating journal entry: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create journal entry: {str(e)}"
        )


@router.get("/me", response_model=List[JournalEntryResponse])
async def get_my_journals(
    current_user: dict = Depends(get_current_client),
    limit: int = 50,
    offset: int = 0
):
    """Get current user's journal entries"""
    try:
        supabase = get_supabase()
        user_id = current_user["id"]
        
        result = supabase.table("journals")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .limit(limit)\
            .offset(offset)\
            .execute()
        
        entries = []
        for entry in result.data:
            entries.append(JournalEntryResponse(
                id=entry["id"],
                user_id=entry["user_id"],
                content=entry["content"],
                mood=entry.get("mood"),
                tags=entry.get("tags"),
                is_voice=entry.get("is_voice", False),
                created_at=datetime.fromisoformat(entry["created_at"]),
                ai_analysis=entry.get("ai_analysis")
            ))
        
        return entries
        
    except Exception as e:
        logger.error(f"Error fetching journal entries: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch journal entries"
        )


@router.get("/{entry_id}", response_model=JournalEntryResponse)
async def get_journal_entry(
    entry_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific journal entry"""
    try:
        supabase = get_supabase()
        user_id = current_user["id"]
        user_role = current_user.get("role")
        
        result = supabase.table("journals")\
            .select("*")\
            .eq("id", entry_id)\
            .execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Journal entry not found"
            )
        
        entry = result.data[0]
        
        # Check access: client can only access their own, therapist can access their clients
        if user_role == "client" and entry["user_id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        return JournalEntryResponse(
            id=entry["id"],
            user_id=entry["user_id"],
            content=entry["content"],
            mood=entry.get("mood"),
            tags=entry.get("tags"),
            is_voice=entry.get("is_voice", False),
            created_at=datetime.fromisoformat(entry["created_at"]),
            ai_analysis=entry.get("ai_analysis")
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching journal entry: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch journal entry"
        )

