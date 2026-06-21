from fastapi import FastAPI, APIRouter
from pydantic import BaseModel
from  chatbot.services import  API_call 
from API_call import get_chat_response

class ChatMessage(BaseModel):
    role: str
    content: str



class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []



class ChatResponse(BaseModel):
    reply: str

router= APIRouter(prefix="/chatbot", tags=["chatbot"])

@router.post("/", response_model=ChatResponse)
def chatbot_router(request: ChatRequest)-> str:
    
    history_dicts = [msg.model_dump() for msg in request.history]

    reply = get_chat_response(request.message, history_dicts)

    return ChatResponse(reply=reply)