from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pathlib import Path
import pandas as pd
import joblib
import numpy as np

BASE_DIR = Path(__file__).parent.parent / "crop_yield_predictor"

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

    res= {
        "predicted_yield_kg_per_ha": round(float(prediction), 2),
        "confidence_low":            round(float(lower), 2),
        "confidence_high":           round(float(upper), 2)
    }

    return res

#['Cassava', 'Maize', 'Plantains and others', 'Potatoes', 'Rice, paddy', 'Sorghum', 'Soybeans', 'Sweet potatoes']

"""
This model was trained on FAO global agricultural data (country-level
 statistics), not Sri Lanka farm-level data. So the predictions are reasonable ballpark
   figures but not precisely calibrated for Sri Lankan conditions specifically. For your
     portfolio this is fine — you can mention "trained on FAO global crop 
     yield data, with plans to retrain
 on local DOA data for production accuracy" which is a completely honest and professional framing.
"""

"""
pesticides_tonnes is the total amount of pesticides used in tonnes —
 in the original FAO dataset this was recorded as tonnes applied per country
   per year, not per farm. 
So for a prediction, you'd enter the typical pesticide usage for that crop type in that region.
"""

#pesticides=පළිබෝධනාශක