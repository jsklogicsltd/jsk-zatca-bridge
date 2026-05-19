"""Authentication API endpoints."""

from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    UserCreate, UserLogin, UserResponse, UserUpdate,
    Token, PasswordChange
)
from app.core.security import (
    verify_password, get_password_hash, create_access_token,
    get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter()


@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    Register a new user.
    
    Args:
        user_data: User registration data
        
    Returns:
        JWT token and user info
        
    Raises:
        HTTPException: If email already exists or passwords don't match
    """
    # Validate password confirmation
    if user_data.password != user_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        company_name=user_data.company_name,
        tax_id=user_data.tax_id,
        phone=user_data.phone,
        is_active=True,
        is_verified=False,
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    # Create access token
    access_token = create_access_token(subject=new_user.id)
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse(
            id=new_user.id,
            email=new_user.email,
            full_name=new_user.full_name,
            company_name=new_user.company_name,
            tax_id=new_user.tax_id,
            phone=new_user.phone,
            is_active=new_user.is_active,
            is_verified=new_user.is_verified,
            zatca_environment=new_user.zatca_environment,
            has_zatca_csid=bool(new_user.zatca_csid),
            created_at=new_user.created_at,
        )
    )


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    """
    Authenticate user and return JWT token.
    
    Args:
        credentials: Login credentials (email and password)
        
    Returns:
        JWT token and user info
        
    Raises:
        HTTPException: If credentials are invalid
    """
    # Find user by email
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated"
        )
    
    # Update last login
    user.last_login = datetime.utcnow()
    await db.commit()
    await db.refresh(user)
    
    # Create access token
    access_token = create_access_token(subject=user.id)
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            company_name=user.company_name,
            tax_id=user.tax_id,
            phone=user.phone,
            is_active=user.is_active,
            is_verified=user.is_verified,
            zatca_environment=user.zatca_environment,
            has_zatca_csid=bool(user.zatca_csid),
            created_at=user.created_at,
        )
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Get current user profile.
    
    Returns:
        Current user's profile information
    """
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        company_name=current_user.company_name,
        tax_id=current_user.tax_id,
        phone=current_user.phone,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        zatca_environment=current_user.zatca_environment,
        has_zatca_csid=bool(current_user.zatca_csid),
        created_at=current_user.created_at,
    )


@router.put("/me", response_model=UserResponse)
async def update_me(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update current user profile.
    
    Args:
        user_data: Updated user data
        
    Returns:
        Updated user profile
    """
    # Update fields if provided
    if user_data.full_name is not None:
        current_user.full_name = user_data.full_name
    if user_data.company_name is not None:
        current_user.company_name = user_data.company_name
    if user_data.tax_id is not None:
        current_user.tax_id = user_data.tax_id
    if user_data.phone is not None:
        current_user.phone = user_data.phone
    
    await db.commit()
    await db.refresh(current_user)
    
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        company_name=current_user.company_name,
        tax_id=current_user.tax_id,
        phone=current_user.phone,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        zatca_environment=current_user.zatca_environment,
        has_zatca_csid=bool(current_user.zatca_csid),
        created_at=current_user.created_at,
    )


@router.post("/change-password", response_model=dict)
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Change current user's password.
    
    Args:
        password_data: Current and new password
        
    Returns:
        Success message
        
    Raises:
        HTTPException: If current password is wrong or passwords don't match
    """
    # Verify current password
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Validate new password
    if password_data.new_password != password_data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New passwords do not match"
        )
    
    # Update password
    current_user.hashed_password = get_password_hash(password_data.new_password)
    await db.commit()
    
    return {"message": "Password changed successfully"}


@router.post("/logout", response_model=dict)
async def logout(current_user: User = Depends(get_current_user)):
    """
    Logout current user.
    
    Note: Since JWT is stateless, this just confirms logout.
    Client should remove the token.
    
    Returns:
        Success message
    """
    return {"message": "Successfully logged out"}
