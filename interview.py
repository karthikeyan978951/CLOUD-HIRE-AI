from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import InterviewQuestion
from app.schemas import InterviewQuestionResponse
from app.auth import get_current_user

router = APIRouter(prefix="/questions", tags=["Interview Preparation"])

@router.get("", response_model=List[InterviewQuestionResponse])
def get_all_questions(
    difficulty: Optional[str] = Query(None, description="Filter by Easy, Medium, or Hard"),
    db: Session = Depends(get_db)
):
    query = db.query(InterviewQuestion)
    if difficulty:
        query = query.filter(InterviewQuestion.difficulty == difficulty.capitalize())
    return query.limit(50).all()

@router.get("/{skill}", response_model=List[InterviewQuestionResponse])
def get_questions_by_skill(
    skill: str,
    difficulty: Optional[str] = Query(None, description="Filter by Easy, Medium, or Hard"),
    db: Session = Depends(get_db)
):
    # Perform case-insensitive containment check
    query = db.query(InterviewQuestion).filter(InterviewQuestion.skill_name.ilike(f"%{skill}%"))
    if difficulty:
        query = query.filter(InterviewQuestion.difficulty == difficulty.capitalize())
        
    questions = query.all()
    
    # Fallback to general questions if the specific skill has no preloaded QA
    if not questions:
        questions = db.query(InterviewQuestion).filter(
            InterviewQuestion.skill_name.in_(["AWS Lambda", "Docker", "Kubernetes", "Python"])
        ).limit(5).all()
        
    return questions
