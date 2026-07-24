from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from google.genai import errors as genai_errors
import os
import json
import re

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

router = APIRouter(prefix="/treatment", tags=["treatment"])


SYSTEM_PROMPT = """You are AgriSense's plant disease advisor, generating
treatment guidance for a Sri Lankan farmer after their crop photo has been
analyzed by an image classification model.

You will be given a predicted disease name (from a plant pathology dataset,
may contain underscores or technical formatting).

Your task: respond with ONLY a single valid JSON object, no markdown, no code
fences, no extra text before or after it. The JSON must have exactly this
shape:

{
  "display_name": "Human-readable disease name, properly capitalized",
  "cause": "One sentence describing the biological cause (fungus, bacteria, virus, pest, etc.)",
  "organic_treatment": ["short actionable step", "short actionable step", "short actionable step"],
  "chemical_treatment": ["short actionable step", "short actionable step"],
  "prevention": ["short actionable step", "short actionable step", "short actionable step"],
  "severity": "mild" | "moderate" | "severe",
  "explanation": "A warm, farmer-friendly summary under 150 words, structured with short sections (What's happening, Organic options, Chemical options, Prevention). Always close by recommending the farmer confirm region-specific details with their local Agriculture Extension Office."
}

Rules:
- If the disease name looks like a real, recognized plant disease, give
  genuinely accurate agronomic information to the best of your knowledge.
- If the disease name is unclear, malformed, or you are not confident about
  it, still return the JSON shape, but set "cause" to a brief honest note
  that the exact cause isn't certain, keep treatment/prevention arrays short
  and general, and advise consulting the local Agriculture Extension Office
  in "explanation".
- Do not invent specific chemical product names or exact dosages — describe
  treatment classes/approaches instead (e.g. "copper-based fungicide" is
  fine, a specific brand name is not).
- Keep list items short — a single actionable sentence each.
- "severity" must be exactly one of: mild, moderate, severe.
- Output raw JSON only. No ```json fences, no commentary.
"""


class DiseaseRequest(BaseModel):
    disease: str


def format_disease_name(raw: str) -> str:
    """'Tomato___Target_Spot' -> 'Tomato Target Spot' (fallback only, if Gemini's display_name is missing)"""
    cleaned = re.sub(r"[_\-]+", " ", raw)
    cleaned = re.sub(r"[(),]", " ", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned.title()


def parse_gemini_json(raw_text: str) -> dict:
    """Gemini sometimes wraps JSON in ```json fences despite instructions — strip those defensively."""
    cleaned = raw_text.strip()
    cleaned = re.sub(r"^```json\s*|\s*```$", "", cleaned, flags=re.IGNORECASE).strip()
    cleaned = re.sub(r"^```\s*|\s*```$", "", cleaned).strip()
    return json.loads(cleaned)


@router.post("/")
def treatment_recommender(request: DiseaseRequest):
    if not request.disease or not request.disease.strip():
        raise HTTPException(status_code=400, detail="disease is required")

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"Predicted disease name: {request.disease}",
            config={"system_instruction": SYSTEM_PROMPT},
        )
    except genai_errors.APIError:
        raise HTTPException(
            status_code=502,
            detail="Treatment assistant is temporarily unavailable. Please try again shortly.",
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Something went wrong generating the treatment recommendation.",
        )

    if not response or not getattr(response, "text", None):
        raise HTTPException(
            status_code=502,
            detail="Treatment assistant returned no response. Please try again.",
        )

    try:
        facts = parse_gemini_json(response.text)
    except (json.JSONDecodeError, TypeError):
        
        facts = {
            "display_name": format_disease_name(request.disease),
            "cause": None,
            "organic_treatment": [],
            "chemical_treatment": [],
            "prevention": [],
            "severity": "unknown",
            "explanation": (
                f"We identified this as {format_disease_name(request.disease)}, but couldn't "
                f"generate detailed treatment guidance right now. Please consult your local "
                f"Agriculture Extension Office for advice."
            ),
        }

    
    facts.setdefault("display_name", format_disease_name(request.disease))
    facts.setdefault("cause", None)
    facts.setdefault("organic_treatment", [])
    facts.setdefault("chemical_treatment", [])
    facts.setdefault("prevention", [])
    facts.setdefault("severity", "unknown")
    facts.setdefault("explanation", "")

    return {
        "disease": facts.get("display_name"),
        "severity": facts.get("severity"),
        "facts": facts,
        "explanation": facts.get("explanation"),
    }