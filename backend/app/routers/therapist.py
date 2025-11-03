"""
Therapist dashboard and analytics routes
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List
from datetime import datetime, timedelta
from app.models import TherapistDashboardResponse, ClientSummary, JournalEntryResponse
from app.database import get_supabase
from app.utils.auth import get_current_therapist
from app.utils.audit import log_access_event
from collections import defaultdict
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/dashboard", response_model=TherapistDashboardResponse)
async def get_therapist_dashboard(
    req: Request,
    current_user: dict = Depends(get_current_therapist)
):
    """Get therapist dashboard with summary metrics"""
    try:
        supabase = get_supabase()
        therapist_id = current_user["id"]
        
        # Get all clients (for MVP, assume therapist-client relationship via a junction table)
        # For simplicity, we'll get all client role users
        clients_result = supabase.table("users")\
            .select("id")\
            .eq("role", "client")\
            .execute()
        
        total_clients = len(clients_result.data) if clients_result.data else 0
        
        # Get active clients (clients with entries in last 30 days)
        thirty_days_ago = (datetime.utcnow() - timedelta(days=30)).isoformat()
        
        active_clients_result = supabase.table("journals")\
            .select("user_id", distinct=True)\
            .gte("created_at", thirty_days_ago)\
            .execute()
        
        active_clients = len(set([e["user_id"] for e in active_clients_result.data])) if active_clients_result.data else 0
        
        # Get recent entries (last 10)
        recent_entries_result = supabase.table("journals")\
            .select("*")\
            .order("created_at", desc=True)\
            .limit(10)\
            .execute()
        
        recent_entries = []
        if recent_entries_result.data:
            for entry in recent_entries_result.data:
                recent_entries.append(JournalEntryResponse(
                    id=entry["id"],
                    user_id=entry["user_id"],
                    content=entry["content"],
                    mood=entry.get("mood"),
                    tags=entry.get("tags"),
                    is_voice=entry.get("is_voice", False),
                    created_at=datetime.fromisoformat(entry["created_at"]),
                    ai_analysis=entry.get("ai_analysis")
                ))
        
        # Calculate mood trends (last 7 days)
        seven_days_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()
        mood_trends_result = supabase.table("journals")\
            .select("mood")\
            .gte("created_at", seven_days_ago)\
            .execute()
        
        mood_trends = defaultdict(int)
        if mood_trends_result.data:
            for entry in mood_trends_result.data:
                mood = entry.get("mood", "neutral")
                mood_trends[mood] += 1
        
        # Calculate engagement rate (clients with entries in last week / total clients)
        engagement_rate = (active_clients / total_clients * 100) if total_clients > 0 else 0.0
        
        # Log access
        log_access_event(
            therapist_id=therapist_id,
            client_id="dashboard",
            ip_address=req.client.host if req.client else None
        )
        
        return TherapistDashboardResponse(
            total_clients=total_clients,
            active_clients=active_clients,
            recent_entries=recent_entries,
            mood_trends=dict(mood_trends),
            engagement_rate=round(engagement_rate, 2)
        )
        
    except Exception as e:
        logger.error(f"Error fetching therapist dashboard: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch dashboard")


@router.get("/clients", response_model=List[ClientSummary])
async def get_clients(
    current_user: dict = Depends(get_current_therapist)
):
    """Get list of all clients with summary metrics"""
    try:
        supabase = get_supabase()
        
        # Get all clients
        clients_result = supabase.table("users")\
            .select("*")\
            .eq("role", "client")\
            .execute()
        
        if not clients_result.data:
            return []
        
        client_summaries = []
        
        for client in clients_result.data:
            client_id = client["id"]
            
            # Get journal statistics
            journals_result = supabase.table("journals")\
                .select("id, mood, created_at")\
                .eq("user_id", client_id)\
                .order("created_at", desc=True)\
                .execute()
            
            entry_count = len(journals_result.data) if journals_result.data else 0
            last_entry_date = None
            average_mood = None
            
            if journals_result.data:
                last_entry_date = datetime.fromisoformat(journals_result.data[0]["created_at"])
                
                # Calculate average mood (simplified)
                moods = [e.get("mood") for e in journals_result.data if e.get("mood")]
                if moods:
                    mood_counts = defaultdict(int)
                    for m in moods:
                        mood_counts[m] += 1
                    average_mood = max(mood_counts.items(), key=lambda x: x[1])[0] if mood_counts else None
            
            # Calculate engagement score (entries in last 7 days / 7)
            seven_days_ago = (datetime.utcnow() - timedelta(days=7)).isoformat()
            recent_entries = [e for e in (journals_result.data or []) 
                            if datetime.fromisoformat(e["created_at"]) >= datetime.fromisoformat(seven_days_ago)]
            engagement_score = min(len(recent_entries) / 7.0, 1.0) * 100
            
            client_summaries.append(ClientSummary(
                id=client_id,
                name=client.get("full_name", "Unknown"),
                email=client.get("email", ""),
                last_entry_date=last_entry_date,
                entry_count=entry_count,
                average_mood=average_mood,
                engagement_score=round(engagement_score, 2)
            ))
        
        return client_summaries
        
    except Exception as e:
        logger.error(f"Error fetching clients: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch clients")


@router.get("/clients/{client_id}/journals", response_model=List[JournalEntryResponse])
async def get_client_journals(
    client_id: str,
    req: Request,
    current_user: dict = Depends(get_current_therapist)
):
    """Get all journal entries for a specific client"""
    try:
        supabase = get_supabase()
        therapist_id = current_user["id"]
        
        # Verify client exists
        client_result = supabase.table("users")\
            .select("id, role")\
            .eq("id", client_id)\
            .single()\
            .execute()
        
        if not client_result.data or client_result.data.get("role") != "client":
            raise HTTPException(status_code=404, detail="Client not found")
        
        # Log access
        log_access_event(
            therapist_id=therapist_id,
            client_id=client_id,
            ip_address=req.client.host if req.client else None
        )
        
        # Get journal entries
        result = supabase.table("journals")\
            .select("*")\
            .eq("user_id", client_id)\
            .order("created_at", desc=True)\
            .execute()
        
        entries = []
        if result.data:
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
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching client journals: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch client journals")

