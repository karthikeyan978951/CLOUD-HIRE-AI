from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import User, Roadmap, Resume
from app.schemas import RoadmapResponse
from app.auth import get_current_user

router = APIRouter(prefix="/roadmap", tags=["Learning Roadmaps"])

@router.get("/resume/{resume_id}/role/{role_id}", response_model=RoadmapResponse)
def get_roadmap_by_resume_and_role(
    resume_id: int, 
    role_id: int, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    # Verify resume ownership
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
        
    if resume.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        
    roadmap = db.query(Roadmap).filter(
        Roadmap.resume_id == resume_id,
        Roadmap.job_role_id == role_id
    ).first()
    
    if not roadmap:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Roadmap not generated yet. Run analysis first."
        )
        
    return roadmap

@router.get("/user/me", response_model=List[RoadmapResponse])
def get_my_roadmaps(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Roadmap).filter(Roadmap.user_id == current_user.id).order_by(Roadmap.created_at.desc()).all()


@router.get("/user/{user_id}", response_model=List[RoadmapResponse])
def get_roadmaps_by_user(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return db.query(Roadmap).filter(Roadmap.user_id == user_id).order_by(Roadmap.created_at.desc()).all()


@router.get("/{user_id}", response_model=List[RoadmapResponse])
def get_roadmaps_by_user_id(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return db.query(Roadmap).filter(Roadmap.user_id == user_id).order_by(Roadmap.created_at.desc()).all()
