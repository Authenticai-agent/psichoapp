"""
Pydantic models for request/response validation
"""

from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    CLIENT = "client"
    THERAPIST = "therapist"
    ADMIN = "admin"


class MoodLevel(str, Enum):
    VERY_LOW = "very_low"
    LOW = "low"
    NEUTRAL = "neutral"
    GOOD = "good"
    VERY_GOOD = "very_good"


# Authentication Models
class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole = UserRole.CLIENT


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


# Journal Models
class JournalEntryCreate(BaseModel):
    content: str
    mood: Optional[MoodLevel] = None
    tags: Optional[List[str]] = None
    is_voice: bool = False


class JournalEntryResponse(BaseModel):
    id: str
    user_id: str
    content: str
    mood: Optional[MoodLevel]
    tags: Optional[List[str]]
    is_voice: bool
    created_at: datetime
    ai_analysis: Optional[dict] = None


# AI Analysis Models
class MoodAnalysis(BaseModel):
    mood: MoodLevel
    sentiment: float  # -1 to 1
    summary: str
    keywords: List[str]
    recommendations: List[str]
    confidence: float


class AffirmationRequest(BaseModel):
    user_id: str
    context: Optional[str] = None


class ActivitySuggestion(BaseModel):
    title: str
    description: str
    duration_minutes: int
    category: str


# Therapist Models
class TherapistDashboardResponse(BaseModel):
    total_clients: int
    active_clients: int
    recent_entries: List[JournalEntryResponse]
    mood_trends: Dict[str, int]
    engagement_rate: float


class ClientSummary(BaseModel):
    id: str
    name: str
    email: str
    last_entry_date: Optional[datetime]
    entry_count: int
    average_mood: Optional[MoodLevel]
    engagement_score: float


# Feedback Models
class FeedbackCreate(BaseModel):
    client_id: str
    message: str
    entry_id: Optional[str] = None
    is_encouragement: bool = True


class FeedbackResponse(BaseModel):
    id: str
    therapist_id: str
    client_id: str
    message: str
    entry_id: Optional[str]
    is_encouragement: bool
    created_at: datetime


# Audit Log Models
class AuditLog(BaseModel):
    id: str
    user_id: str
    action: str
    resource_type: str
    resource_id: Optional[str]
    timestamp: datetime
    ip_address: Optional[str]
    user_agent: Optional[str]

