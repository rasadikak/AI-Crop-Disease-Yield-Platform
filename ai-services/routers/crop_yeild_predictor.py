from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pathlib import Path
import pandas as pd
import joblib
import numpy as np

BASE_DIR = Path(__file__).parent.parent
model           = joblib.load(BASE_DIR / "models" / "yield_model.pkl")
feature_columns = joblib.load(BASE_DIR / "models" / "feature_columns.pkl")

router = APIRouter(tags=["crop_yield_pred"], prefix="/crop_yield_pred")

class YieldRequest(BaseModel):
    crop: str
    year: int
    temp: float
    pesticides: float

@router.post("/")
def crop_yield_predictor(request: YieldRequest) -> dict:
    input_data = {col: 0 for col in feature_columns}

    input_data["Year"]               = request.year
    input_data["avg_temp"]           = request.temp
    input_data["pesticides_tonnes"]  = request.pesticides

    crop_column = f"Item_{request.crop}"
    if crop_column in input_data:
        input_data[crop_column] = 1
    else:
        raise HTTPException(status_code=400, detail=f"Unknown crop: {request.crop}")

    input_df = pd.DataFrame([input_data])

    prediction = model.predict(input_df)[0]

    tree_predictions = [tree.predict(input_df)[0] for tree in model.estimators_]
    lower = np.percentile(tree_predictions, 5)
    upper = np.percentile(tree_predictions, 95)

    return {
        "predicted_yield_kg_per_ha": round(float(prediction), 2),
        "confidence_low":            round(float(lower), 2),
        "confidence_high":           round(float(upper), 2)
    }