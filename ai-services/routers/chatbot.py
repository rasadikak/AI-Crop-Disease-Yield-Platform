from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from chatbot.services.API_call import get_chat_response

router = APIRouter(prefix="/chat", tags=["chatbot"])


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []


class ChatResponse(BaseModel):
    reply: str


@router.post("/", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    try:
        history_dicts = [msg.model_dump() for msg in request.history]
        reply = get_chat_response(request.message, history_dicts)
        return ChatResponse(reply=reply)

    except RuntimeError as e:
        
        raise HTTPException(status_code=503, detail=str(e))

    except Exception as e:
        
        print(f"Unexpected error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail="Something went wrong")