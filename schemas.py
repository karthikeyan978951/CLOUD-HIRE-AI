from pydantic import BaseModel, EmailStr, Field
from typing import List, Dict, Optional, Any
from datetime import datetime

# --- Token & Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    is_admin: bool = False

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Profile Schemas ---
class ProfileBase(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None

class ProfileUpdate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    id: int
    user_id: int
    profile_picture_url: Optional[str] = None
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Skill Schemas ---
class SkillBase(BaseModel):
    name: str
    category: str

class SkillResponse(SkillBase):
    id: int

    class Config:
        from_attributes = True

# --- Job Role Schemas ---
class JobRoleBase(BaseModel):
    title: str
    description: Optional[str] = None
    required_skills: List[str]
    weightage: Dict[str, float]
    difficulty: str
    recommended_certifications: Optional[List[str]] = []

class JobRoleCreate(JobRoleBase):
    pass

class JobRoleResponse(JobRoleBase):
    id: int

    class Config:
        from_attributes = True

# --- Certification Schemas ---
class CertificationBase(BaseModel):
    name: str
    issuer: str
    difficulty: str
    cloud_provider: Optional[str] = None

class CertificationResponse(CertificationBase):
    id: int

    class Config:
        from_attributes = True

# --- Resume Schemas ---
class ResumeResponse(BaseModel):
    id: int
    user_id: int
    filename: str
    file_size: int
    parsed_content: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Analysis & Report Schemas ---
class ReportCreateRequest(BaseModel):
    resume_id: int
    job_role_id: int

class ScoreBreakdown(BaseModel):
    skill_match_score: float
    experience_score: float
    certification_score: float
    project_score: float
    overall_score: float

class SkillGapItem(BaseModel):
    skill: str
    status: str          # "Matched" or "Missing"
    priority: str        # "High", "Medium", "Low" or "None"

class GapAnalysisResponse(BaseModel):
    gap_percentage: float
    details: List[SkillGapItem]
    strengths: List[str]
    missing: List[str]

class ReportResponse(BaseModel):
    id: int
    user_id: int
    resume_id: int
    job_role_id: int
    job_role_title: str
    scores: ScoreBreakdown
    gap_analysis: GapAnalysisResponse
    created_at: datetime

    class Config:
        from_attributes = True

# --- Roadmap Schemas ---
class RoadmapResponse(BaseModel):
    id: int
    user_id: int
    resume_id: int
    job_role_id: int
    roadmap_data: Dict[str, Any]  # Week-by-week plan
    created_at: datetime

    class Config:
        from_attributes = True

# --- Interview Prep Schemas ---
class InterviewQuestionResponse(BaseModel):
    id: int
    skill_name: str
    question: str
    answer: str
    difficulty: str

    class Config:
        from_attributes = True

# --- Chatbot Schemas ---
class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
    suggestions: List[str] = []

# --- Trend Schemas ---
class SkillTrend(BaseModel):
    skill: str
    demand_percentage: float
    growth_rate: float

class RoleVolume(BaseModel):
    role: str
    openings: int

class JobTrendsResponse(BaseModel):
    top_skills: List[SkillTrend]
    role_volumes: List[RoleVolume]
    last_updated: str

# --- Resume Quality Evaluation Schemas ---
class CompanyAlignment(BaseModel):
    type: str
    match: str
    note: str

class CompanyAlignmentResponse(BaseModel):
    company_types: List[CompanyAlignment]
    primary_cloud_provider: Optional[str] = None
    quality_recommendation: str

class ResumeQualityResponse(BaseModel):
    quality_score: float
    quality_rating: str  # Excellent, Good, Average, Poor
    quality_color: str
    max_score: float
    issues: List[str]
    suggestions: List[str]
    strengths: List[str]
    company_alignment: CompanyAlignmentResponse
    resume_breakdown: Dict[str, float]

    class Config:
        from_attributes = True
