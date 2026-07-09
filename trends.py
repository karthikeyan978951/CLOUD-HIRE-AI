from fastapi import APIRouter, Depends
from app.schemas import JobTrendsResponse
from app.auth import get_current_user
from app.trends import get_market_trends

router = APIRouter(prefix="/trends", tags=["Market Trends"])

@router.get("", response_model=JobTrendsResponse)
def fetch_trends(current_user = Depends(get_current_user)):
    return get_market_trends()
