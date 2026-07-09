from fastapi import APIRouter, Depends
from app.schemas import ChatMessage, ChatResponse
from app.auth import get_current_user
from app.chatbot import get_career_guidance_reply

router = APIRouter(prefix="/chat", tags=["Career Chatbot"])

@router.post("", response_model=ChatResponse)
def converse_with_career_coach(payload: ChatMessage, current_user = Depends(get_current_user)):
    response_data = get_career_guidance_reply(payload.message)
    return response_data
