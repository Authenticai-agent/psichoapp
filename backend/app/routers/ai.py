"""
AI service routes (mood analysis, affirmations, activities)
"""

from fastapi import APIRouter, HTTPException, Depends
from app.models import AffirmationRequest, ActivitySuggestion, MoodLevel
from app.database import get_supabase
from app.utils.auth import get_current_user
from app.services.ai_service import generate_affirmation, suggest_activities, analyze_mood
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/analyze_mood")
async def analyze_mood_endpoint(
    content: str,
    current_user: dict = Depends(get_current_user)
):
    """Analyze mood from journal content"""
    try:
        analysis = analyze_mood(content)
        return {
            "mood": analysis.mood.value,
            "sentiment": analysis.sentiment,
            "summary": analysis.summary,
            "keywords": analysis.keywords,
            "recommendations": analysis.recommendations,
            "confidence": analysis.confidence
        }
    except Exception as e:
        logger.error(f"Error analyzing mood: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to analyze mood")


@router.post("/affirmation", response_model=dict)
async def get_affirmation(
    request: AffirmationRequest,
    current_user: dict = Depends(get_current_user)
):
    """Generate personalized daily affirmation"""
    try:
        # Get user's last mood from their most recent journal entry
        supabase = get_supabase()
        user_id = request.user_id or current_user["id"]
        
        # Verify access: user can only get their own affirmation, or therapist can get for their clients
        if user_id != current_user["id"] and current_user.get("role") not in ["therapist", "admin"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Get last mood
        result = supabase.table("journals")\
            .select("mood")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .limit(1)\
            .execute()
        
        last_mood = MoodLevel.NEUTRAL
        if result.data and result.data[0].get("mood"):
            try:
                last_mood = MoodLevel(result.data[0]["mood"])
            except:
                last_mood = MoodLevel.NEUTRAL
        
        affirmation = generate_affirmation(last_mood, request.context)
        
        return {
            "affirmation": affirmation,
            "mood_context": last_mood.value
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating affirmation: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate affirmation")


@router.get("/activities", response_model=List[ActivitySuggestion])
async def get_activity_suggestions(
    mood: Optional[MoodLevel] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get personalized activity suggestions"""
    try:
        # Get user's mood if not provided
        if not mood:
            supabase = get_supabase()
            user_id = current_user["id"]
            
            result = supabase.table("journals")\
                .select("mood")\
                .eq("user_id", user_id)\
                .order("created_at", desc=True)\
                .limit(1)\
                .execute()
            
            if result.data and result.data[0].get("mood"):
                try:
                    mood = MoodLevel(result.data[0]["mood"])
                except:
                    mood = MoodLevel.NEUTRAL
            else:
                mood = MoodLevel.NEUTRAL
        
        # Get therapy goals (if stored in user profile)
        supabase = get_supabase()
        user_profile = supabase.table("users").select("therapy_goals").eq("id", current_user["id"]).single().execute()
        therapy_goals = user_profile.data.get("therapy_goals", []) if user_profile.data else []
        
        activities = suggest_activities(mood, therapy_goals)
        
        return activities
        
    except Exception as e:
        logger.error(f"Error suggesting activities: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to suggest activities")

