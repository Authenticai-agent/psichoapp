"""
AI service for Gemini API integration
"""

import google.generativeai as genai
from app.config import settings
from app.models import MoodAnalysis, MoodLevel, ActivitySuggestion
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)

# Initialize Gemini
genai.configure(api_key=settings.gemini_api_key)


def analyze_mood(journal_content: str) -> MoodAnalysis:
    """
    Analyze journal entry for mood, sentiment, and insights
    """
    try:
        # Use cheapest model: gemini-1.5-flash (has free tier, $0.075 per 1M input tokens)
        # Alternative: gemini-2.0-flash-lite ($0.019 per 1M tokens) if available
        model = genai.GenerativeModel(settings.gemini_model)
        
        prompt = f"""
        Analyze the following journal entry for mood and sentiment. Provide:
        1. Mood level (very_low, low, neutral, good, very_good)
        2. Sentiment score (-1 to 1, where -1 is very negative and 1 is very positive)
        3. A brief summary (2-3 sentences)
        4. Key topics/keywords (list of 5-10 words)
        5. Therapeutic recommendations (list of 2-3 actionable suggestions)
        6. Confidence level (0 to 1)
        
        Journal entry:
        {journal_content}
        
        Respond in JSON format:
        {{
            "mood": "neutral",
            "sentiment": 0.0,
            "summary": "...",
            "keywords": ["word1", "word2"],
            "recommendations": ["rec1", "rec2"],
            "confidence": 0.85
        }}
        """
        
        response = model.generate_content(prompt)
        
        # Parse response (simplified - in production, use proper JSON parsing)
        import json
        import re
        
        # Extract JSON from response
        json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
        if json_match:
            data = json.loads(json_match.group())
        else:
            # Fallback parsing
            data = parse_fallback_response(response.text)
        
        # Map mood string to MoodLevel enum
        mood_mapping = {
            "very_low": MoodLevel.VERY_LOW,
            "low": MoodLevel.LOW,
            "neutral": MoodLevel.NEUTRAL,
            "good": MoodLevel.GOOD,
            "very_good": MoodLevel.VERY_GOOD
        }
        
        mood = mood_mapping.get(data.get("mood", "neutral").lower(), MoodLevel.NEUTRAL)
        
        return MoodAnalysis(
            mood=mood,
            sentiment=float(data.get("sentiment", 0.0)),
            summary=data.get("summary", "Unable to generate summary"),
            keywords=data.get("keywords", []),
            recommendations=data.get("recommendations", []),
            confidence=float(data.get("confidence", 0.5))
        )
        
    except Exception as e:
        logger.error(f"Error in mood analysis: {str(e)}")
        # Return default analysis on error
        return MoodAnalysis(
            mood=MoodLevel.NEUTRAL,
            sentiment=0.0,
            summary="Analysis unavailable",
            keywords=[],
            recommendations=[],
            confidence=0.0
        )


def parse_fallback_response(text: str) -> Dict:
    """Fallback parser if JSON extraction fails"""
    return {
        "mood": "neutral",
        "sentiment": 0.0,
        "summary": text[:200] if text else "No summary available",
        "keywords": [],
        "recommendations": [],
        "confidence": 0.5
    }


def generate_affirmation(user_mood: MoodLevel, context: str = None) -> str:
    """
    Generate personalized daily affirmation based on mood
    """
    try:
        # Use cheapest model: gemini-1.5-flash (has free tier, $0.075 per 1M input tokens)
        # Alternative: gemini-2.0-flash-lite ($0.019 per 1M tokens) if available
        model = genai.GenerativeModel(settings.gemini_model)
        
        mood_context = {
            MoodLevel.VERY_LOW: "The user is experiencing very low mood",
            MoodLevel.LOW: "The user is experiencing low mood",
            MoodLevel.NEUTRAL: "The user is in a neutral state",
            MoodLevel.GOOD: "The user is in a good mood",
            MoodLevel.VERY_GOOD: "The user is in a very good mood"
        }
        
        prompt = f"""
        Generate a personalized, supportive, and therapeutic daily affirmation.
        
        Context: {mood_context.get(user_mood, "No specific context")}
        Additional context: {context or "None"}
        
        The affirmation should be:
        - Positive and encouraging
        - Realistic and authentic (not overly optimistic if mood is low)
        - Therapeutic and supportive
        - 1-2 sentences maximum
        
        Return only the affirmation text, no additional formatting.
        """
        
        response = model.generate_content(prompt)
        return response.text.strip()
        
    except Exception as e:
        logger.error(f"Error generating affirmation: {str(e)}")
        return "You are doing your best, and that is enough. Take it one step at a time."


