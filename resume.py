import os
import io
import datetime
import boto3
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.config import settings
from app.models import User, Resume, Profile
from app.schemas import ResumeResponse
from app.auth import get_current_user
from app.parser import parse_resume

router = APIRouter(prefix="/resume", tags=["Resumes"])

def save_uploaded_file(file_bytes: bytes, filename: str, folder: str = "resumes") -> str:
    """
    Saves an uploaded file to S3 if configured; otherwise, saves it to the local filesystem.
    """
    # Try S3 if configurations exist
    if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY and settings.AWS_STORAGE_BUCKET_NAME:
        try:
            s3 = boto3.client(
                "s3",
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_REGION
            )
            s3_key = f"{folder}/{int(datetime.datetime.utcnow().timestamp())}_{filename}"
            s3.upload_fileobj(io.BytesIO(file_bytes), settings.AWS_STORAGE_BUCKET_NAME, s3_key)
            return f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{s3_key}"
        except Exception as e:
            # log or print error and fallback to local
            print(f"AWS S3 upload failed: {e}. Falling back to local storage.")
            
    # Local fallback
    safe_filename = f"{int(datetime.datetime.utcnow().timestamp())}_{filename.replace(' ', '_')}"
    local_path = os.path.join(settings.UPLOAD_DIR, safe_filename)
    with open(local_path, "wb") as f:
        f.write(file_bytes)
        
    # Return local relative path or virtual route url.
    # We will return the absolute local file path, but in a production setup, this would be a static URL
    return local_path

@router.post("/upload", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...), 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()
    
    if ext not in [".pdf", ".docx"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type. Only PDF and DOCX files are allowed."
        )
        
    file_bytes = await file.read()
    file_size = len(file_bytes)
    
    if file_size > 10 * 1024 * 1024:  # 10MB Limit
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum limit of 10MB."
        )
        
    # Parse resume
    try:
        parsed_data = parse_resume(file_bytes, filename, db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to parse resume: {str(e)}"
        )
        
    # Save file content (S3 or Local)
    saved_path = save_uploaded_file(file_bytes, filename, folder="resumes")
    
    # Store in database
    new_resume = Resume(
        user_id=current_user.id,
        filename=filename,
        file_path=saved_path,
        file_size=file_size,
        parsed_content=parsed_data
    )
    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)
    
    return new_resume

@router.get("/list", response_model=List[ResumeResponse])
def list_resumes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.created_at.desc()).all()

@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume(resume_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
        
    # Check ownership
    if resume.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
    return resume

@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(resume_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
        
    if resume.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
    # Attempt to delete file from disk/S3 (optional clean-up)
    if os.path.exists(resume.file_path):
        try:
            os.remove(resume.file_path)
        except Exception:
            pass
            
    db.delete(resume)
    db.commit()
    return None

@router.post("/avatar", include_in_schema=False)
@router.post("/profile-picture", status_code=status.HTTP_200_OK)
async def upload_profile_picture(
    file: UploadFile = File(...), 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()
    
    if ext not in [".jpg", ".jpeg", ".png"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported image type. Only JPG, JPEG, and PNG are allowed."
        )
        
    file_bytes = await file.read()
    saved_path = save_uploaded_file(file_bytes, filename, folder="avatars")
    
    # Update profile picture url
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
        
    profile.profile_picture_url = saved_path
    db.commit()
    
    return {"message": "Profile picture updated successfully", "url": saved_path}
