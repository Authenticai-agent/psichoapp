"""
Authentication routes
"""

from fastapi import APIRouter, HTTPException, status, Request
from app.models import SignUpRequest, LoginRequest, AuthResponse
from app.database import get_supabase_client, get_supabase
from app.utils.auth import create_access_token
from app.utils.audit import log_audit_event
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/signup", response_model=AuthResponse)
async def signup(request: SignUpRequest, req: Request):
    """Register a new user (client or therapist)"""
    try:
        supabase = get_supabase_client()
        
        # Sign up with Supabase Auth
        auth_response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password
        })
        
        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user"
            )
        
        user_id = auth_response.user.id
        
        # Create user profile in users table
        supabase_admin = get_supabase()
        profile_data = {
            "id": user_id,
            "email": request.email,
            "full_name": request.full_name,
            "role": request.role.value
        }
        
        supabase_admin.table("users").insert(profile_data).execute()
        
        # Generate access token
        access_token = create_access_token({"sub": user_id, "role": request.role.value})
        
        # Log audit event
        log_audit_event(
            user_id=user_id,
            action="signup",
            resource_type="user",
            resource_id=user_id,
            ip_address=req.client.host if req.client else None,
            user_agent=req.headers.get("user-agent")
        )
        
        return AuthResponse(
            access_token=access_token,
            user={
                "id": user_id,
                "email": request.email,
                "full_name": request.full_name,
                "role": request.role.value
            }
        )
        
    except Exception as e:
        # Check if it's an auth-related error
        error_msg = str(e)
        if "auth" in error_msg.lower() or "email" in error_msg.lower() or "password" in error_msg.lower():
            logger.error(f"Auth error during signup: {error_msg}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Registration failed: {error_msg}"
            )
        logger.error(f"Error during signup: {error_msg}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during registration"
        )


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest, req: Request):
    """Login and get access token"""
    try:
        supabase = get_supabase_client()
        
        # Authenticate with Supabase
        auth_response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
        
        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        user_id = auth_response.user.id
        
        # Get user profile
        supabase_admin = get_supabase()
        user_result = supabase_admin.table("users").select("*").eq("id", user_id).single().execute()
        user_data = user_result.data
        
        # Generate access token
        access_token = create_access_token({
            "sub": user_id,
            "role": user_data.get("role", "client")
        })
        
        # Log audit event
        log_audit_event(
            user_id=user_id,
            action="login",
            resource_type="user",
            resource_id=user_id,
            ip_address=req.client.host if req.client else None,
            user_agent=req.headers.get("user-agent")
        )
        
        return AuthResponse(
            access_token=access_token,
            user=user_data
        )
        
    except Exception as e:
        # Check if it's an auth-related error
        error_msg = str(e)
        if "auth" in error_msg.lower() or "email" in error_msg.lower() or "password" in error_msg.lower() or "invalid" in error_msg.lower():
            logger.error(f"Auth error during login: {error_msg}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        logger.error(f"Error during login: {error_msg}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during login"
        )


@router.post("/logout")
async def logout(current_user: dict = None):
    """Logout (client-side token removal)"""
    # Token is stateless, so logout is handled client-side
    # In a production system, you might want to maintain a blacklist
    return {"message": "Logged out successfully"}

