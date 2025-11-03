"""
AuthenticAI Wellness Journal - FastAPI Backend
Main application entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from app.routers import auth, journal, ai, therapist, feedback
from app.database import init_db

load_dotenv()

security = HTTPBearer()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup"""
    init_db()
    yield


app = FastAPI(
    title="AuthenticAI Wellness Journal API",
    description="HIPAA-compliant wellness journal backend",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
cors_origins_str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000")
# Add Netlify domain if not already included
default_netlify_domain = "https://psichoapp.netlify.app"
if default_netlify_domain not in cors_origins_str:
    cors_origins_str += f",{default_netlify_domain}"
cors_origins = [origin.strip() for origin in cors_origins_str.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(journal.router, prefix="/api/journal", tags=["Journal"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])
app.include_router(therapist.router, prefix="/api/therapist", tags=["Therapist"])
app.include_router(feedback.router, prefix="/api/feedback", tags=["Feedback"])


@app.get("/")
async def root():
    return {
        "message": "AuthenticAI Wellness Journal API",
        "version": "1.0.0",
        "status": "healthy"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "backend"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

