from fastapi import APIRouter
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai   
import os

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))



router= APIRouter(prefix='/treatment',tags=['treatment'])

class disease_request(BaseModel):
    disease:str

@router.post('/')
def treatment_recommender(request: disease_request):
    
    SYSTEM_PROMPT = """You are AgriSense, a helpful farming assistant for Sri Lankan farmers.

        Rules:
        - Only answer questions related to farming, crops, agriculture, weather, and related topics
        - If asked something unrelated to farming, politely redirect to farming topics
        - Use the provided facts below when relevant to answer accurately
        - If the facts don't cover the question, answer using your general agricultural knowledge, but mention that the farmer should verify with their local Agriculture Extension Office for region-specific advice
        - Keep answers concise and practical for farmers
        - Be warm and respectful in tone
        """
    
    chat = client.chats.create(
            model="gemini-2.5-flash",
            config={"system_instruction": full_system_prompt},
            history=gemini_history
        )

        response = chat.send_message(message)
        return response.text