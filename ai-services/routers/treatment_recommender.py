from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from google.genai import errors as genai_errors
import os
import json
import logging
from pathlib import Path

load_dotenv()



client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

router = APIRouter(prefix="/treatment", tags=["treatment"])



DISEASE_FACTS_PATH = (
    Path(__file__).resolve().parent.parent / "treatment_reco" / "DISEASE_FACTS.json"
)

try:
    with open(DISEASE_FACTS_PATH, "r", encoding="utf-8") as f:
        DISEASE_FACTS: dict = json.load(f)
except FileNotFoundError:
    raise RuntimeError(f"DISEASE_FACTS.json not found at {DISEASE_FACTS_PATH}")
except json.JSONDecodeError as e:
    raise RuntimeError(f"DISEASE_FACTS.json is not valid JSON: {e}")


UNKNOWN_DISEASE_FALLBACK = {
    "display_name": None,
    "cause": None,
    "organic_treatment": [],
    "chemical_treatment": [],
    "prevention": [],
    "severity": "unknown",
}


SYSTEM_PROMPT = """You are AgriSense's report generator, producing a single
diagnosis explanation for a Sri Lankan farmer after their crop photo has been
analyzed by an image classification model.

You will be given: the predicted disease name, its cause, organic treatment
options, chemical treatment options, prevention tips, and severity level.

Your task: turn these facts into ONE clear, farmer-friendly report. Do not ask
questions, do not expect a reply, and do not continue a conversation — this is
a single, final message shown directly on a results screen.

Strict rules:
- Do NOT invent facts, causes, dosages, chemical names, or treatments beyond
  what is explicitly provided. If a field is missing or marked unknown, say so
  plainly rather than filling it in from general knowledge.
- If the disease facts are marked unknown/unrecognized, clearly state that a
  verified treatment isn't available for this exact diagnosis yet, and advise
  the farmer to consult their local Agriculture Extension Office.
- Structure the report with short sections (e.g. What's happening, Organic
  options, Chemical options, Prevention) so it's easy to scan on a phone.
- Keep the full report under ~150 words.
- Tone: calm, warm, and practical. State severity factually without alarming
  language.
- Always close with a line recommending the farmer confirm region-specific
  details with their local Agriculture Extension Office.
- Never ask the farmer a question or invite further chat — end with a
  statement, not a prompt for input.
"""


class DiseaseRequest(BaseModel):
    disease: str

   


def normalize_key(disease: str) -> str:
    return disease.strip().lower().replace(" ", "_")


@router.post("/")
def treatment_recommender(request: DiseaseRequest):
    key = normalize_key(request.disease)
    facts = DISEASE_FACTS.get(key)

    if facts is None:
        
        facts = {**UNKNOWN_DISEASE_FALLBACK, "display_name": request.disease}

    user_message = f"""Disease detected: {facts.get("display_name")}
Cause: {facts.get("cause")}
Organic treatment options: {facts.get("organic_treatment")}
Chemical treatment options: {facts.get("chemical_treatment")}
Prevention tips: {facts.get("prevention")}
Severity: {facts.get("severity")}

Please explain this to the farmer following your rules."""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=user_message,
            config={"system_instruction": SYSTEM_PROMPT},
        )

    except genai_errors.APIError as e:
       
        raise HTTPException(
            status_code=502,
            detail="Treatment assistant is temporarily unavailable. Please try again shortly.",
        )
    except Exception as e:
        
        raise HTTPException(
            status_code=500,
            detail="Something went wrong generating the treatment recommendation.",
        )

    if not response or not getattr(response, "text", None):
        
        raise HTTPException(
            status_code=502,
            detail="Treatment assistant returned no response. Please try again.",
        )

    return {
        "disease": facts.get("display_name"),
        "severity": facts.get("severity"),
        "facts": facts,
        "explanation": response.text,
        "is_known_disease": key in DISEASE_FACTS,
    }