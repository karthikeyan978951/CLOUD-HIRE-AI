from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.database import get_db
from app.models import User, Profile, Skill, JobRole, Resume, Report, Certification
from app.schemas import JobRoleResponse, JobRoleCreate, SkillResponse, SkillBase, UserResponse, CertificationResponse, CertificationBase
from app.auth import get_current_user, get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

# --- Job Roles CRUD (Read is public to logged in users, write requires admin) ---

@router.get("/job-roles", response_model=List[JobRoleResponse])
def list_job_roles(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(JobRole).all()

@router.post("/job-roles", response_model=JobRoleResponse, status_code=status.HTTP_201_CREATED)
def create_job_role(role_data: JobRoleCreate, current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    # Check if role exists
    existing = db.query(JobRole).filter(JobRole.title == role_data.title).first()
    if existing:
        raise HTTPException(status_code=400, detail="Job Role already exists")
        
    new_role = JobRole(
        title=role_data.title,
        description=role_data.description,
        required_skills=role_data.required_skills,
        weightage=role_data.weightage,
        difficulty=role_data.difficulty,
        recommended_certifications=role_data.recommended_certifications
    )
    db.add(new_role)
    db.commit()
    db.refresh(new_role)
    return new_role

@router.put("/job-roles/{role_id}", response_model=JobRoleResponse)
def update_job_role(
    role_id: int, 
    role_data: JobRoleCreate, 
    current_admin: User = Depends(get_current_admin), 
    db: Session = Depends(get_db)
):
    role = db.query(JobRole).filter(JobRole.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Job Role not found")
        
    role.title = role_data.title
    role.description = role_data.description
    role.required_skills = role_data.required_skills
    role.weightage = role_data.weightage
    role.difficulty = role_data.difficulty
    role.recommended_certifications = role_data.recommended_certifications
    
    db.commit()
    db.refresh(role)
    return role

@router.delete("/job-roles/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job_role(role_id: int, current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    role = db.query(JobRole).filter(JobRole.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Job Role not found")
    db.delete(role)
    db.commit()
    return None

# --- Skill Management ---

@router.get("/skills", response_model=List[SkillResponse])
def list_skills(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Skill).all()

@router.post("/skills", response_model=SkillResponse, status_code=status.HTTP_201_CREATED)
def create_skill(skill_data: SkillBase, current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    existing = db.query(Skill).filter(Skill.name == skill_data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Skill already exists")
        
    new_skill = Skill(name=skill_data.name, category=skill_data.category)
    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)
    return new_skill

# --- User Management & Statistics ---

@router.get("/users", response_model=List[UserResponse])
def get_all_users(current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    return db.query(User).all()


@router.get("/certifications", response_model=List[CertificationResponse])
def list_certifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Certification).all()


@router.post("/certifications", response_model=CertificationResponse, status_code=status.HTTP_201_CREATED)
def create_certification(cert_data: CertificationBase, current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    existing = db.query(Certification).filter(Certification.name == cert_data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Certification already exists")

    certification = Certification(
        name=cert_data.name,
        issuer=cert_data.issuer,
        difficulty=cert_data.difficulty,
        cloud_provider=cert_data.cloud_provider
    )
    db.add(certification)
    db.commit()
    db.refresh(certification)
    return certification

@router.put("/users/{user_id}/toggle-active", response_model=UserResponse)
def toggle_user_active(user_id: int, current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_admin.id:
        raise HTTPException(status_code=400, detail="Cannot disable your own admin account")
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    return user

@router.get("/stats", response_model=Dict[str, Any])
def get_system_stats(current_admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    total_resumes = db.query(Resume).count()
    total_reports = db.query(Report).count()
    total_roles = db.query(JobRole).count()
    
    # Calculate average scores
    reports = db.query(Report).all()
    avg_score = 0.0
    if reports:
        avg_score = sum(r.scores.get("overall_score", 0.0) for r in reports) / len(reports)
        
    return {
        "total_users": total_users,
        "total_resumes": total_resumes,
        "total_reports": total_reports,
        "total_job_roles": total_roles,
        "average_match_score": round(avg_score, 1)
    }
