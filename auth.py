from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.database import get_db
from app.models import User, Profile
from app.schemas import UserCreate, UserResponse, UserLogin, Token, ProfileResponse, ProfileUpdate
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(User).filter(User.email == user_data.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = get_password_hash(user_data.password)
    
    # Create user. Check if this is the very first user, if so make them an admin.
    is_first_user = db.query(User).count() == 0
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        is_admin=is_first_user
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Automatically create profile
    new_profile = Profile(
        user_id=new_user.id,
        full_name=user_data.email.split("@")[0].capitalize(),
        phone="",
        bio=""
    )
    db.add(new_profile)
    db.commit()
    
    return new_user

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )
        
    access_token = create_access_token(data={"sub": user.email, "role": "admin" if user.is_admin else "user"})
    return {"access_token": access_token, "token_type": "bearer"}

# Endpoint supporting standard OAuth2 form login for Swagger UI authorization
@router.post("/token", response_model=Token, include_in_schema=False)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.email, "role": "admin" if user.is_admin else "user"})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/profile", response_model=ProfileResponse)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return profile

@router.put("/profile", response_model=ProfileResponse)
def update_profile(profile_data: ProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
        
    for key, value in profile_data.dict(exclude_unset=True).items():
        setattr(profile, key, value)
        
    db.commit()
    db.refresh(profile)
    return profile


@router.post("/register_or_update", response_model=UserResponse)
def register_or_update(user_data: UserCreate, db: Session = Depends(get_db)):
    """Create a new user or update the password for an existing user.

    This endpoint is provided for development convenience so a new tester can
    register even if the email already exists (it will update the password).
    Be cautious: in production this should be disabled or protected.
    """
    db_user = db.query(User).filter(User.email == user_data.email).first()
    hashed_password = get_password_hash(user_data.password)
    if db_user:
        # Update existing user's password and ensure active
        db_user.hashed_password = hashed_password
        db_user.is_active = True
        db.commit()
        db.refresh(db_user)
        return db_user

    # Create user normally
    is_first_user = db.query(User).count() == 0
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        is_admin=is_first_user
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # create profile
    new_profile = Profile(
        user_id=new_user.id,
        full_name=user_data.email.split('@')[0].capitalize(),
        phone='',
        bio=''
    )
    db.add(new_profile)
    db.commit()

    return new_user