def suggest_activities(user_mood: MoodLevel, therapy_goals: List[str] = None) -> List[ActivitySuggestion]:
    """
    Suggest personalized daily activities based on mood and therapy goals
    """
    try:
        # Use cheapest model: gemini-1.5-flash (has free tier, $0.075 per 1M input tokens)
        # Alternative: gemini-2.0-flash-lite ($0.019 per 1M tokens) if available
        model = genai.GenerativeModel(settings.gemini_model)
        
        goals_text = ", ".join(therapy_goals) if therapy_goals else "general wellness"
        
        prompt = f"""
        Suggest 3 personalized micro-activities for a therapy client.
        
        Mood: {user_mood.value}
        Therapy goals: {goals_text}
        
        Each activity should be:
        - Small and achievable (5-30 minutes)
        - Therapeutic and supportive
        - Appropriate for the current mood level
        - Specific and actionable
        
        Return in JSON format:
        {{
            "activities": [
                {{
                    "title": "Activity name",
                    "description": "Brief description",
                    "duration_minutes": 10,
                    "category": "mindfulness/exercise/reflection/connection"
                }}
            ]
        }}
        """
        
        response = model.generate_content(prompt)
        
        import json
        import re
        
        json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
        if json_match:
            data = json.loads(json_match.group())
            activities = []
            for act in data.get("activities", []):
                activities.append(ActivitySuggestion(
                    title=act.get("title", "Activity"),
                    description=act.get("description", ""),
                    duration_minutes=act.get("duration_minutes", 10),
                    category=act.get("category", "general")
                ))
            return activities
        else:
            # Return default activities
            return get_default_activities(user_mood)
            
    except Exception as e:
        logger.error(f"Error suggesting activities: {str(e)}")
        return get_default_activities(user_mood)


def get_default_activities(user_mood: MoodLevel) -> List[ActivitySuggestion]:
    """Default activities if AI generation fails"""
    defaults = {
        MoodLevel.VERY_LOW: [
            ActivitySuggestion(
                title="Deep Breathing",
                description="Take 5 deep breaths, counting to 4 on each inhale and exhale",
                duration_minutes=5,
                category="mindfulness"
            ),
            ActivitySuggestion(
                title="Gratitude Note",
                description="Write down one thing you're grateful for today",
                duration_minutes=5,
                category="reflection"
            )
        ],
        MoodLevel.LOW: [
            ActivitySuggestion(
                title="Gentle Walk",
                description="Take a 10-minute walk outside or around your space",
                duration_minutes=10,
                category="exercise"
            ),
            ActivitySuggestion(
                title="Mindful Moment",
                description="Spend 5 minutes noticing your surroundings without judgment",
                duration_minutes=5,
                category="mindfulness"
            )
        ],
        MoodLevel.NEUTRAL: [
            ActivitySuggestion(
                title="Reflection Journal",
                description="Write 3 sentences about how you're feeling right now",
                duration_minutes=10,
                category="reflection"
            )
        ],
        MoodLevel.GOOD: [
            ActivitySuggestion(
                title="Energy Boost",
                description="Do 5 minutes of stretching or light movement",
                duration_minutes=5,
                category="exercise"
            )
        ],
        MoodLevel.VERY_GOOD: [
            ActivitySuggestion(
                title="Share Positivity",
                description="Reach out to someone you care about with a positive message",
                duration_minutes=5,
                category="connection"
            )
        ]
    }
    
    return defaults.get(user_mood, defaults[MoodLevel.NEUTRAL])

