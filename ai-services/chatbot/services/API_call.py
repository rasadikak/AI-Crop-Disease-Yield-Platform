import os
from google import genai   
from dotenv import load_dotenv

from chatbot.services.retrieval import search_knowledge_base


load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

SYSTEM_PROMPT = """You are AgriSense, a helpful farming assistant for Sri Lankan farmers.

Rules:
- Only answer questions related to farming, crops, agriculture, weather, and related topics
- If asked something unrelated to farming, politely redirect to farming topics
- Use the provided facts below when relevant to answer accurately
- If the facts don't cover the question, answer using your general agricultural knowledge, but mention that the farmer should verify with their local Agriculture Extension Office for region-specific advice
- Keep answers concise and practical for farmers
- Be warm and respectful in tone
"""

def get_chat_response(message: str, history: list[dict]) -> str:
    try:
       
        relevant_facts = search_knowledge_base(message, top_k=3)
    except Exception as e:
        print(f"Knowledge base search failed: {e}")
        relevant_facts = []  # fail gracefully, continue without facts

    if relevant_facts:
        facts_text = "\n".join([f"- {f['content']}" for f in relevant_facts])
        facts_section = f"\n\nRelevant facts:\n{facts_text}"
    else:
        facts_section = ""

    full_system_prompt = SYSTEM_PROMPT + facts_section

    gemini_history = []
    for msg in history:
        role = "model" if msg["role"] == "assistant" else "user"
        gemini_history.append({"role": role, "parts": [{"text": msg["content"]}]})

    try:
        chat = client.chats.create(
            model="gemini-2.5-flash",
            config={"system_instruction": full_system_prompt},
            history=gemini_history
        )

        response = chat.send_message(message)
        return response.text

    except Exception as e:
        print(f"Gemini API call failed: {e}")
        
        raise RuntimeError("Failed to get response from AI service") from e
"""
history = []

message = "what fertilizer should I use for tomatoes?"

reply = get_chat_response(message, history)

print("Farmer asked:", message)
print("\nAI replied:", reply)
    
"""
